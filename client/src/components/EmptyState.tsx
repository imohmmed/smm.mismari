import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Wallet } from 'lucide-react';

interface EmptyStateProps {
  type: 'orders' | 'balance';
  username?: string;
  onAction?: () => void;
}

export default function EmptyState({ type, username, onAction }: EmptyStateProps) {
  const { t } = useLanguage();

  if (type === 'orders') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-foreground mb-2">
          {username && <span>مرحباً {username}، </span>}
          {t('noOrders')}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {t('noOrdersMessage')}
        </p>
        <Button onClick={onAction} className="bg-success hover:bg-success/90 text-success-foreground">
          <Plus className="w-4 h-4 ml-2" />
          {t('newOrder')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Wallet className="w-10 h-10 text-muted-foreground" />
      </div>
      <p className="text-foreground mb-2">رصيدك الحالي فارغ</p>
      <p className="text-sm text-muted-foreground mb-6">
        قم بإضافة رصيد للبدء في طلب الخدمات
      </p>
      <Button onClick={onAction} className="bg-success hover:bg-success/90 text-success-foreground">
        <Wallet className="w-4 h-4 ml-2" />
        {t('addFunds')}
      </Button>
    </div>
  );
}
