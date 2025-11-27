import Header from '../Header';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Header 
          title="طلب جديد" 
          balance={25.50}
          onMenuClick={() => console.log('Menu clicked')}
        />
      </LanguageProvider>
    </ThemeProvider>
  );
}
