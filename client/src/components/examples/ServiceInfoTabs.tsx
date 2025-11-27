import ServiceInfoTabs from '../ServiceInfoTabs';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const mockNewServices = [
  { id: 18629, name: 'مشاركات تيك توك - السرعة: 100 مليون كل يوم', date: '27-11-2025' },
  { id: 18628, name: 'تقييمات صفحة فيسبوك - تقييمات مخصصة - ذكور', date: '27-11-2025' },
  { id: 18627, name: 'تقييمات صفحة فيسبوك - تقييمات مخصصة - نساء', date: '27-11-2025' },
];

export default function ServiceInfoTabsExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background max-w-md">
          <ServiceInfoTabs newServices={mockNewServices} />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
