import { useState } from 'react';
import PlatformGrid, { type Platform } from '../PlatformGrid';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function PlatformGridExample() {
  const [selected, setSelected] = useState<Platform | null>(null);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background">
          <PlatformGrid 
            selectedPlatform={selected}
            onPlatformSelect={(platform) => {
              setSelected(platform);
              console.log('Platform selected:', platform);
            }}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
