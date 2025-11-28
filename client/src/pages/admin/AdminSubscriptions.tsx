import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image, 
  Clock, 
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Subscription {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  deliveryTime: string;
  price: number;
  isActive: number;
  createdAt: string;
}

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    deliveryTime: "",
    price: "",
  });

  const { data, isLoading } = useQuery<{ subscriptions: Subscription[] }>({
    queryKey: ["/api/admin/subscriptions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/admin/subscriptions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "تم بنجاح", description: "تم إضافة الاشتراك بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل إضافة الاشتراك", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/admin/subscriptions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      setEditingSubscription(null);
      resetForm();
      toast({ title: "تم بنجاح", description: "تم تحديث الاشتراك بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل تحديث الاشتراك", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/admin/subscriptions/${id}/toggle`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      toast({ title: "تم بنجاح", description: "تم تغيير حالة الاشتراك" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل تغيير الحالة", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/subscriptions/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      setDeleteId(null);
      toast({ title: "تم بنجاح", description: "تم حذف الاشتراك" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل حذف الاشتراك", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      deliveryTime: "",
      price: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.deliveryTime || !formData.price) {
      toast({ title: "خطأ", description: "جميع الحقول مطلوبة", variant: "destructive" });
      return;
    }

    if (editingSubscription) {
      updateMutation.mutate({ id: editingSubscription.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (subscription: Subscription) => {
    setFormData({
      name: subscription.name,
      description: subscription.description,
      imageUrl: subscription.imageUrl || "",
      deliveryTime: subscription.deliveryTime,
      price: subscription.price.toString(),
    });
    setEditingSubscription(subscription);
  };

  const subscriptions = data?.subscriptions || [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="w-5 h-5" />
          الاشتراكات
        </h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-subscription">
              <Plus className="w-4 h-4" />
              إضافة اشتراك
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة اشتراك جديد</DialogTitle>
            </DialogHeader>
            <SubscriptionForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending}
              submitLabel="إضافة"
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : subscriptions.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">لا توجد اشتراكات بعد</p>
          <p className="text-sm text-muted-foreground mt-2">اضغط على "إضافة اشتراك" لإنشاء أول اشتراك</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              {subscription.imageUrl && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={subscription.imageUrl}
                    alt={subscription.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg">{subscription.name}</h3>
                  <Badge variant={subscription.isActive ? "default" : "secondary"}>
                    {subscription.isActive ? "نشط" : "متوقف"}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {subscription.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{subscription.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span>${subscription.price.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => toggleMutation.mutate(subscription.id)}
                    disabled={toggleMutation.isPending}
                    data-testid={`button-toggle-${subscription.id}`}
                  >
                    {subscription.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        إيقاف
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        تفعيل
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(subscription)}
                    data-testid={`button-edit-${subscription.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(subscription.id)}
                    data-testid={`button-delete-${subscription.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الاشتراك</DialogTitle>
          </DialogHeader>
          <SubscriptionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            submitLabel="حفظ التغييرات"
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الاشتراك</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الاشتراك؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
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

interface SubscriptionFormProps {
  formData: {
    name: string;
    description: string;
    imageUrl: string;
    deliveryTime: string;
    price: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel: string;
}

function SubscriptionForm({ formData, setFormData, onSubmit, isLoading, submitLabel }: SubscriptionFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم الاشتراك</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="مثال: باقة المتابعين الذهبية"
          data-testid="input-subscription-name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="وصف تفصيلي للاشتراك..."
          rows={3}
          data-testid="input-subscription-description"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          رابط الصورة (اختياري)
        </Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
          data-testid="input-subscription-image"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deliveryTime" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            مدة التسليم
          </Label>
          <Input
            id="deliveryTime"
            value={formData.deliveryTime}
            onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
            placeholder="مثال: 1-2 ساعة"
            data-testid="input-subscription-delivery"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            السعر ($)
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            data-testid="input-subscription-price"
          />
        </div>
      </div>
      
      <Button 
        className="w-full" 
        onClick={onSubmit}
        disabled={isLoading}
        data-testid="button-submit-subscription"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
