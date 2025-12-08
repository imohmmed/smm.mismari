import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import OrdersFilter from '@/components/OrdersFilter';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { fetchOrders, mapOrderStatus, type Order } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
  onRepeatOrder?: (serviceId: number, link: string, quantity: number) => void;
}

export default function OrdersPage({ onNavigate, onRepeatOrder }: OrdersPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: ordersData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: fetchOrders,
    enabled: !!user,
    retry: false,
    staleTime: 60000, // 1 minute stale time
    refetchIntervalInBackground: false,
  });

  const orders = ordersData?.orders || [];
  
  // Check if there are pending/processing orders that need polling
  const hasPendingOrders = orders.some(order => 
    ['Pending', 'In progress', 'Processing', 'Partial'].includes(order.status)
  );
  
  // Separate polling query - only runs when there are pending orders
  useQuery({
    queryKey: ['/api/orders', 'auto-refresh'],
    queryFn: async () => {
      const data = await fetchOrders();
      return data;
    },
    enabled: !!user && hasPendingOrders && orders.length > 0,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });

  // Show empty state if user is not logged in or there's an error
  if (!user || error) {
    return (
      <div className="space-y-4 pb-4" dir="rtl">
        <Card>
          <EmptyState
            type="orders"
            onAction={() => onNavigate('newOrder')}
          />
        </Card>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const orderId = order.apiOrderId || order.id;
    const matchesSearch = !searchQuery || 
      order.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      orderId.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || mapOrderStatus(order.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleRepeatOrder = (serviceId: number, link: string, quantity: number) => {
    if (onRepeatOrder) {
      onRepeatOrder(serviceId, link, quantity);
      onNavigate('newOrder');
    } else {
      toast({
        title: 'تكرار الطلب',
        description: 'يرجى الانتقال لصفحة الطلب الجديد',
      });
      onNavigate('newOrder');
    }
  };

  const detectPlatform = (name: string): string => {
    const text = name.toLowerCase();
    if (text.includes('instagram') || text.includes('انستجرام')) return 'instagram';
    if (text.includes('youtube') || text.includes('يوتيوب')) return 'youtube';
    if (text.includes('tiktok') || text.includes('تيك توك')) return 'tiktok';
    if (text.includes('facebook') || text.includes('فيسبوك')) return 'facebook';
    if (text.includes('twitter') || text.includes('تويتر')) return 'twitter';
    if (text.includes('telegram') || text.includes('تليجرام')) return 'telegram';
    return 'instagram';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4" dir="rtl">
      <OrdersFilter
        onSearch={setSearchQuery}
        onFilterChange={setStatusFilter}
      />

      {orders.length === 0 ? (
        <Card>
          <EmptyState
            type="orders"
            username={user?.username}
            onAction={() => onNavigate('newOrder')}
          />
        </Card>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const displayOrderId = order.apiOrderId || order.id;
            return (
              <OrderCard
                key={displayOrderId}
                id={displayOrderId}
                serviceId={order.serviceId}
                serviceName={order.serviceName}
                platform={detectPlatform(order.serviceName)}
                link={order.link}
                quantity={order.quantity}
                startCount={order.startCount}
                remains={order.remains}
                status={mapOrderStatus(order.status)}
                price={order.charge}
                date={formatDate(order.createdAt)}
                onRepeat={handleRepeatOrder}
              />
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          لا توجد نتائج للبحث
        </Card>
      )}
    </div>
  );
}
