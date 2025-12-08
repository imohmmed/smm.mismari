import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Loader2,
  ExternalLink,
  Clock
} from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: number;
  userId: string;
  serviceId: number;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  status: string;
  apiOrderId: number | null;
  startCount: number | null;
  remains: number | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  "In progress": "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  Completed: "bg-green-500/20 text-green-700 dark:text-green-400",
  Partial: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  Canceled: "bg-red-500/20 text-red-700 dark:text-red-400",
  Refunded: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  Processing: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-400",
};

export default function AdminOrders() {
  const { t } = useLanguage();

  const { data, isLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ["/api/admin/orders"],
    staleTime: 2 * 60 * 1000, // 2 minutes - reduces refetching
  });

  const orders = data?.orders || [];

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      Pending: t("pending"),
      "In progress": t("inProgress"),
      Completed: t("completed"),
      Partial: t("partial"),
      Canceled: t("cancelled"),
      Refunded: "Refunded",
      Processing: t("processing"),
    };
    return statusMap[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          {t("allOrders")} ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noOrders")}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">#{order.id}</span>
                      {order.apiOrderId && (
                        <span className="text-xs text-muted-foreground">
                          (API: #{order.apiOrderId})
                        </span>
                      )}
                      <Badge className={statusColors[order.status] || "bg-gray-500/20"}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium mb-1 line-clamp-1">
                      {order.serviceName}
                    </p>
                    
                    <a 
                      href={order.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{order.link}</span>
                    </a>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <span>{t("quantity")}: {order.quantity}</span>
                      <span>{t("totalAmount")}: ${order.charge.toFixed(4)}</span>
                      {order.startCount !== null && (
                        <span>Start: {order.startCount}</span>
                      )}
                      {order.remains !== null && (
                        <span>Remains: {order.remains}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Clock className="w-3 h-3" />
                      {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
