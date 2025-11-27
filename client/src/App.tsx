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
import LandingPage from '@/pages/LandingPage';
import OrdersPage from '@/pages/OrdersPage';
import AddFundsPage from '@/pages/AddFundsPage';
import AccountPage from '@/pages/AccountPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Loader2, LogIn, UserPlus } from 'lucide-react';

type NavItem = 'account' | 'orders' | 'newOrder' | 'addFunds' | 'home';

function MainApp() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeNav, setActiveNav] = useState<NavItem>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const getPageTitle = () => {
    switch (activeNav) {
      case 'home': return 'الصفحة الرئيسية';
      case 'newOrder': return 'طلب جديد';
      case 'orders': return 'الطلبات';
      case 'addFunds': return 'إضافة الأموال';
      case 'account': return 'الحساب';
      default: return 'الصفحة الرئيسية';
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'newOrder' || page === 'orders' || page === 'addFunds' || page === 'account' || page === 'home') {
      setActiveNav(page as NavItem);
    }
  };

  const renderPage = () => {
    switch (activeNav) {
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'newOrder':
        return <HomePage onNavigate={handleNavigate} />;
      case 'orders':
        return <OrdersPage onNavigate={handleNavigate} />;
      case 'addFunds':
        return <AddFundsPage />;
      case 'account':
        return <AccountPage />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
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
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle className="text-right">الحساب</SheetTitle>
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
                  <span>الوضع الليلي</span>
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
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
                    لوحة التحكم
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
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">
                    قم بتسجيل الدخول للوصول لحسابك
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
                  تسجيل الدخول
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
                  إنشاء حساب
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={toggleTheme}
                  data-testid="button-theme-menu-guest"
                >
                  <span>الوضع الليلي</span>
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
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
