import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Menu, Moon, Sun, Wallet, LogIn } from 'lucide-react';
import { useLocation } from 'wouter';

interface HeaderProps {
  title: string;
  balance?: number;
  onMenuClick?: () => void;
  isLoggedIn?: boolean;
}

export default function Header({ title, balance = 0, onMenuClick, isLoggedIn = false }: HeaderProps) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 h-14 px-4 bg-background border-b border-border">
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <div className="flex items-center gap-2 bg-card rounded-full px-3 py-1.5 border border-card-border">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">${balance.toFixed(2)}</span>
          </div>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={() => setLocation('/login')}
            className="gap-2"
            data-testid="button-login-header"
          >
            <LogIn className="w-4 h-4" />
            <span>دخول</span>
          </Button>
        )}
      </div>

      <h1 className="text-lg font-semibold text-foreground absolute left-1/2 -translate-x-1/2">{title}</h1>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={onMenuClick}
          data-testid="button-menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
