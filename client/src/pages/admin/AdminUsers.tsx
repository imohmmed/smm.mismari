import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Minus, 
  User,
  Mail,
  Phone,
  DollarSign,
  Loader2
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
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
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
  });

  const balanceMutation = useMutation({
    mutationFn: async ({ userId, amount, operation }: { userId: string; amount: number; operation: "add" | "subtract" }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/balance`, { amount, operation });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t("success") });
      setBalanceDialogOpen(false);
      setSelectedUser(null);
      setBalanceAmount("");
    },
    onError: (error: any) => {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    },
  });

  const handleBalanceUpdate = () => {
    if (!selectedUser || !balanceAmount) return;
    
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: t("error"), description: "Invalid amount", variant: "destructive" });
      return;
    }

    balanceMutation.mutate({
      userId: selectedUser.id,
      amount,
      operation: balanceOperation,
    });
  };

  const openBalanceDialog = (user: UserData, operation: "add" | "subtract") => {
    setSelectedUser(user);
    setBalanceOperation(operation);
    setBalanceAmount("");
    setBalanceDialogOpen(true);
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
              No users found
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{user.username}</span>
                        {user.role === "admin" && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Admin
                          </span>
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
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => openBalanceDialog(user, "add")}
                        className="gap-1"
                        data-testid={`button-add-balance-${user.id}`}
                      >
                        <Plus className="w-3 h-3" />
                        {t("addBalance")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openBalanceDialog(user, "subtract")}
                        className="gap-1"
                        data-testid={`button-subtract-balance-${user.id}`}
                      >
                        <Minus className="w-3 h-3" />
                        {t("subtractBalance")}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {balanceOperation === "add" ? t("addBalance") : t("subtractBalance")}
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
    </div>
  );
}
