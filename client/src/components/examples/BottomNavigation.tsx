import { useState } from 'react';
import BottomNavigation from '../BottomNavigation';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function BottomNavigationExample() {
  const [activeItem, setActiveItem] = useState<'account' | 'orders' | 'newOrder' | 'addFunds' | 'support'>('newOrder');

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="h-24 bg-background">
          <BottomNavigation 
            activeItem={activeItem}
            onItemClick={(item) => {
              setActiveItem(item);
              console.log('Nav item clicked:', item);
            }}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
