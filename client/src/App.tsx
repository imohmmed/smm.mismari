import { useState, useEffect } from 'react';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import HomePage from '@/pages/HomePage';
import OrdersPage from '@/pages/OrdersPage';
import AddFundsPage from '@/pages/AddFundsPage';
import AccountPage from '@/pages/AccountPage';
import SupportPage from '@/pages/SupportPage';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Globe } from 'lucide-react';

type NavItem = 'account' | 'orders' | 'newOrder' | 'addFunds' | 'support';

// todo: remove mock functionality - replace with API data
const mockBalance = 0;

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeNav, setActiveNav] = useState<NavItem>('newOrder');
  const [menuOpen, setMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeNav) {
      case 'newOrder': return t('newOrder');
      case 'orders': return t('orders');
      case 'addFunds': return t('addFunds');
      case 'account': return t('account');
      case 'support': return t('support');
      default: return t('home');
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'newOrder' || page === 'orders' || page === 'addFunds' || page === 'account' || page === 'support') {
      setActiveNav(page as NavItem);
    }
  };

  const renderPage = () => {
    switch (activeNav) {
      case 'newOrder':
        return <HomePage onNavigate={handleNavigate} />;
      case 'orders':
        return <OrdersPage onNavigate={handleNavigate} />;
      case 'addFunds':
        return <AddFundsPage />;
      case 'account':
        return <AccountPage />;
      case 'support':
        return <SupportPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title={getPageTitle()}
        balance={mockBalance}
        onMenuClick={() => setMenuOpen(true)}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {renderPage()}
      </main>

      <BottomNavigation
        activeItem={activeNav}
        onItemClick={setActiveNav}
      />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side={language === 'ar' ? 'left' : 'right'} className="w-72">
          <SheetHeader>
            <SheetTitle className="text-right">الإعدادات</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={toggleTheme}
              data-testid="button-theme-menu"
            >
              <span>الوضع الليلي</span>
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              data-testid="button-language-menu"
            >
              <span>اللغة</span>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span>{language === 'ar' ? 'العربية' : 'English'}</span>
              </div>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppContent />
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
