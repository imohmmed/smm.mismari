import { useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import HomePage from '@/pages/HomePage';
import OrdersPage from '@/pages/OrdersPage';
import AddFundsPage from '@/pages/AddFundsPage';
import AccountPage from '@/pages/AccountPage';
import SupportPage from '@/pages/SupportPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Globe, Loader2, LogIn, UserPlus } from 'lucide-react';

type NavItem = 'account' | 'orders' | 'newOrder' | 'addFunds' | 'support';

function MainApp() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeNav, setActiveNav] = useState<NavItem>('newOrder');
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title={getPageTitle()}
        balance={user?.balance || 0}
        onMenuClick={() => setMenuOpen(true)}
        isLoggedIn={!!user}
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
            <SheetTitle className="text-right">{t('account')}</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-4">
            {user ? (
              <>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-lg font-bold text-green-500 mt-2">${user.balance.toFixed(2)}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={toggleTheme}
                  data-testid="button-theme-menu"
                >
                  <span>{language === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</span>
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                  data-testid="button-language-menu"
                >
                  <span>{language === 'ar' ? 'اللغة' : 'Language'}</span>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>{language === 'ar' ? 'العربية' : 'English'}</span>
                  </div>
                </Button>
                {user.role === 'admin' && (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setMenuOpen(false);
                      setLocation('/admin');
                    }}
                    data-testid="button-admin-panel"
                  >
                    {t('adminPanel')}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  data-testid="button-logout"
                >
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'قم بتسجيل الدخول للوصول لحسابك' : 'Login to access your account'}
                  </p>
                </div>
                <Button
                  variant="default"
                  className="w-full gap-2"
                  onClick={() => {
                    setMenuOpen(false);
                    setLocation('/login');
                  }}
                  data-testid="button-login-menu"
                >
                  <LogIn className="w-4 h-4" />
                  {t('login')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setMenuOpen(false);
                    setLocation('/register');
                  }}
                  data-testid="button-register-menu"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('register')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={toggleTheme}
                  data-testid="button-theme-menu-guest"
                >
                  <span>{language === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</span>
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                  data-testid="button-language-menu-guest"
                >
                  <span>{language === 'ar' ? 'اللغة' : 'Language'}</span>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>{language === 'ar' ? 'العربية' : 'English'}</span>
                  </div>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/" component={MainApp} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppRoutes />
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
