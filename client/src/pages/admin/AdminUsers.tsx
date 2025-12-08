import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Minus, 
  User,
  Mail,
  Phone,
  DollarSign,
  Loader2,
  Trash2,
  Shield,
  ShieldOff,
  Percent
} from "lucide-react";
import { format } from "date-fns";

interface UserData {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  balance: number;
  totalSpent: number;
  discount: number;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userActionsOpen, setUserActionsOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [balanceOperation, setBalanceOperation] = useState<"add" | "subtract">("add");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/users", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/admin/users?search=${encodeURIComponent(searchQuery)}`
        : "/api/admin/users";
      const res = await fetch(url);
      return res.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - reduces refetching
  });

  const balanceMutation = useMutation({
    mutationFn: async ({ userId, amount, operation }: { userId: string; amount: number; operation: "add" | "subtract" }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/balance`, { amount, operation });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم بنجاح" });
      setBalanceDialogOpen(false);
      setUserActionsOpen(false);
      setSelectedUser(null);
      setBalanceAmount("");
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم تحديث الصلاحيات" });
      setUserActionsOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم حذف المستخدم" });
      setDeleteDialogOpen(false);
      setUserActionsOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const discountMutation = useMutation({
    mutationFn: async ({ userId, discount }: { userId: string; discount: number }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/discount`, { discount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم تحديث الخصم" });
      setDiscountDialogOpen(false);
      setUserActionsOpen(false);
      setSelectedUser(null);
      setDiscountAmount("");
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const handleBalanceUpdate = () => {
    if (!selectedUser || !balanceAmount) return;
    
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "خطأ", description: "المبلغ غير صالح", variant: "destructive" });
      return;
    }

    balanceMutation.mutate({
      userId: selectedUser.id,
      amount,
      operation: balanceOperation,
    });
  };

  const openBalanceDialog = (operation: "add" | "subtract") => {
    setBalanceOperation(operation);
    setBalanceAmount("");
    setBalanceDialogOpen(true);
  };

  const openDiscountDialog = () => {
    setDiscountAmount(selectedUser?.discount?.toString() || "0");
    setDiscountDialogOpen(true);
  };

  const handleDiscountUpdate = () => {
    if (!selectedUser) return;
    
    const discount = parseFloat(discountAmount);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast({ title: "خطأ", description: "نسبة الخصم يجب أن تكون بين 0 و 100", variant: "destructive" });
      return;
    }

    discountMutation.mutate({
      userId: selectedUser.id,
      discount,
    });
  };

  const handleUserClick = (user: UserData) => {
    setSelectedUser(user);
    setUserActionsOpen(true);
  };

  const users: UserData[] = data?.users || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("users")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchUsers")}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد مستخدمين
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Card 
                  key={user.id} 
                  className="p-4 cursor-pointer hover-elevate"
                  onClick={() => handleUserClick(user)}
                  data-testid={`user-card-${user.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{user.username}</span>
                        {user.role === "admin" && (
                          <Badge className="bg-primary text-primary-foreground">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-green-500">${user.balance.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">
                          | {t("totalSpent")}: ${user.totalSpent.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t("memberSince")}: {format(new Date(user.createdAt), "yyyy-MM-dd")}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={userActionsOpen} onOpenChange={setUserActionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إدارة المستخدم</DialogTitle>
            <DialogDescription>
              {selectedUser?.username} - {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{selectedUser.username}</span>
                  <div className="flex items-center gap-2">
                    {selectedUser.discount > 0 && (
                      <Badge className="bg-orange-500 text-white">
                        خصم {selectedUser.discount}%
                      </Badge>
                    )}
                    {selectedUser.role === "admin" && (
                      <Badge className="bg-primary">Admin</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <p className="text-lg font-bold text-green-500 mt-2">
                  الرصيد: ${selectedUser.balance.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  إجمالي الإنفاق: ${selectedUser.totalSpent.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => openBalanceDialog("add")}
                  className="gap-2"
                  data-testid="button-add-balance"
                >
                  <Plus className="w-4 h-4" />
                  إضافة رصيد
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openBalanceDialog("subtract")}
                  className="gap-2"
                  data-testid="button-subtract-balance"
                >
                  <Minus className="w-4 h-4" />
                  خصم رصيد
                </Button>
              </div>

              <Button
                variant="secondary"
                onClick={openDiscountDialog}
                className="w-full gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                data-testid="button-set-discount"
              >
                <Percent className="w-4 h-4" />
                تعديل الخصم ({selectedUser.discount}%)
              </Button>

              <div className="grid grid-cols-2 gap-2">
                {selectedUser.role === "admin" ? (
                  <Button
                    variant="outline"
                    onClick={() => roleMutation.mutate({ userId: selectedUser.id, role: "user" })}
                    disabled={roleMutation.isPending}
                    className="gap-2"
                    data-testid="button-remove-admin"
                  >
                    {roleMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldOff className="w-4 h-4" />
                    )}
                    إزالة الأدمن
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => roleMutation.mutate({ userId: selectedUser.id, role: "admin" })}
                    disabled={roleMutation.isPending}
                    className="gap-2"
                    data-testid="button-make-admin"
                  >
                    {roleMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    جعله أدمن
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-2"
                  data-testid="button-delete-user"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف المستخدم
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {balanceOperation === "add" ? "إضافة رصيد" : "خصم رصيد"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{selectedUser.username}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <p className="text-lg font-bold text-green-500 mt-2">
                  ${selectedUser.balance.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("amount")}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                    data-testid="input-balance-amount"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setBalanceDialogOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleBalanceUpdate}
                  disabled={balanceMutation.isPending}
                  data-testid="button-confirm-balance"
                >
                  {balanceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t("confirm")
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الخصم</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{selectedUser.username}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <p className="text-lg font-bold text-orange-500 mt-2">
                  الخصم الحالي: {selectedUser.discount}%
                </p>
              </div>

              <div className="space-y-2">
                <Label>نسبة الخصم (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="pl-10"
                    placeholder="0"
                    data-testid="input-discount-amount"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  سيتم خصم هذه النسبة من سعر كل طلب للمستخدم
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDiscountDialogOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleDiscountUpdate}
                  disabled={discountMutation.isPending}
                  data-testid="button-confirm-discount"
                >
                  {discountMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t("confirm")
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المستخدم "{selectedUser?.username}"؟
              <br />
              سيتم حذف جميع طلباته أيضاً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
