import OrderForm from '../OrderForm';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const mockServices = [
  { id: 18193, name: 'مشاهدات فيديو انستجرام', price: 0.0015, minQuantity: 100, maxQuantity: 10000000, category: 'مشاهدات' },
  { id: 18194, name: 'لايكات انستجرام', price: 0.002, minQuantity: 50, maxQuantity: 500000, category: 'لايكات' },
  { id: 18195, name: 'متابعين انستجرام', price: 0.005, minQuantity: 100, maxQuantity: 100000, category: 'متابعين' },
];

const mockCategories = ['مشاهدات', 'لايكات', 'متابعين', 'تعليقات'];

export default function OrderFormExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background max-w-md">
          <OrderForm
            services={mockServices}
            categories={mockCategories}
            onSubmit={(order) => console.log('Order submitted:', order)}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
