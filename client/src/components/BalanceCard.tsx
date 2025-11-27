import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Percent, CheckCircle2, Crown } from 'lucide-react';

interface BalanceCardProps {
  username: string;
  balance: number;
  totalSpent: number;
  discount: number;
  ordersCompleted: number;
  level?: string;
}

export default function BalanceCard({ 
  username, 
  balance, 
  totalSpent, 
  discount, 
  ordersCompleted,
  level = 'جديد'
}: BalanceCardProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-4 border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">{t('welcome')} {username}</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            <Crown className="w-3 h-3 ml-1" />
            {t('level')}: {level}
          </Badge>
        </div>
        <p className="text-sm opacity-90 mb-2">{t('welcomeMessage')}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 hover-elevate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('balance')}</p>
              <p className="text-2xl font-bold text-foreground">${balance.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover-elevate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('totalSpent')}</p>
              <p className="text-2xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover-elevate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('discount')}</p>
              <p className="text-2xl font-bold text-foreground">{discount}%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Percent className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover-elevate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('ordersCompleted')}</p>
              <p className="text-2xl font-bold text-foreground">{ordersCompleted.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
