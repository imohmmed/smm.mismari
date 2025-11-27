import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import BalanceCard from '@/components/BalanceCard';
import PlatformGrid, { type Platform } from '@/components/PlatformGrid';
import OrderForm from '@/components/OrderForm';
import ServiceInfoTabs from '@/components/ServiceInfoTabs';
import ServiceCard from '@/components/ServiceCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, ShoppingCart, ListOrdered, Package, Loader2 } from 'lucide-react';
import { fetchServices, fetchBalance, createOrder, type Service } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [activeTab, setActiveTab] = useState('newOrder');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  // Fetch services from API
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services', selectedPlatform],
    queryFn: () => fetchServices(selectedPlatform || undefined),
  });

  // Fetch balance
  const { data: balanceData } = useQuery({
    queryKey: ['/api/balance'],
    queryFn: fetchBalance,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      toast({
        title: 'تم إنشاء الطلب بنجاح',
        description: `رقم الطلب: ${data.order.orderId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balance'] });
    },
    onError: (error) => {
      toast({
        title: 'فشل إنشاء الطلب',
        description: error instanceof Error ? error.message : 'حدث خطأ',
        variant: 'destructive',
      });
    },
  });

  const services = servicesData?.services || [];
  const categories = servicesData?.categories || [];

  // Filter services based on search
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchQuery || 
      service.name.includes(searchQuery) || 
      service.service.toString().includes(searchQuery);
    return matchesSearch;
  });

  // Transform services for OrderForm component
  const formServices = filteredServices.map(s => ({
    id: s.service,
    name: s.name,
    price: s.rateWithMarkup,
    minQuantity: parseInt(s.min),
    maxQuantity: parseInt(s.max),
    category: s.category,
  }));

  const handleOrderSubmit = (order: { serviceId: number; link: string; quantity: number; total: number }) => {
    createOrderMutation.mutate({
      serviceId: order.serviceId,
      link: order.link,
      quantity: order.quantity,
    });
  };

  const handleBuyService = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setSelectedPlatform('all');
  };

  return (
    <div className="pb-4 space-y-4">
      <BalanceCard
        username="imohmmed"
        balance={balanceData?.balance || 0}
        totalSpent={balanceData?.totalSpent || 0}
        discount={balanceData?.discount || 0}
        ordersCompleted={2586580}
        level={t('new')}
      />

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            {t('selectCategory')}
          </h2>
          {selectedPlatform && (
            <button
              onClick={() => setSelectedPlatform(null)}
              className="text-sm text-primary hover:underline"
              data-testid="button-clear-filter"
            >
              {t('hideFilter')}
            </button>
          )}
        </div>
        <PlatformGrid
          selectedPlatform={selectedPlatform}
          onPlatformSelect={setSelectedPlatform}
        />
      </Card>

      <Card className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="newOrder" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              {t('newOrder')}
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              {t('subscriptions')}
            </TabsTrigger>
            <TabsTrigger value="bulkOrder" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {t('bulkOrder')}
            </TabsTrigger>
          </TabsList>

          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchService')}
              className="pr-10"
              data-testid="input-search-services"
            />
          </div>

          <TabsContent value="newOrder" className="m-0">
            {servicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedPlatform && selectedPlatform !== 'all' ? (
              <OrderForm
                services={formServices}
                categories={categories}
                onSubmit={handleOrderSubmit}
              />
            ) : (
              <div className="space-y-3">
                {filteredServices.slice(0, 10).map(service => (
                  <ServiceCard
                    key={service.service}
                    id={service.service}
                    name={service.name}
                    price={parseFloat(service.rate)}
                    minQuantity={parseInt(service.min)}
                    maxQuantity={parseInt(service.max)}
                    refill={service.refill}
                    cancel={service.cancel}
                    speed="100K/Day"
                    onBuy={() => handleBuyService(service.service)}
                  />
                ))}
                {filteredServices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد خدمات متاحة
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="m-0">
            <div className="text-center py-8 text-muted-foreground">
              قريباً - خدمة الاشتراكات
            </div>
          </TabsContent>

          <TabsContent value="bulkOrder" className="m-0">
            <div className="text-center py-8 text-muted-foreground">
              قريباً - الطلب المجمع
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <ServiceInfoTabs newServices={[]} />
    </div>
  );
}
