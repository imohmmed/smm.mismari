import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  SiInstagram, 
  SiYoutube, 
  SiFacebook, 
  SiTiktok, 
  SiX, 
  SiTelegram 
} from 'react-icons/si';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

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

export default function OrderCard({
  id,
  serviceName,
  platform,
  link,
  quantity,
  startCount = 0,
  remains = 0,
  status,
  price,
  date
}: OrderCardProps) {
  const { t } = useLanguage();
  const PlatformIcon = platformIcons[platform.toLowerCase()] || SiInstagram;
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  
  const progress = remains > 0 ? ((quantity - remains) / quantity) * 100 : (status === 'completed' ? 100 : 0);

  return (
    <Card className="p-4 hover-elevate">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
            <PlatformIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{serviceName}</p>
            <p className="text-xs text-muted-foreground">#{id}</p>
          </div>
        </div>
        <Badge variant="secondary" className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
          <StatusIcon className={`w-3 h-3 ml-1 ${status === 'inProgress' ? 'animate-spin' : ''}`} />
          {t(status)}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('quantity')}</span>
          <span className="font-medium">{quantity.toLocaleString()}</span>
        </div>
        {startCount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Start Count</span>
            <span className="font-medium">{startCount.toLocaleString()}</span>
          </div>
        )}
        {remains > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remains</span>
            <span className="font-medium">{remains.toLocaleString()}</span>
          </div>
        )}
      </div>

      {status === 'inProgress' && (
        <Progress value={progress} className="h-2 mb-3" />
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">{date}</span>
        <span className="font-bold text-primary">${price.toFixed(4)}</span>
      </div>
    </Card>
  );
}
