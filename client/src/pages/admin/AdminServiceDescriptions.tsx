import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
  Loader2,
  FileText,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ServiceDescription {
  id: number;
  serviceId: number;
  description: string;
  updatedAt: string;
}

interface Service {
  service: number;
  name: string;
  category: string;
}

export default function AdminServiceDescriptions() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDescription, setEditingDescription] = useState<ServiceDescription | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    serviceId: "",
    description: "",
  });

  const { data: descriptionsData, isLoading: isLoadingDescriptions } = useQuery<{ descriptions: ServiceDescription[] }>({
    queryKey: ["/api/admin/service-descriptions"],
  });

  const { data: servicesData } = useQuery<{ services: Service[] }>({
    queryKey: ["/api/services"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/admin/service-descriptions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-descriptions"] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "تم بنجاح", description: "تم إضافة وصف الخدمة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل إضافة وصف الخدمة", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ serviceId, description }: { serviceId: number; description: string }) => {
      const res = await apiRequest("POST", "/api/admin/service-descriptions", { serviceId, description });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-descriptions"] });
      setEditingDescription(null);
      resetForm();
      toast({ title: "تم بنجاح", description: "تم تحديث وصف الخدمة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل تحديث وصف الخدمة", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/service-descriptions/${serviceId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-descriptions"] });
      setDeleteId(null);
      toast({ title: "تم بنجاح", description: "تم حذف وصف الخدمة" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل حذف وصف الخدمة", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      serviceId: "",
      description: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.serviceId || !formData.description) {
      toast({ title: "خطأ", description: "جميع الحقول مطلوبة", variant: "destructive" });
      return;
    }

    if (editingDescription) {
      updateMutation.mutate({ 
        serviceId: editingDescription.serviceId, 
        description: formData.description 
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (description: ServiceDescription) => {
    setFormData({
      serviceId: description.serviceId.toString(),
      description: description.description,
    });
    setEditingDescription(description);
  };

  const descriptions = descriptionsData?.descriptions || [];
  const services = servicesData?.services || [];

  const getServiceName = (serviceId: number): string => {
    const service = services.find(s => s.service === serviceId);
    return service?.name || `خدمة #${serviceId}`;
  };

  const filteredDescriptions = descriptions.filter(d => {
    const serviceName = getServiceName(d.serviceId);
    return (
      serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.serviceId.toString().includes(searchQuery) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          أوصاف الخدمات
        </h2>
        <Button 
          className="gap-2" 
          onClick={() => setIsCreateOpen(true)}
          data-testid="button-add-description"
        >
          <Plus className="w-4 h-4" />
          إضافة وصف
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ابحث برقم الخدمة أو الاسم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
          data-testid="input-search-descriptions"
        />
      </div>

      {isLoadingDescriptions ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredDescriptions.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد أوصاف خدمات بعد"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            اضغط على "إضافة وصف" لإنشاء أول وصف خدمة
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDescriptions.map((desc) => (
            <Card key={desc.id} className="overflow-hidden">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="font-mono">
                        #{desc.serviceId}
                      </Badge>
                      <span className="font-semibold text-sm truncate">
                        {getServiceName(desc.serviceId)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                      {desc.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(desc)}
                      data-testid={`button-edit-${desc.serviceId}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(desc.serviceId)}
                      data-testid={`button-delete-${desc.serviceId}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة وصف خدمة</DialogTitle>
          </DialogHeader>
          <DescriptionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
            submitLabel="إضافة"
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingDescription} onOpenChange={(open) => !open && setEditingDescription(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل وصف الخدمة #{editingDescription?.serviceId}</DialogTitle>
          </DialogHeader>
          <DescriptionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            submitLabel="حفظ التغييرات"
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف وصف الخدمة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف وصف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.
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

interface DescriptionFormProps {
  formData: {
    serviceId: string;
    description: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel: string;
  isEdit: boolean;
}

function DescriptionForm({ formData, setFormData, onSubmit, isLoading, submitLabel, isEdit }: DescriptionFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="serviceId">رقم الخدمة</Label>
        <Input
          id="serviceId"
          type="number"
          value={formData.serviceId}
          onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
          placeholder="مثال: 18377"
          disabled={isEdit}
          data-testid="input-service-id"
        />
        <p className="text-xs text-muted-foreground">
          ادخل رقم الخدمة من Amazing SMM
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="وصف تفصيلي للخدمة..."
          rows={6}
          data-testid="input-description"
        />
        <p className="text-xs text-muted-foreground">
          يمكنك نسخ الوصف من موقع Amazing SMM
        </p>
      </div>
      
      <Button 
        className="w-full" 
        onClick={onSubmit}
        disabled={isLoading}
        data-testid="button-submit-description"
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
