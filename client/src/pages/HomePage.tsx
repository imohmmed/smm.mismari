import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import BalanceCard from '@/components/BalanceCard';
import PlatformGrid, { type Platform } from '@/components/PlatformGrid';
import OrderForm from '@/components/OrderForm';
import ServiceInfoTabs from '@/components/ServiceInfoTabs';
import ServiceCard from '@/components/ServiceCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Search, ShoppingCart, ListOrdered, Loader2, LogIn, UserPlus, X, Star, Flame, Clock, MessageCircle, Package, ChevronLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchServices, fetchBalance, createOrder, type Service } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface Subscription {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  deliveryTime: string;
  price: number;
  isActive: number;
}

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>('all');
  const [activeTab, setActiveTab] = useState('newOrder');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSearchService, setSelectedSearchService] = useState<Service | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services', selectedPlatform],
    queryFn: () => fetchServices(selectedPlatform || undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes - services don't change frequently
  });

  const { data: balanceData } = useQuery({
    queryKey: ['/api/balance'],
    queryFn: fetchBalance,
    enabled: !!user,
  });

  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery<{ subscriptions: Subscription[] }>({
    queryKey: ['/api/subscriptions'],
    staleTime: 5 * 60 * 1000, // 5 minutes - subscriptions don't change frequently
  });

  const subscriptions = subscriptionsData?.subscriptions || [];

  const handleContactSubscription = (subscription: Subscription) => {
    const message = `مرحباً، أريد الاستفسار عن الاشتراك: ${subscription.name}`;
    window.open(`https://wa.me/9647766699669?text=${encodeURIComponent(message)}`, '_blank');
  };

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      const displayOrderId = data.order.apiOrderId || data.order.id;
      toast({
        title: language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully',
        description: `${language === 'ar' ? 'رقم الطلب' : 'Order ID'}: ${displayOrderId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
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

  // Memoize filtered services to avoid recalculation on every render
  const filteredServices = useMemo(() => 
    services.filter(service => {
      const matchesSearch = !searchQuery || 
        service.name.includes(searchQuery) || 
        service.service.toString().includes(searchQuery);
      return matchesSearch;
    }), [services, searchQuery]);

  // Memoize form services transformation
  const formServices = useMemo(() => 
    filteredServices.map(s => ({
      id: s.service,
      name: s.name,
      price: s.rateWithMarkup,
      minQuantity: parseInt(s.min),
      maxQuantity: parseInt(s.max),
      category: s.category,
      platform: s.platform,
      type: s.type,
      description: s.description,
    })), [filteredServices]);

  const handleOrderSubmit = (order: { serviceId: number; link: string; quantity: number; total: number; comments?: string }) => {
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
      ...(order.comments ? { comments: order.comments } : {}),
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
          ordersCompleted={balanceData?.ordersCompleted || 0}
          level={t('new')}
        />
      ) : (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold">
              {language === 'ar' ? 'مرحباً بك في Mismari TV لخدمات مواقع التواصل' : 'Welcome to Mismari SMM'}
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
        <div className="mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            {t('selectCategory')}
          </h2>
        </div>
        <PlatformGrid
          selectedPlatform={selectedPlatform}
          onPlatformSelect={setSelectedPlatform}
        />
      </Card>

      <Card className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
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

          <div className="relative mb-4" ref={searchRef}>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                  if (e.target.value.length === 0) {
                    setSelectedSearchService(null);
                  }
                }}
                onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                placeholder={t('searchService')}
                className="pr-10"
                data-testid="input-search-services"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                    setSelectedSearchService(null);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-destructive hover:text-destructive/80"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showSearchResults && searchQuery && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border">
                <div className="max-h-64 overflow-y-auto">
                  {filteredServices.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {filteredServices.slice(0, 20).map(service => (
                        <button
                          key={service.service}
                          onClick={() => {
                            setSelectedSearchService(service);
                            setShowSearchResults(false);
                          }}
                          className="w-full text-right p-3 rounded-md hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                          data-testid={`search-result-${service.service}`}
                        >
                          <div className="flex items-start gap-2">
                            <Badge className="shrink-0 bg-primary/20 text-primary border-primary/30">
                              {service.service}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-relaxed">{service.name}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span className="text-success font-semibold">
                                  ${service.rateWithMarkup.toFixed(4)}
                                </span>
                                <span>{language === 'ar' ? 'لكل 1000' : 'per 1000'}</span>
                                {service.refill && (
                                  <Badge variant="secondary" className="text-[10px] py-0 px-1">
                                    <Flame className="w-3 h-3 ml-0.5" />
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          <TabsContent value="newOrder" className="m-0">
            {servicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedSearchService ? (
              <OrderForm
                services={[{
                  id: selectedSearchService.service,
                  name: selectedSearchService.name,
                  price: selectedSearchService.rateWithMarkup,
                  minQuantity: parseInt(selectedSearchService.min),
                  maxQuantity: parseInt(selectedSearchService.max),
                  category: selectedSearchService.category,
                  platform: selectedSearchService.platform,
                }]}
                categories={[selectedSearchService.category]}
                onSubmit={handleOrderSubmit}
                disabled={!user}
                showCategorySelect={false}
                userDiscount={balanceData?.discount || user?.discount || 0}
              />
            ) : selectedPlatform ? (
              <OrderForm
                services={formServices}
                categories={categories}
                onSubmit={handleOrderSubmit}
                disabled={!user}
                showCategorySelect={selectedPlatform === 'all'}
                userDiscount={balanceData?.discount || user?.discount || 0}
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
            {subscriptionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'لا توجد اشتراكات متاحة حالياً' : 'No subscriptions available'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((subscription) => (
                  <button
                    key={subscription.id}
                    onClick={() => setSelectedSubscription(subscription)}
                    className="w-full text-right"
                    data-testid={`subscription-card-${subscription.id}`}
                  >
                    <Card className="overflow-hidden hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 p-3">
                        {subscription.imageUrl && (
                          <div className="w-16 h-16 shrink-0 bg-muted rounded-lg overflow-hidden">
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-bold truncate">{subscription.name}</h3>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 shrink-0">
                              ${subscription.price.toFixed(2)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {subscription.description}
                          </p>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <Dialog open={!!selectedSubscription} onOpenChange={(open) => !open && setSelectedSubscription(null)}>
            <DialogContent className="max-w-md" dir="rtl">
              {selectedSubscription && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl">{selectedSubscription.name}</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {selectedSubscription.imageUrl && (
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={selectedSubscription.imageUrl}
                          alt={selectedSubscription.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{language === 'ar' ? 'السعر' : 'Price'}</span>
                      <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">
                        ${selectedSubscription.price.toFixed(2)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{language === 'ar' ? 'مدة التسليم' : 'Delivery Time'}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedSubscription.deliveryTime}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-muted-foreground">{language === 'ar' ? 'الوصف' : 'Description'}</span>
                      <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg">
                        {selectedSubscription.description}
                      </p>
                    </div>
                    
                    <Button
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                      size="lg"
                      onClick={() => handleContactSubscription(selectedSubscription)}
                      data-testid={`button-contact-subscription-${selectedSubscription.id}`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      {language === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </Tabs>
      </Card>

      <ServiceInfoTabs />
    </div>
  );
}
