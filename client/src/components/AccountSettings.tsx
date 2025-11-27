import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  Lock,
  User,
  LogOut
} from 'lucide-react';

interface AccountSettingsProps {
  user: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  onChangeUsername?: () => void;
  onChangeEmail?: () => void;
  onChangePhone?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
}

export default function AccountSettings({ user, onChangeUsername, onChangeEmail, onChangePhone, onChangePassword, onLogout }: AccountSettingsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="w-20 h-20 mb-3">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-primary">{user.name}</h2>
          <Badge variant="secondary" className="mt-2 bg-success/20 text-success">
            {t('new')}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm" dir="ltr">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm" dir="ltr">{user.phone}</span>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <Button 
            onClick={onChangeUsername}
            className="w-full bg-primary"
            data-testid="button-change-username"
          >
            <User className="w-4 h-4 ml-2" />
            {t('changeUsername')}
          </Button>

          <Button 
            onClick={onChangeEmail}
            className="w-full bg-primary"
            data-testid="button-change-email"
          >
            <Mail className="w-4 h-4 ml-2" />
            {t('changeEmail')}
          </Button>

          <Button 
            onClick={onChangePhone}
            className="w-full bg-primary"
            data-testid="button-change-phone"
          >
            <Phone className="w-4 h-4 ml-2" />
            {t('changePhone')}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          {t('password')}
        </h3>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">{t('currentPassword')}</Label>
            <Input type="password" className="mt-1" data-testid="input-current-password" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">{t('newPassword')}</Label>
            <Input type="password" className="mt-1" data-testid="input-new-password" />
          </div>
          <Button 
            onClick={onChangePassword}
            variant="outline" 
            className="w-full"
            data-testid="button-change-password"
          >
            تغيير كلمة المرور
          </Button>
        </div>
      </Card>

      <Button 
        onClick={onLogout}
        variant="destructive" 
        className="w-full"
        data-testid="button-logout"
      >
        <LogOut className="w-4 h-4 ml-2" />
        {t('logout')}
      </Button>
    </div>
  );
}
