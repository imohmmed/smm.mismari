import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toEnglishNumbers } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Clock, DollarSign, ShoppingCart, AlertCircle, MessageSquare } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  price: number;
  minQuantity: number;
  maxQuantity: number;
  category: string;
  platform?: string;
  type?: string;
  description?: string;
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
  
  return language === 'ar' ? '1-0 ساعة' : '0-1 hour';
};

interface OrderFormProps {
  services: Service[];
  categories: string[];
  onSubmit: (order: { serviceId: number; link: string; quantity: number; total: number; comments?: string }) => void;
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
  const [comments, setComments] = useState('');
  const [total, setTotal] = useState(0);
  const [serviceDescription, setServiceDescription] = useState<string | null>(null);
  const [loadingDescription, setLoadingDescription] = useState(false);

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
  
  // Check if this is a custom comments service
  const isCustomComments = currentService?.type === 'Custom Comments' || currentService?.type === 'Custom Comments Package';
  
  // Count comments lines for custom comments services
  const commentsCount = comments.split('\n').filter(c => c.trim()).length;

  // Auto-set quantity to 1 when selecting a single-quantity service
  useEffect(() => {
    if (isSingleQuantityService && quantity !== '1') {
      setQuantity('1');
    }
  }, [isSingleQuantityService, currentService]);
  
  // Clear comments when switching to non-custom-comments service
  useEffect(() => {
    if (!isCustomComments && comments) {
      setComments('');
    }
  }, [isCustomComments]);

  // Fetch service description when service is selected
  useEffect(() => {
    if (currentService?.id) {
      setLoadingDescription(true);
      fetch(`/api/services/${currentService.id}/description`)
        .then(res => res.json())
        .then(data => {
          setServiceDescription(data.description);
        })
        .catch(err => {
          console.error('Error fetching service description:', err);
          setServiceDescription(null);
        })
        .finally(() => {
          setLoadingDescription(false);
        });
    } else {
      setServiceDescription(null);
    }
  }, [currentService?.id]);

  useEffect(() => {
    if (currentService) {
      // For custom comments, use comments count as quantity
      const qty = isCustomComments ? commentsCount : (parseInt(quantity) || 0);
      
      if (qty > 0) {
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
    } else {
      setTotal(0);
    }
  }, [currentService, quantity, comments, commentsCount, userDiscount, isSingleQuantityService, isCustomComments]);

  const handleSubmit = () => {
    if (!currentService || !link) return;
    
    // For custom comments, validate comments instead of quantity
    if (isCustomComments) {
      if (commentsCount < currentService.minQuantity || commentsCount > currentService.maxQuantity) return;
      onSubmit({
        serviceId: currentService.id,
        link,
        quantity: commentsCount,
        total,
        comments: comments.trim()
      });
    } else {
      if (!quantity) return;
      onSubmit({
        serviceId: currentService.id,
        link,
        quantity: parseInt(quantity),
        total
      });
    }
  };

  // Validate based on service type
  const isValid = currentService && link && (
    isCustomComments 
      ? commentsCount >= currentService.minQuantity && commentsCount <= currentService.maxQuantity
      : quantity && parseInt(quantity) >= currentService.minQuantity && parseInt(quantity) <= currentService.maxQuantity
  );

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

        {/* Service Description from database */}
        {serviceDescription && (
          <Card className="p-4 bg-muted/30 border-muted" dir="rtl">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">وصف الخدمة</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {serviceDescription}
            </p>
          </Card>
        )}
        {loadingDescription && currentService && (
          <Card className="p-4 bg-muted/30 border-muted animate-pulse" dir="rtl">
            <div className="h-4 bg-muted rounded w-24 mb-3"></div>
            <div className="h-3 bg-muted rounded w-full mb-2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
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

        {/* Custom Comments textarea for custom comments services */}
        {isCustomComments && (
          <div>
            <div className="w-1/2 mb-3">
              <Label className="text-sm text-muted-foreground mb-2 block">{t('quantity')}</Label>
              <Input 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={commentsCount.toString()}
                readOnly
                dir="ltr"
                className="text-left bg-muted/50"
                data-testid="input-quantity-readonly"
              />
              {currentService && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('min')}: {currentService.minQuantity.toLocaleString()} | {t('max')}: {currentService.maxQuantity.toLocaleString()}
                </p>
              )}
            </div>
            <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              التعليقات (1 لكل سطر)
            </Label>
            <Textarea 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="اكتب التعليقات هنا... كل تعليق في سطر جديد"
              dir="rtl"
              className="min-h-[150px] text-right"
              data-testid="input-comments"
            />
            <p className="text-xs text-muted-foreground mt-1">
              عدد التعليقات: {commentsCount}
            </p>
          </div>
        )}

        {/* Hide quantity input for single-quantity services like Discord boosts */}
        {!isSingleQuantityService && !isCustomComments && (
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
              {currentService ? extractExecutionTime(currentService.name, language) : (language === 'ar' ? '1-0 ساعة' : '0-1 hour')}
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
