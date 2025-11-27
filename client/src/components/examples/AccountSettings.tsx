import AccountSettings from '../AccountSettings';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function AccountSettingsExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background max-w-md">
          <AccountSettings
            user={{
              name: 'imohmmed',
              email: 'it.mohmmed@yahoo.com',
              phone: '+9647766699669',
            }}
            onChangeEmail={() => console.log('Change email clicked')}
            onChangePassword={() => console.log('Change password clicked')}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
