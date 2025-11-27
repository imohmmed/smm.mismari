import { useLanguage } from '@/contexts/LanguageContext';
import AccountSettings from '@/components/AccountSettings';
import { useToast } from '@/hooks/use-toast';

// todo: remove mock functionality - replace with API data
const mockUser = {
  name: 'imohmmed',
  email: 'it.mohmmed@yahoo.com',
  phone: '+9647766699669',
};

export default function AccountPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleChangeEmail = () => {
    console.log('Change email clicked');
    toast({
      title: 'تغيير البريد الإلكتروني',
      description: 'سيتم إرسال رابط التأكيد إلى بريدك الإلكتروني الحالي',
    });
  };

  const handleChangePassword = () => {
    console.log('Change password clicked');
    toast({
      title: 'تم تغيير كلمة المرور',
      description: 'تم تحديث كلمة المرور بنجاح',
    });
  };

  return (
    <div className="pb-4">
      <AccountSettings
        user={mockUser}
        onChangeEmail={handleChangeEmail}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
}
