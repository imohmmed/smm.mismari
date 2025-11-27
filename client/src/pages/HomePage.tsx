import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import BalanceCard from '@/components/BalanceCard';
import PlatformGrid, { type Platform } from '@/components/PlatformGrid';
import OrderForm from '@/components/OrderForm';
import ServiceInfoTabs from '@/components/ServiceInfoTabs';
import ServiceCard from '@/components/ServiceCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, ShoppingCart, ListOrdered, Loader2, LogIn, UserPlus } from 'lucide-react';
import { fetchServices, fetchBalance, createOrder, type Service } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [activeTab, setActiveTab] = useState('newOrder');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services', selectedPlatform],
    queryFn: () => fetchServices(selectedPlatform || undefined),
  });

  const { data: balanceData } = useQuery({
    queryKey: ['/api/balance'],
    queryFn: fetchBalance,
    enabled: !!user,
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      toast({
        title: language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully',
        description: `${language === 'ar' ? 'رقم الطلب' : 'Order ID'}: ${data.order.orderId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balance'] });
    },
    onError: (error) => {
      toast({
        title: language === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to create order',
        description: error instanceof Error ? error.message : (language === 'ar' ? 'حدث خطأ' : 'An error occurred'),
        variant: 'destructive',
      });
    },
  });

  const services = servicesData?.services || [];
  const categories = servicesData?.categories || [];

  const filteredServices = services.filter(service => {
    const matchesSearch = !searchQuery || 
      service.name.includes(searchQuery) || 
      service.service.toString().includes(searchQuery);
    return matchesSearch;
  });

  const formServices = filteredServices.map(s => ({
    id: s.service,
    name: s.name,
    price: s.rateWithMarkup,
    minQuantity: parseInt(s.min),
    maxQuantity: parseInt(s.max),
    category: s.category,
    platform: s.platform,
  }));

  const handleOrderSubmit = (order: { serviceId: number; link: string; quantity: number; total: number }) => {
    if (!user) {
      toast({
        title: language === 'ar' ? 'يرجى تسجيل الدخول' : 'Please login',
        description: language === 'ar' ? 'يجب تسجيل الدخول لإتمام الطلب' : 'You must login to place an order',
        variant: 'destructive',
      });
      setLocation('/login');
      return;
    }
    createOrderMutation.mutate({
      serviceId: order.serviceId,
      link: order.link,
      quantity: order.quantity,
    });
  };

  const handleBuyService = (serviceId: number) => {
    if (!user) {
      toast({
        title: language === 'ar' ? 'يرجى تسجيل الدخول' : 'Please login',
        description: language === 'ar' ? 'يجب تسجيل الدخول لإتمام الطلب' : 'You must login to place an order',
        variant: 'destructive',
      });
      setLocation('/login');
      return;
    }
    setSelectedServiceId(serviceId);
    setSelectedPlatform('all');
  };

  return (
    <div className="pb-4 space-y-4">
      {user ? (
        <BalanceCard
          username={user.username}
          balance={balanceData?.balance || user.balance || 0}
          totalSpent={balanceData?.totalSpent || user.totalSpent || 0}
          discount={balanceData?.discount || user.discount || 0}
          ordersCompleted={0}
          level={t('new')}
        />
      ) : (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold">
              {language === 'ar' ? 'مرحباً بك في AlAli SMM' : 'Welcome to AlAli SMM'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'قم بتسجيل الدخول أو إنشاء حساب للبدء في طلب خدمات السوشيال ميديا'
                : 'Login or create an account to start ordering social media services'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setLocation('/login')}
                className="gap-2"
                data-testid="button-login-hero"
              >
                <LogIn className="w-4 h-4" />
                {t('login')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/register')}
                className="gap-2"
                data-testid="button-register-hero"
              >
                <UserPlus className="w-4 h-4" />
                {t('register')}
              </Button>
            </div>
          </div>
        </Card>
      )}

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
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="newOrder" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              {t('newOrder')}
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              {t('subscriptions')}
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
                disabled={!user}
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
                    {language === 'ar' ? 'لا توجد خدمات متاحة' : 'No services available'}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="m-0">
            <div className="text-center py-8 text-muted-foreground">
              {language === 'ar' ? 'قريباً - خدمة الاشتراكات' : 'Coming soon - Subscriptions'}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <ServiceInfoTabs newServices={[]} />
    </div>
  );
}
