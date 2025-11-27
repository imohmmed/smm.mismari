import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AccountSettings from '@/components/AccountSettings';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, User } from 'lucide-react';

export default function AccountPage() {
  const { language } = useLanguage();
  const { user, logout, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: language === 'ar' ? 'تم تسجيل الخروج' : 'Logged Out',
        description: language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'You have been logged out successfully',
      });
      setLocation('/');
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تسجيل الخروج' : 'An error occurred while logging out',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pb-4">
        <Card className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">
              {language === 'ar' ? 'مرحباً بك' : 'Welcome'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'قم بتسجيل الدخول أو إنشاء حساب للوصول إلى إعدادات حسابك'
                : 'Login or create an account to access your account settings'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setLocation('/login')}
              className="w-full gap-2"
              data-testid="button-login-account"
            >
              <LogIn className="w-4 h-4" />
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/register')}
              className="w-full gap-2"
              data-testid="button-register-account"
            >
              <UserPlus className="w-4 h-4" />
              {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const displayUser = {
    name: user.username,
    email: user.email || '',
    phone: user.phone || '',
  };

  return (
    <div className="pb-4">
      <AccountSettings
        user={displayUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
