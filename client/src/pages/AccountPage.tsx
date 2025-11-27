import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AccountSettings from '@/components/AccountSettings';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// todo: remove mock functionality - replace with API data
const mockUser = {
  name: 'imohmmed',
  email: 'it.mohmmed@yahoo.com',
  phone: '+9647766699669',
};

export default function AccountPage() {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleChangeUsername = () => {
    console.log('Change username clicked');
    toast({
      title: language === 'ar' ? 'تغيير اسم المستخدم' : 'Change Username',
      description: language === 'ar' ? 'قريباً - ستتمكن من تغيير اسم المستخدم' : 'Coming soon - You will be able to change username',
    });
  };

  const handleChangeEmail = () => {
    console.log('Change email clicked');
    toast({
      title: language === 'ar' ? 'تغيير البريد الإلكتروني' : 'Change Email',
      description: language === 'ar' ? 'سيتم إرسال رابط التأكيد إلى بريدك الإلكتروني الحالي' : 'A confirmation link will be sent to your current email',
    });
  };

  const handleChangePhone = () => {
    console.log('Change phone clicked');
    toast({
      title: language === 'ar' ? 'تغيير رقم الهاتف' : 'Change Phone Number',
      description: language === 'ar' ? 'قريباً - ستتمكن من تغيير رقم الهاتف' : 'Coming soon - You will be able to change phone number',
    });
  };

  const handleChangePassword = () => {
    console.log('Change password clicked');
    toast({
      title: language === 'ar' ? 'تم تغيير كلمة المرور' : 'Password Changed',
      description: language === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully',
    });
  };

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

  const displayUser = user ? {
    name: user.username,
    email: user.email || '',
    phone: user.phone || '',
  } : mockUser;

  return (
    <div className="pb-4">
      <AccountSettings
        user={displayUser}
        onChangeUsername={handleChangeUsername}
        onChangeEmail={handleChangeEmail}
        onChangePhone={handleChangePhone}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
      />
    </div>
  );
}
