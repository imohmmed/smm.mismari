import OrdersFilter from '../OrdersFilter';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function OrdersFilterExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background max-w-md">
          <OrdersFilter
            onSearch={(query) => console.log('Search:', query)}
            onFilterChange={(status) => console.log('Filter:', status)}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
