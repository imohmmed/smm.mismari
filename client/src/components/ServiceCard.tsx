import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, RefreshCw, Clock, Zap } from 'lucide-react';

interface ServiceCardProps {
  id: number;
  name: string;
  price: number;
  minQuantity: number;
  maxQuantity: number;
  description?: string;
  speed?: string;
  refill?: boolean;
  cancel?: boolean;
  isBest?: boolean;
  onBuy: () => void;
}

export default function ServiceCard({
  id,
  name,
  price,
  minQuantity,
  maxQuantity,
  description,
  speed,
  refill = false,
  cancel = false,
  isBest = false,
  onBuy
}: ServiceCardProps) {
  const { t } = useLanguage();
  // price already includes profit margin from the backend
  const priceWithMarkup = price;

  return (
    <Card className="p-4 hover-elevate">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {id}
            </Badge>
            {isBest && (
              <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                <Star className="w-3 h-3 ml-1" />
                {t('readBeforeOrder')}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-relaxed">{name}</h3>
        </div>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {refill && (
          <Badge variant="secondary" className="text-xs">
            <RefreshCw className="w-3 h-3 ml-1" />
            {t('refillGuarantee')}
          </Badge>
        )}
        {speed && (
          <Badge variant="secondary" className="text-xs">
            <Zap className="w-3 h-3 ml-1" />
            {speed}
          </Badge>
        )}
        {cancel && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 ml-1" />
            {t('startTime')}: 0-1h
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-primary">${priceWithMarkup.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground">
            {t('min')}: {minQuantity.toLocaleString()} | {t('max')}: {maxQuantity.toLocaleString()}
          </p>
        </div>
        <Button 
          onClick={onBuy}
          className="bg-success hover:bg-success/90 text-success-foreground"
          data-testid={`button-buy-service-${id}`}
        >
          {t('buyNow')}
        </Button>
      </div>
    </Card>
  );
}
