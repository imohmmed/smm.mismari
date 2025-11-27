import PaymentMethods from '../PaymentMethods';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function PaymentMethodsExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background max-w-md">
          <PaymentMethods
            onSubmit={(method, amount) => console.log('Payment:', method, amount)}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
