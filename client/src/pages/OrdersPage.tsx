import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import OrdersFilter from '@/components/OrdersFilter';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import { Card } from '@/components/ui/card';

// todo: remove mock functionality - replace with API data
const mockOrders = [
  {
    id: 123456,
    serviceName: 'مشاهدات فيديو انستجرام',
    platform: 'instagram',
    link: 'https://instagram.com/p/xyz',
    quantity: 10000,
    startCount: 5000,
    remains: 2500,
    status: 'inProgress' as const,
    price: 0.0150,
    date: '27-11-2025'
  },
  {
    id: 123455,
    serviceName: 'متابعين تيك توك',
    platform: 'tiktok',
    link: 'https://tiktok.com/@user',
    quantity: 5000,
    status: 'completed' as const,
    price: 0.0250,
    date: '26-11-2025'
  },
  {
    id: 123454,
    serviceName: 'لايكات يوتيوب',
    platform: 'youtube',
    link: 'https://youtube.com/watch?v=xyz',
    quantity: 1000,
    status: 'pending' as const,
    price: 0.0080,
    date: '25-11-2025'
  }
];

// todo: remove mock functionality - use real user data
const mockUsername = 'imohmmed';
const hasOrders = true; // toggle to test empty state

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

export default function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.serviceName.includes(searchQuery) || 
      order.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!hasOrders) {
    return (
      <Card>
        <EmptyState
          type="orders"
          username={mockUsername}
          onAction={() => onNavigate('newOrder')}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <OrdersFilter
        onSearch={setSearchQuery}
        onFilterChange={setStatusFilter}
      />

      <div className="space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              {...order}
            />
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            لا توجد نتائج للبحث
          </Card>
        )}
      </div>
    </div>
  );
}
