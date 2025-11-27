import { useLanguage } from '@/contexts/LanguageContext';
import PaymentMethods from '@/components/PaymentMethods';
import { useToast } from '@/hooks/use-toast';

export default function AddFundsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handlePayment = (method: string, amount: number) => {
    console.log('Payment submitted:', { method, amount });
    // todo: implement payment processing
    
    toast({
      title: 'تم إرسال طلب الدفع',
      description: `سيتم معالجة طلبك بقيمة $${amount} قريباً`,
    });
  };

  return (
    <div className="pb-4">
      <PaymentMethods onSubmit={handlePayment} />
    </div>
  );
}
