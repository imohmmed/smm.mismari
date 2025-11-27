import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import BalanceCard from '@/components/BalanceCard';
import PlatformGrid, { type Platform } from '@/components/PlatformGrid';
import OrderForm from '@/components/OrderForm';
import ServiceInfoTabs from '@/components/ServiceInfoTabs';
import ServiceCard from '@/components/ServiceCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, ListOrdered, Package } from 'lucide-react';

// todo: remove mock functionality - replace with API data
const mockServices = [
  { id: 18193, name: 'مشاهدات فيديو انستجرام - السرعة: 100 الف', price: 0.0015, minQuantity: 100, maxQuantity: 10000000, category: 'مشاهدات', platform: 'instagram' },
  { id: 18194, name: 'لايكات انستجرام - حقيقي - السرعة: 50 الف', price: 0.002, minQuantity: 50, maxQuantity: 500000, category: 'لايكات', platform: 'instagram' },
  { id: 18195, name: 'متابعين انستجرام - عرب حقيقي', price: 0.005, minQuantity: 100, maxQuantity: 100000, category: 'متابعين', platform: 'instagram' },
  { id: 18196, name: 'مشاهدات تيك توك - السرعة: 1 مليون', price: 0.001, minQuantity: 100, maxQuantity: 50000000, category: 'مشاهدات', platform: 'tiktok' },
  { id: 18197, name: 'لايكات تيك توك - السرعة: 100 الف', price: 0.0018, minQuantity: 50, maxQuantity: 1000000, category: 'لايكات', platform: 'tiktok' },
  { id: 18198, name: 'مشاهدات يوتيوب - السرعة: 10 الف', price: 0.008, minQuantity: 500, maxQuantity: 1000000, category: 'مشاهدات', platform: 'youtube' },
];

const mockCategories = ['مشاهدات', 'لايكات', 'متابعين', 'تعليقات', 'مشاركات'];

const mockNewServices = [
  { id: 18629, name: 'مشاركات تيك توك - السرعة: 100 مليون كل يوم', date: '27-11-2025' },
  { id: 18628, name: 'تقييمات صفحة فيسبوك - تقييمات مخصصة - ذكور', date: '27-11-2025' },
];

// todo: remove mock functionality - replace with actual user data
const mockUser = {
  username: 'imohmmed',
  balance: 0,
  totalSpent: 0,
  discount: 0,
  ordersCompleted: 2586580,
};

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [activeTab, setActiveTab] = useState('newOrder');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = mockServices.filter(service => {
    const matchesPlatform = !selectedPlatform || selectedPlatform === 'all' || service.platform === selectedPlatform;
    const matchesSearch = !searchQuery || 
      service.name.includes(searchQuery) || 
      service.id.toString().includes(searchQuery);
    return matchesPlatform && matchesSearch;
  });

  const handleOrderSubmit = (order: { serviceId: number; link: string; quantity: number; total: number }) => {
    console.log('Order submitted:', order);
    // todo: implement API call to submit order
  };

  const handleBuyService = (serviceId: number) => {
    console.log('Buy service:', serviceId);
    // todo: implement service purchase flow
  };

  return (
    <div className="pb-4 space-y-4">
      <BalanceCard
        username={mockUser.username}
        balance={mockUser.balance}
        totalSpent={mockUser.totalSpent}
        discount={mockUser.discount}
        ordersCompleted={mockUser.ordersCompleted}
        level={t('new')}
      />

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            {t('selectCategory')}
          </h2>
          <button
            onClick={() => setSelectedPlatform(null)}
            className="text-sm text-primary hover:underline"
            data-testid="button-clear-filter"
          >
            {t('hideFilter')}
          </button>
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
            {selectedPlatform && selectedPlatform !== 'all' ? (
              <OrderForm
                services={filteredServices}
                categories={mockCategories}
                onSubmit={handleOrderSubmit}
              />
            ) : (
              <div className="space-y-3">
                {filteredServices.slice(0, 5).map(service => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    name={service.name}
                    price={service.price}
                    minQuantity={service.minQuantity}
                    maxQuantity={service.maxQuantity}
                    refill={true}
                    speed="100K/Day"
                    onBuy={() => handleBuyService(service.id)}
                  />
                ))}
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

      <ServiceInfoTabs newServices={mockNewServices} />
    </div>
  );
}
