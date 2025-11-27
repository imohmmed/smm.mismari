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
import { Clock, DollarSign, ShoppingCart } from 'lucide-react';

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
  const arabicPatterns = [
    /وقت البدأ[:\s]*([^~\-]+)/i,
    /وقت البدء[:\s]*([^~\-]+)/i,
    /البدأ[:\s]*([^~\-]+)/i,
  ];
  
  const englishPatterns = [
    /start time[:\s]*([^~\-]+)/i,
    /time[:\s]*([^~\-]+)/i,
  ];
  
  const patterns = language === 'ar' ? [...arabicPatterns, ...englishPatterns] : [...englishPatterns, ...arabicPatterns];
  
  for (const pattern of patterns) {
    const match = serviceName.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
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
}

export default function OrderForm({ services, categories, onSubmit, disabled = false, showCategorySelect = true }: OrderFormProps) {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [total, setTotal] = useState(0);

  const filteredServices = selectedCategory 
    ? services.filter(s => s.category === selectedCategory)
    : services;

  const currentService = services.find(s => s.id.toString() === selectedService);

  useEffect(() => {
    if (currentService && quantity) {
      const qty = parseInt(quantity) || 0;
      const priceWithMarkup = currentService.price * 1.15;
      setTotal((qty / 1000) * priceWithMarkup);
    } else {
      setTotal(0);
    }
  }, [currentService, quantity]);

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
