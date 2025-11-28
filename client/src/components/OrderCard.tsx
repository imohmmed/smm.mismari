import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  SiInstagram, 
  SiYoutube, 
  SiFacebook, 
  SiTiktok, 
  SiX, 
  SiTelegram 
} from 'react-icons/si';
import { Clock, CheckCircle2, XCircle, Loader2, RotateCcw, MessageCircle, Calendar } from 'lucide-react';

type OrderStatus = 'pending' | 'inProgress' | 'completed' | 'cancelled' | 'partial';

interface OrderCardProps {
  id: number;
  serviceName: string;
  platform: string;
  link: string;
  quantity: number;
  startCount?: number;
  remains?: number;
  status: OrderStatus;
  price: number;
  date: string;
  onRepeat?: (serviceId: number, link: string, quantity: number) => void;
  serviceId?: number;
}

const platformIcons: Record<string, typeof SiInstagram> = {
  instagram: SiInstagram,
  youtube: SiYoutube,
  facebook: SiFacebook,
  tiktok: SiTiktok,
  twitter: SiX,
  telegram: SiTelegram,
};

const statusConfig: Record<OrderStatus, { color: string; icon: typeof CheckCircle2; bgColor: string }> = {
  pending: { color: 'text-yellow-500', icon: Clock, bgColor: 'bg-yellow-500/10' },
  inProgress: { color: 'text-blue-500', icon: Loader2, bgColor: 'bg-blue-500/10' },
  completed: { color: 'text-green-500', icon: CheckCircle2, bgColor: 'bg-green-500/10' },
  cancelled: { color: 'text-red-500', icon: XCircle, bgColor: 'bg-red-500/10' },
  partial: { color: 'text-orange-500', icon: Clock, bgColor: 'bg-orange-500/10' },
};

const WHATSAPP_NUMBER = '9647766699669';

export default function OrderCard({
  id,
  serviceName,
  platform,
  link,
  quantity,
  startCount,
  remains,
  status,
  price,
  date,
  onRepeat,
  serviceId
}: OrderCardProps) {
  const { t } = useLanguage();
  const PlatformIcon = platformIcons[platform.toLowerCase()] || SiInstagram;
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  
  // Handle null/undefined values with defaults
  const safeStartCount = startCount ?? 0;
  const safeRemains = remains ?? 0;
  
  const progress = safeRemains > 0 ? ((quantity - safeRemains) / quantity) * 100 : (status === 'completed' ? 100 : 0);

  const handleSupport = () => {
    const message = `السلام عليكم
لدي استفسار بخصوص طلبي
كود الطلب: ${id}
تاريخ الطلب: ${date}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleRepeat = () => {
    if (onRepeat && serviceId) {
      onRepeat(serviceId, link, quantity);
    }
  };

  return (
    <Card className="p-4 hover-elevate">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
            <PlatformIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <Badge className="bg-primary text-primary-foreground text-xs mb-1">
              {id}
            </Badge>
            <p className="font-semibold text-foreground text-sm leading-tight">{serviceName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('quantity')}</span>
          <span className="font-medium">{quantity.toLocaleString()}</span>
        </div>
        {safeStartCount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">عداد البدء</span>
            <span className="font-medium">{safeStartCount.toLocaleString()}</span>
          </div>
        )}
        {safeRemains > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">المتبقي</span>
            <span className="font-medium">{safeRemains.toLocaleString()}</span>
          </div>
        )}
      </div>

      {status === 'inProgress' && (
        <Progress value={progress} className="h-2 mb-3" />
      )}

      <div className="flex items-center justify-between py-2 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
        <span className="font-bold text-primary">${price.toFixed(4)}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Badge variant="secondary" className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
          <StatusIcon className={`w-3 h-3 ml-1 ${status === 'inProgress' ? 'animate-spin' : ''}`} />
          {t(status)}
        </Badge>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs"
            onClick={handleRepeat}
            disabled={!serviceId}
            data-testid={`button-repeat-order-${id}`}
          >
            <RotateCcw className="w-3 h-3" />
            تكرار
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs"
            onClick={handleSupport}
            data-testid={`button-support-order-${id}`}
          >
            <MessageCircle className="w-3 h-3" />
            الدعم
          </Button>
        </div>
      </div>
    </Card>
  );
}
