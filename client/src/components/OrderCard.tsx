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
import { Clock, CheckCircle2, XCircle, Loader2, RotateCcw, MessageCircle, Calendar, DollarSign, Package, Timer, AlertCircle } from 'lucide-react';

type OrderStatus = 'pending' | 'inProgress' | 'completed' | 'cancelled' | 'partial' | 'processing' | 'refunded';

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

const statusConfig: Record<OrderStatus, { color: string; icon: typeof CheckCircle2; bgColor: string; label: string }> = {
  pending: { color: 'text-yellow-500', icon: Clock, bgColor: 'bg-yellow-500/10', label: 'قيد الانتظار' },
  processing: { color: 'text-purple-500', icon: Loader2, bgColor: 'bg-purple-500/10', label: 'قيد المعالجة' },
  inProgress: { color: 'text-blue-500', icon: Loader2, bgColor: 'bg-blue-500/10', label: 'جاري التنفيذ' },
  completed: { color: 'text-green-500', icon: CheckCircle2, bgColor: 'bg-green-500/10', label: 'مكتمل' },
  cancelled: { color: 'text-red-500', icon: XCircle, bgColor: 'bg-red-500/10', label: 'ملغي' },
  partial: { color: 'text-orange-500', icon: AlertCircle, bgColor: 'bg-orange-500/10', label: 'ملغي بشكل جزئي' },
  refunded: { color: 'text-cyan-500', icon: RotateCcw, bgColor: 'bg-cyan-500/10', label: 'مسترد' },
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
  const PlatformIcon = platformIcons[platform.toLowerCase()] || SiInstagram;
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  
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

  const truncateLink = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <Card className="p-4 hover-elevate overflow-visible">
      {/* Header with Date and Order ID */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
        <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
          {id}
        </Badge>
      </div>

      {/* Service Name with Platform Icon */}
      <div className="flex items-start gap-3 mb-3">
        <p className="font-medium text-foreground text-sm leading-relaxed flex-1">{serviceName}</p>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
          <PlatformIcon className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Status Badge and Action Buttons Row */}
      <div className="flex items-center justify-between mb-3">
        {/* Action Buttons - Left Side */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRepeat}
            disabled={!serviceId}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            data-testid={`button-repeat-order-${id}`}
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[10px]">تكرار</span>
          </button>
          <button 
            onClick={handleSupport}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            data-testid={`button-support-order-${id}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px]">الدعم</span>
          </button>
        </div>

        {/* Status Badge - Right Side */}
        <Badge variant="secondary" className={`${statusInfo.bgColor} ${statusInfo.color} border-0 px-3 py-1`}>
          <StatusIcon className={`w-3 h-3 ml-1 ${(status === 'inProgress' || status === 'processing') ? 'animate-spin' : ''}`} />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Link */}
      {link && (
        <div className="mb-3 p-2 bg-muted/30 rounded-md border border-border/50">
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-xs break-all"
            data-testid={`link-order-${id}`}
          >
            {truncateLink(link)}
          </a>
        </div>
      )}

      {/* Stats Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Time / Date */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">وقت:</span>
            <Timer className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-medium mt-1">{date}</p>
        </div>

        {/* Amount / Price */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">المبلغ:</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-bold text-primary mt-1">{price.toFixed(4)}</p>
        </div>

        {/* Quantity */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">الكمية:</span>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-medium mt-1">{quantity.toLocaleString()}</p>
        </div>

        {/* Remaining - Replaced Start Count */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">المتبقي:</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-medium mt-1">{safeRemains.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {(status === 'inProgress' || status === 'processing') && quantity > 0 && (
        <div className="mb-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-1">
            {Math.round(progress)}% مكتمل
          </p>
        </div>
      )}
    </Card>
  );
}
