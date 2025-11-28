import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toEnglishNumbers } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Clock, DollarSign, ShoppingCart, AlertCircle, Link2, CheckCircle, Lock, AlertTriangle } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  price: number;
  minQuantity: number;
  maxQuantity: number;
  category: string;
  platform?: string;
}

const getPlatformPlaceholder = (platform?: string): string => {
  const placeholders: Record<string, string> = {
    instagram: 'https://instagram.com/p/...',
    facebook: 'https://facebook.com/...',
    youtube: 'https://youtube.com/watch?v=...',
    tiktok: 'https://tiktok.com/@user/video/...',
    twitter: 'https://twitter.com/user/status/...',
    telegram: 'https://t.me/...',
    snapchat: 'https://snapchat.com/...',
    discord: 'https://discord.gg/...',
    linkedin: 'https://linkedin.com/...',
    spotify: 'https://open.spotify.com/...',
    twitch: 'https://twitch.tv/...',
    google: 'https://google.com/...',
    threads: 'https://threads.net/@...',
    kwai: 'https://kwai.com/...',
  };
  return placeholders[platform?.toLowerCase() || ''] || 'https://...';
};

const extractExecutionTime = (serviceName: string, language: string): string => {
  // Look for time patterns like "0-1 ساعة", "1-2 hours", "فوري", etc.
  const arabicPatterns = [
    /وقت البدأ[:\s]*(\d+[-–]\d+\s*(?:ساعة|ساعات|دقيقة|دقائق|يوم|أيام)?)/i,
    /وقت البدء[:\s]*(\d+[-–]\d+\s*(?:ساعة|ساعات|دقيقة|دقائق|يوم|أيام)?)/i,
    /البدء[:\s]*(\d+[-–]\d+\s*(?:ساعة|ساعات|دقيقة|دقائق|يوم|أيام)?)/i,
    /وقت البدأ[:\s]*(فوري)/i,
    /وقت البدء[:\s]*(فوري)/i,
  ];
  
  const englishPatterns = [
    /start time[:\s]*(\d+[-–]\d+\s*(?:hour|hours|minute|minutes|day|days)?)/i,
    /time[:\s]*(\d+[-–]\d+\s*(?:hour|hours|minute|minutes|day|days)?)/i,
    /start time[:\s]*(instant)/i,
  ];
  
  const patterns = language === 'ar' ? [...arabicPatterns, ...englishPatterns] : [...englishPatterns, ...arabicPatterns];
  
  for (const pattern of patterns) {
    const match = serviceName.match(pattern);
    if (match && match[1]) {
      const result = match[1].trim();
      // Add unit if missing
      if (/^\d+[-–]\d+$/.test(result)) {
        return result + (language === 'ar' ? ' ساعة' : ' hours');
      }
      return result;
    }
  }
  
  if (serviceName.includes('فوري') || serviceName.toLowerCase().includes('instant')) {
    return language === 'ar' ? 'فوري' : 'Instant';
  }
  
  return language === 'ar' ? '0-1 ساعة' : '0-1 hour';
};

interface OrderFormProps {
  services: Service[];
  categories: string[];
  onSubmit: (order: { serviceId: number; link: string; quantity: number; total: number }) => void;
  disabled?: boolean;
  showCategorySelect?: boolean;
  userDiscount?: number;
}

export default function OrderForm({ services, categories, onSubmit, disabled = false, showCategorySelect = true, userDiscount = 0 }: OrderFormProps) {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [total, setTotal] = useState(0);

  // Auto-select service when there's only one service (from search results)
  useEffect(() => {
    if (services.length === 1 && selectedService !== services[0].id.toString()) {
      setSelectedService(services[0].id.toString());
      // Also set the category for the selected service
      if (services[0].category) {
        setSelectedCategory(services[0].category);
      }
    }
  }, [services]);

  const filteredServices = selectedCategory 
    ? services.filter(s => s.category === selectedCategory)
    : services;

  const currentService = services.find(s => s.id.toString() === selectedService);
  
  // Check if this is a single-quantity service (like Discord boosts)
  const isSingleQuantityService = currentService?.maxQuantity === 1;

  // Auto-set quantity to 1 when selecting a single-quantity service
  useEffect(() => {
    if (isSingleQuantityService && quantity !== '1') {
      setQuantity('1');
    }
  }, [isSingleQuantityService, currentService]);

  useEffect(() => {
    if (currentService && quantity) {
      const qty = parseInt(quantity) || 0;
      // currentService.price is already rateWithMarkup from the backend
      // Apply user discount if available
      const priceAfterDiscount = currentService.price * (1 - userDiscount / 100);
      
      // For single-quantity services (like Discord boosts), the rate IS the full price
      // For regular services, rate is per 1000 units
      if (isSingleQuantityService) {
        setTotal(qty * priceAfterDiscount);
      } else {
        setTotal((qty / 1000) * priceAfterDiscount);
      }
    } else {
      setTotal(0);
    }
  }, [currentService, quantity, userDiscount, isSingleQuantityService]);

  const handleSubmit = () => {
    if (!currentService || !link || !quantity) return;
    
    onSubmit({
      serviceId: currentService.id,
      link,
      quantity: parseInt(quantity),
      total
    });
  };

  const isValid = currentService && link && quantity && 
    parseInt(quantity) >= currentService.minQuantity &&
    parseInt(quantity) <= currentService.maxQuantity;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('newOrder')}</h2>
      </div>

      <div className="space-y-4">
        {showCategorySelect && (
          <div dir="rtl">
            <Label className="text-sm text-muted-foreground mb-2 block text-right">{t('category')}</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} dir="rtl">
              <SelectTrigger data-testid="select-category" className="text-right">
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent className="max-h-80 w-[calc(100vw-3rem)] max-w-md" dir="rtl">
                {categories.map(cat => (
                  <SelectItem 
                    key={cat} 
                    value={cat}
                    className="text-right py-3"
                  >
                    <span className="text-sm leading-relaxed">{cat}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div dir="rtl">
          <Label className="text-sm text-muted-foreground mb-2 block text-right">{t('serviceName')}</Label>
          <Select value={selectedService} onValueChange={setSelectedService} dir="rtl">
            <SelectTrigger data-testid="select-service" className="text-right">
              <SelectValue placeholder={t('serviceName')} />
            </SelectTrigger>
            <SelectContent className="max-h-80 w-[calc(100vw-3rem)] max-w-md" dir="rtl">
              {filteredServices.map(service => (
                <SelectItem 
                  key={service.id} 
                  value={service.id.toString()}
                  className="text-right py-3"
                >
                  <span className="inline-flex items-center gap-2 flex-row-reverse">
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-mono shrink-0">
                      {service.id}
                    </span>
                    <span className="text-sm leading-relaxed">{service.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service Description for Discord Boost services */}
        {currentService && currentService.platform === 'discord' && 
         currentService.name.toLowerCase().includes('boost') && (
          <Card className="p-4 bg-muted/30 border-muted" dir="rtl">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">وصف الخدمة</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p>يجب عليك الدخول إلى اتصال الخادم.</p>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <span className="text-xs">💬</span>
                <p>رابط المثال: https://discord.gg/xxxxxx</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p>تتم إضافة الأعضاء إلى الخادم الخاص بك ويتم إجراء التعزيز.</p>
              </div>
              <div className="flex items-start gap-2 text-orange-500">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>إذا تم طرد الأعضاء الذين ضغطوا على Boost من الخادم، فسيتم إلغاء التعزيز.</p>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p>يجب ألا يحتوي الخادم على "Member Bot Verification" أو "Spam Blocker Bot".</p>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p>يجب إيقاف مستوى التحقق.</p>
              </div>
              <div className="flex items-start gap-2 text-red-500">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>لا توجد إمكانية لاسترداد الأموال/إعادة التعبئة عند حذف الدعوات أو حدود الدعوات.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Service Description for Discord Members services */}
        {currentService && currentService.platform === 'discord' && 
         currentService.name.toLowerCase().includes('member') && (
          <Card className="p-4 bg-muted/30 border-muted" dir="rtl">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">تعليمات الطلب المسبق</h3>
            </div>
            <div className="space-y-4 text-sm">
              {/* Step 1: Add Discord Bot */}
              <div className="space-y-2">
                <p className="font-semibold text-primary">1️⃣ إضافة بوت ديسكورد:</p>
                <div className="space-y-1 pr-4">
                  <p>🌐 أضف بوت ديسكورد الخاص بنا إلى خادمك من {'>'}{'>'}  <a href="https://nowon.tools" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://nowon.tools</a></p>
                  <p>🤖 يُنشئ هذا البوت رابط دعوة ولا يتطلب أذونات إضافية.</p>
                  <p className="text-orange-500">⚠️ لا تُقيّد متطلبات البوت، فقد يمنع ذلك إكمال طلبك.</p>
                  <p>🚪 يمكنك إزالة البوت من خادمك بعد اكتمال العملية.</p>
                </div>
              </div>

              {/* Step 2: Anti-Raid Bots Warning */}
              <div className="space-y-2">
                <p className="font-semibold text-primary">2️⃣ احذر من بوتات مكافحة الغارات:</p>
                <div className="space-y-1 pr-4">
                  <p className="text-red-500">🛑 لا تُثبّت بوتات مكافحة الغارات على خادمك.</p>
                  <p>🚫 قد تُعيق هذه البوتات مشاركة الأعضاء وتؤثر على طلبك.</p>
                </div>
              </div>

              {/* Step 3: Security Level Settings */}
              <div className="space-y-2">
                <p className="font-semibold text-primary">3️⃣ إعدادات مستوى الأمان:</p>
                <div className="space-y-1 pr-4">
                  <p>🔒 يجب أن يكون مستوى أمان الخادم "بدون" أو "منخفض".</p>
                  <p className="text-muted-foreground">🛠️ (إعدادات الخادم {'>'} إعدادات الأمان {'>'} مستوى التحقق)</p>
                </div>
              </div>

              {/* Step 4: Member Ban Warning */}
              <div className="space-y-2">
                <p className="font-semibold text-primary">4️⃣ احذر من حظر الأعضاء:</p>
                <div className="space-y-1 pr-4">
                  <p>🚫 لا تحظر الأعضاء المنضمين أثناء العملية.</p>
                  <p>📛 قد يُعيق الحظر العملية.</p>
                  <p className="text-green-500">✅ يمكنك اتخاذ أي إجراء ترغب به بعد إتمام الطلب.</p>
                </div>
              </div>

              {/* Step 5: Permanent Invite Link */}
              <div className="space-y-2">
                <p className="font-semibold text-primary">5️⃣ إنشاء رابط دعوة دائم:</p>
                <div className="space-y-1 pr-4">
                  <p>🔗 يجب أن يكون رابط دعوتك دائمًا.</p>
                  <p>⏰ في حال وجود أي مشاكل، لديك حق التعويض لمدة 30 يومًا.</p>
                  <p className="text-red-500">🔄 إذا كان رابط الدعوة غير صالح، يُفقد حقك في إعادة التعبئة!</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-muted">
                <p className="font-semibold text-primary mb-2">📜 معلومات إضافية:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p>🔗 الرابط: رابط دعوة ديسكورد غير محدود</p>
                  <p>✅ الضمان: 30 يومًا</p>
                  <p>⚡ التسليم: فوري (باستثناء فترة الصيانة)</p>
                  <p>🌐 البيانات: عالمي</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">{t('link')}</Label>
          <Input 
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder={getPlatformPlaceholder(currentService?.platform)}
            className="text-left"
            dir="ltr"
            data-testid="input-link"
          />
        </div>

        {/* Hide quantity input for single-quantity services like Discord boosts */}
        {!isSingleQuantityService && (
          <div className="w-1/2">
            <Label className="text-sm text-muted-foreground mb-2 block">{t('quantity')}</Label>
            <Input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              onChange={(e) => setQuantity(toEnglishNumbers(e.target.value).replace(/\D/g, ''))}
              placeholder={currentService ? `${currentService.minQuantity} - ${currentService.maxQuantity}` : '1000'}
              dir="ltr"
              className="text-left"
              data-testid="input-quantity"
            />
            {currentService && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('min')}: {currentService.minQuantity.toLocaleString()} | {t('max')}: {currentService.maxQuantity.toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">{t('executionTime')}</span>
            </div>
            <p className="font-semibold">
              {currentService ? extractExecutionTime(currentService.name, language) : (language === 'ar' ? '0-1 ساعة' : '0-1 hour')}
            </p>
          </Card>

          <Card className="p-3 bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">{t('totalAmount')}</span>
            </div>
            <p className="font-bold text-primary text-lg">${total.toFixed(4)}</p>
          </Card>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!isValid || disabled}
          className="w-full bg-success hover:bg-success/90 text-success-foreground py-6 text-lg"
          data-testid="button-confirm-order"
        >
          {t('confirmOrder')}
        </Button>
      </div>
    </Card>
  );
}
