import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import OrdersFilter from '@/components/OrdersFilter';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { fetchOrders, mapOrderStatus, type Order } from '@/lib/api';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

export default function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: fetchOrders,
  });

  const orders = ordersData?.orders || [];

  const filteredOrders = orders.filter(order => {
    const orderId = order.apiOrderId || order.id;
    const matchesSearch = !searchQuery || 
      order.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      orderId.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || mapOrderStatus(order.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = () => {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
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
                serviceName={order.serviceName}
                platform={detectPlatform(order.serviceName)}
                link={order.link}
                quantity={order.quantity}
                startCount={order.startCount}
                remains={order.remains}
                status={mapOrderStatus(order.status)}
                price={order.charge}
                date={formatDate()}
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
