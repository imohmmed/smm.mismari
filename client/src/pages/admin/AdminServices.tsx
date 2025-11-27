import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Search, 
  Plus, 
  Trash2,
  Loader2,
  Check,
  X
} from "lucide-react";
import { SiInstagram, SiYoutube, SiFacebook, SiTiktok, SiTwitter, SiTelegram, SiSnapchat } from "react-icons/si";

const platforms = [
  { id: "instagram", name: "Instagram", icon: SiInstagram, color: "#E4405F" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, color: "#FF0000" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, color: "#1877F2" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "#000000" },
  { id: "twitter", name: "Twitter", icon: SiTwitter, color: "#1DA1F2" },
  { id: "telegram", name: "Telegram", icon: SiTelegram, color: "#26A5E4" },
  { id: "snapchat", name: "Snapchat", icon: SiSnapchat, color: "#FFFC00" },
];

interface CuratedService {
  id: number;
  serviceId: number;
  platform: string;
  category: string;
  serviceName: string;
  rate: string;
  min: number;
  max: number;
  active: boolean;
  addedAt: string;
}

interface ServiceLookup {
  id: number;
  name: string;
  rate: string;
  rateWithMarkup: number;
  min: string | number;
  max: string | number;
  category: string;
  platform: string;
}

export default function AdminServices() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [serviceId, setServiceId] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [lookupResult, setLookupResult] = useState<ServiceLookup | null>(null);
  const [isLooking, setIsLooking] = useState(false);

  const { data, isLoading } = useQuery<{ services: CuratedService[] }>({
    queryKey: ["/api/admin/services"],
  });

  const addServiceMutation = useMutation({
    mutationFn: async (data: { serviceId: number; platform: string; category: string }) => {
      const res = await apiRequest("POST", "/api/admin/services", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: t("success") });
      setServiceId("");
      setSelectedPlatform("");
      setCategory("");
      setLookupResult(null);
    },
    onError: (error: any) => {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/services/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: t("success") });
    },
    onError: (error: any) => {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    },
  });

  const handleLookup = async () => {
    if (!serviceId) return;
    
    setIsLooking(true);
    try {
      const res = await fetch(`/api/admin/service-lookup/${serviceId}`);
      const data = await res.json();
      
      if (data.error) {
        toast({ title: t("serviceNotFound"), variant: "destructive" });
        setLookupResult(null);
      } else {
        setLookupResult(data.service);
        if (data.service.platform) {
          setSelectedPlatform(data.service.platform);
        }
        if (data.service.category) {
          setCategory(data.service.category);
        }
        toast({ title: t("serviceFound") });
      }
    } catch (error) {
      toast({ title: t("error"), variant: "destructive" });
      setLookupResult(null);
    } finally {
      setIsLooking(false);
    }
  };

  const handleAddService = () => {
    if (!serviceId || !selectedPlatform || !category) {
      toast({ title: t("error"), description: "Please fill all fields", variant: "destructive" });
      return;
    }

    addServiceMutation.mutate({
      serviceId: parseInt(serviceId),
      platform: selectedPlatform,
      category,
    });
  };

  const services = data?.services || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t("addService")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t("serviceId")}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="12345"
                  data-testid="input-service-id"
                />
                <Button
                  variant="outline"
                  onClick={handleLookup}
                  disabled={isLooking || !serviceId}
                  data-testid="button-lookup-service"
                >
                  {isLooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("platform")}</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger data-testid="select-platform">
                  <SelectValue placeholder={t("selectPlatform")} />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <p.icon style={{ color: p.color }} className="w-4 h-4" />
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("category")}</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category name"
                data-testid="input-category"
              />
            </div>
          </div>

          {lookupResult && (
            <Card className="bg-muted p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm mb-1">{lookupResult.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Rate: ${lookupResult.rate}</span>
                    <span>{t("priceWithProfit")}: ${lookupResult.rateWithMarkup.toFixed(4)}</span>
                    <span>Min: {lookupResult.min}</span>
                    <span>Max: {lookupResult.max}</span>
                  </div>
                </div>
                <Check className="w-5 h-5 text-green-500" />
              </div>
            </Card>
          )}

          <Button
            onClick={handleAddService}
            disabled={addServiceMutation.isPending || !serviceId || !selectedPlatform || !category}
            className="w-full"
            data-testid="button-add-service"
          >
            {addServiceMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {t("addService")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t("addedServices")} ({services.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noServices")}
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => {
                const platformInfo = platforms.find(p => p.id === service.platform);
                const PlatformIcon = platformInfo?.icon || Package;
                
                return (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${platformInfo?.color}20` }}
                        >
                          <PlatformIcon 
                            style={{ color: platformInfo?.color }} 
                            className="w-5 h-5" 
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{service.serviceName}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {service.serviceId} | {service.category}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Rate: ${service.rate} | Min: {service.min} | Max: {service.max}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteServiceMutation.mutate(service.id)}
                        disabled={deleteServiceMutation.isPending}
                        data-testid={`button-delete-service-${service.id}`}
                      >
                        {deleteServiceMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
