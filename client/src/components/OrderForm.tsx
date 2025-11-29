import { useState, useEffect, useMemo } from 'react';
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
import { Clock, DollarSign, ShoppingCart, AlertCircle, MessageSquare, MoreHorizontal } from 'lucide-react';
import { 
  SiInstagram, 
  SiFacebook, 
  SiYoutube, 
  SiTiktok, 
  SiX, 
  SiTelegram, 
  SiSnapchat, 
  SiDiscord, 
  SiLinkedin, 
  SiSpotify, 
  SiTwitch,
  SiGoogle,
  SiThreads
} from 'react-icons/si';

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

const platformConfig: Record<string, { 
  icon: typeof SiInstagram; 
  label: string; 
  color: string;
  keywords: string[];
}> = {
  instagram: { 
    icon: SiInstagram, 
    label: 'انستجرام', 
    color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    keywords: ['instagram', 'انستجرام', 'انستقرام', 'انستا']
  },
  facebook: { 
    icon: SiFacebook, 
    label: 'فيسبوك', 
    color: 'bg-blue-600',
    keywords: ['facebook', 'فيسبوك', 'فيس بوك']
  },
  youtube: { 
    icon: SiYoutube, 
    label: 'يوتيوب', 
    color: 'bg-red-600',
    keywords: ['youtube', 'يوتيوب']
  },
  tiktok: { 
    icon: SiTiktok, 
    label: 'تيك توك', 
    color: 'bg-black',
    keywords: ['tiktok', 'تيك توك', 'تيكتوك']
  },
  twitter: { 
    icon: SiX, 
    label: 'تويتر', 
    color: 'bg-black',
    keywords: ['twitter', 'تويتر', 'x.com', 'اكس']
  },
  telegram: { 
    icon: SiTelegram, 
    label: 'تليجرام', 
    color: 'bg-sky-500',
    keywords: ['telegram', 'تليجرام', 'تلجرام', 'تيليجرام']
  },
  snapchat: { 
    icon: SiSnapchat, 
    label: 'سناب شات', 
    color: 'bg-yellow-400',
    keywords: ['snapchat', 'سناب', 'سناب شات']
  },
  discord: { 
    icon: SiDiscord, 
    label: 'ديسكورد', 
    color: 'bg-indigo-500',
    keywords: ['discord', 'ديسكورد']
  },
  linkedin: { 
    icon: SiLinkedin, 
    label: 'لينكد ان', 
    color: 'bg-blue-700',
    keywords: ['linkedin', 'لينكد ان', 'لينكدان']
  },
  spotify: { 
    icon: SiSpotify, 
    label: 'سبوتيفاي', 
    color: 'bg-green-500',
    keywords: ['spotify', 'سبوتيفاي']
  },
  twitch: { 
    icon: SiTwitch, 
    label: 'تويتش', 
    color: 'bg-purple-600',
    keywords: ['twitch', 'تويتش']
  },
  google: { 
    icon: SiGoogle, 
    label: 'جوجل', 
    color: 'bg-blue-500',
    keywords: ['google', 'جوجل']
  },
  threads: { 
    icon: SiThreads, 
    label: 'ثريدز', 
    color: 'bg-black',
    keywords: ['threads', 'ثريدز']
  },
};

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

const detectPlatformFromCategory = (category: string): string | null => {
  const lowerCategory = category.toLowerCase();
  
  for (const [platform, config] of Object.entries(platformConfig)) {
    for (const keyword of config.keywords) {
      if (lowerCategory.includes(keyword.toLowerCase())) {
        return platform;
      }
    }
  }
  return null;
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
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [comments, setComments] = useState('');
  const [total, setTotal] = useState(0);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  // Group categories by platform
  const platformCategories = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    const otherCategories: string[] = [];
    
    categories.forEach(category => {
      const platform = detectPlatformFromCategory(category);
      if (platform) {
        if (!grouped[platform]) grouped[platform] = [];
        grouped[platform].push(category);
      } else {
        otherCategories.push(category);
      }
    });
    
    if (otherCategories.length > 0) {
      grouped['other'] = otherCategories;
    }
    
    return grouped;
  }, [categories]);

  // Get available platforms that have services
  const availablePlatforms = useMemo(() => {
    const platforms = Object.keys(platformCategories).filter(p => p !== 'other');
    return platforms;
  }, [platformCategories]);

  // Get subcategories for selected platform
  const subcategories = useMemo(() => {
    if (selectedPlatform === 'all') {
      return categories;
    }
    return platformCategories[selectedPlatform] || [];
  }, [selectedPlatform, platformCategories, categories]);

  // Filter services by subcategory
  const filteredServices = useMemo(() => {
    if (selectedSubcategory) {
      return services.filter(s => s.category === selectedSubcategory);
    }
    if (selectedPlatform && selectedPlatform !== 'all') {
      const platformCats = platformCategories[selectedPlatform] || [];
      return services.filter(s => platformCats.includes(s.category));
    }
    return services;
  }, [selectedSubcategory, selectedPlatform, services, platformCategories]);

  // Auto-select service when there's only one service (from search results)
  useEffect(() => {
    if (services.length === 1 && selectedService !== services[0].id.toString()) {
      setSelectedService(services[0].id.toString());
      if (services[0].category) {
        setSelectedSubcategory(services[0].category);
        const platform = detectPlatformFromCategory(services[0].category);
        if (platform) setSelectedPlatform(platform);
      }
    }
  }, [services]);

  // Reset subcategory and service when platform changes
  useEffect(() => {
    setSelectedSubcategory('');
    setSelectedService('');
  }, [selectedPlatform]);

  // Reset service when subcategory changes
  useEffect(() => {
    setSelectedService('');
  }, [selectedSubcategory]);

  const currentService = services.find(s => s.id.toString() === selectedService);
  
  const isSingleQuantityService = currentService?.maxQuantity === 1;
  const isCustomComments = currentService?.type === 'Custom Comments' || currentService?.type === 'Custom Comments Package';
  const commentsCount = comments.split('\n').filter(c => c.trim()).length;

  useEffect(() => {
    if (isSingleQuantityService && quantity !== '1') {
      setQuantity('1');
    }
  }, [isSingleQuantityService, currentService]);
  
  useEffect(() => {
    if (!isCustomComments && comments) {
      setComments('');
    }
  }, [isCustomComments]);

  useEffect(() => {
    if (currentService) {
      const qty = isCustomComments ? commentsCount : (parseInt(quantity) || 0);
      
      if (qty > 0) {
        const priceAfterDiscount = currentService.price * (1 - userDiscount / 100);
        
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

  const isValid = currentService && link && (
    isCustomComments 
      ? commentsCount >= currentService.minQuantity && commentsCount <= currentService.maxQuantity
      : quantity && parseInt(quantity) >= currentService.minQuantity && parseInt(quantity) <= currentService.maxQuantity
  );

  // Platforms to show (first 9 or all)
  const displayPlatforms = showAllPlatforms ? availablePlatforms : availablePlatforms.slice(0, 9);
  const hasMorePlatforms = availablePlatforms.length > 9;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('newOrder')}</h2>
      </div>

      <div className="space-y-4">
        {showCategorySelect && (
          <>
            {/* Platform Selection Grid */}
            <div dir="rtl">
              <Label className="text-sm text-muted-foreground mb-3 block text-right">اختار القسم</Label>
              <div className="grid grid-cols-5 gap-2">
                {/* All option */}
                <button
                  onClick={() => {
                    setSelectedPlatform('all');
                    setShowAllPlatforms(false);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                    selectedPlatform === 'all' 
                      ? 'ring-2 ring-primary bg-primary/10' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  data-testid="button-platform-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-1">
                    <MoreHorizontal className="w-5 h-5" />
                  </div>
                  <span className="text-xs truncate w-full text-center">كل شي</span>
                </button>

                {/* Platform buttons */}
                {displayPlatforms.map(platform => {
                  const config = platformConfig[platform];
                  if (!config) return null;
                  const Icon = config.icon;
                  
                  return (
                    <button
                      key={platform}
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setShowAllPlatforms(false);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                        selectedPlatform === platform 
                          ? 'ring-2 ring-primary bg-primary/10' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                      data-testid={`button-platform-${platform}`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center mb-1`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs truncate w-full text-center">{config.label}</span>
                    </button>
                  );
                })}

                {/* Show more/less button */}
                {hasMorePlatforms && (
                  <button
                    onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/50 hover:bg-muted transition-all"
                    data-testid="button-show-more-platforms"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-1">
                      <MoreHorizontal className="w-5 h-5" />
                    </div>
                    <span className="text-xs truncate w-full text-center">
                      {showAllPlatforms ? 'أقل' : 'المزيد'}
                    </span>
                  </button>
                )}

                {/* Other category if exists */}
                {platformCategories['other'] && platformCategories['other'].length > 0 && (
                  <button
                    onClick={() => setSelectedPlatform('other')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                      selectedPlatform === 'other' 
                        ? 'ring-2 ring-primary bg-primary/10' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    data-testid="button-platform-other"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-1">
                      <MoreHorizontal className="w-5 h-5" />
                    </div>
                    <span className="text-xs truncate w-full text-center">أخرى</span>
                  </button>
                )}
              </div>
            </div>

            {/* Subcategory Selection - Only show after platform is selected */}
            {selectedPlatform && subcategories.length > 0 && (
              <div dir="rtl">
                <Label className="text-sm text-muted-foreground mb-2 block text-right">القسم</Label>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory} dir="rtl">
                  <SelectTrigger data-testid="select-subcategory" className="text-right">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 w-[calc(100vw-3rem)] max-w-md" dir="rtl">
                    {subcategories.map(cat => (
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
          </>
        )}

        {/* Service Selection - Only show after subcategory is selected */}
        {(selectedSubcategory || !showCategorySelect) && (
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
        )}

        {/* Service Description from API */}
        {currentService?.description && (
          <Card className="p-4 bg-muted/30 border-muted" dir="rtl">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">وصف الخدمة</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {currentService.description}
            </p>
          </Card>
        )}

        {/* Link input - Only show after service is selected */}
        {selectedService && (
          <>
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
          </>
        )}
      </div>
    </Card>
  );
}
