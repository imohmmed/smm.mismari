import EmptyState from '../EmptyState';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';

export default function EmptyStateExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background max-w-md space-y-4">
          <Card>
            <EmptyState 
              type="orders" 
              username="imohmmed"
              onAction={() => console.log('New order clicked')}
            />
          </Card>
          <Card>
            <EmptyState 
              type="balance"
              onAction={() => console.log('Add funds clicked')}
            />
          </Card>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
