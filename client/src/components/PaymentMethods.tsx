import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn, toEnglishNumbers } from '@/lib/utils';

type PaymentMethod = 'rafidain' | 'zainCash' | 'asiaCash';

interface PaymentMethodsProps {
  onSubmit: (method: PaymentMethod, amount: number) => void;
}

export default function PaymentMethods({ onSubmit }: PaymentMethodsProps) {
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('rafidain');
  const [amount, setAmount] = useState('');

  const methods: { id: PaymentMethod; name: string; icon: typeof CreditCard; description: string }[] = [
    { 
      id: 'rafidain', 
      name: 'ماستر كارد الرافدين', 
      icon: CreditCard,
      description: 'ادفع عبر ماستر كارد الرافدين'
    },
    { 
      id: 'zainCash', 
      name: t('zainCash'), 
      icon: Smartphone,
      description: 'ادفع عبر محفظة زين كاش'
    },
    { 
      id: 'asiaCash', 
      name: t('asiaCash'), 
      icon: Smartphone,
      description: 'ادفع عبر آسيا سيل'
    },
  ];

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (amountNum >= 10) {
      onSubmit(selectedMethod, amountNum);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-4 border-0">
        <h2 className="text-lg font-semibold mb-2 text-right">{t('acceptPayments')}</h2>
        <p className="text-sm opacity-90 text-right">{t('contactPayment')}</p>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2 flex-row-reverse justify-end">
          <CreditCard className="w-5 h-5" />
          {t('paymentMethods')}
        </h3>

        <RadioGroup 
          value={selectedMethod} 
          onValueChange={(v) => setSelectedMethod(v as PaymentMethod)}
          className="space-y-3"
          dir="rtl"
        >
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer flex-row-reverse",
                  selectedMethod === method.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setSelectedMethod(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex-1 text-right">
                  <Label htmlFor={method.id} className="font-medium cursor-pointer">
                    {method.name}
                  </Label>
                </div>
                <Icon className="w-6 h-6 text-muted-foreground" />
              </div>
            );
          })}
        </RadioGroup>

        <div className="mt-4">
          <Label className="text-sm text-muted-foreground mb-2 block text-right">المبلغ (بالدولار)</Label>
          <div className="w-1/4 ml-auto">
            <Input
              type="text"
              inputMode="decimal"
              pattern="[0-9.]*"
              value={amount}
              onChange={(e) => setAmount(toEnglishNumbers(e.target.value).replace(/[^\d.]/g, ''))}
              placeholder="10.00"
              className="text-lg text-left"
              dir="ltr"
              data-testid="input-amount"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">{t('minDeposit')}: 10 دولار</p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) < 10}
          className="w-full mt-4 bg-success hover:bg-success/90 text-success-foreground"
          data-testid="button-add-funds"
        >
          {t('addBalance')}
        </Button>
      </Card>

      <Card className="p-4" dir="rtl">
        <h3 className="font-semibold mb-3 text-right">{t('instructions')}</h3>
        
        <div className="flex items-center gap-2 mb-3 text-sm font-medium flex-row-reverse justify-end">
          <AlertCircle className="w-4 h-4 text-destructive" />
          {t('importantNotes')}
        </div>
        
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
            <span className="text-left" dir="ltr">{t('minDeposit')}: 10 دولار</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
            <span className="text-left" dir="ltr">{t('paymentNote')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
            <span className="text-left" dir="ltr">{t('cvcNote')}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span className="text-left" dir="ltr">{t('contactSupport')}</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
