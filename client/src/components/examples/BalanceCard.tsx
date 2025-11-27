import BalanceCard from '../BalanceCard';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function BalanceCardExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background max-w-md">
          <BalanceCard 
            username="imohmmed"
            balance={125.50}
            totalSpent={850.00}
            discount={5}
            ordersCompleted={2586580}
            level="جديد"
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
