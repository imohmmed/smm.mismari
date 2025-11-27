import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  Code, 
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountSettingsProps {
  user: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  onChangeEmail?: () => void;
  onChangePassword?: () => void;
}

export default function AccountSettings({ user, onChangeEmail, onChangePassword }: AccountSettingsProps) {
  const { t, direction } = useLanguage();
  const [twoFactor, setTwoFactor] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const ChevronIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;

  const settingsItems = [
    { 
      icon: Shield, 
      label: t('security'), 
      action: () => console.log('Security clicked'),
      badge: twoFactor ? 'ON' : 'OFF',
      badgeVariant: twoFactor ? 'default' : 'secondary'
    },
    { 
      icon: Bell, 
      label: t('notifications'), 
      action: () => console.log('Notifications clicked'),
      hasSwitch: true,
      switchValue: notifications,
      onSwitch: setNotifications
    },
    { 
      icon: Code, 
      label: t('apiInterface'), 
      action: () => console.log('API clicked')
    },
  ];

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

        <Button 
          onClick={onChangeEmail}
          className="w-full mt-4 bg-primary"
          data-testid="button-change-email"
        >
          <Mail className="w-4 h-4 ml-2" />
          {t('changeEmail')}
        </Button>
      </Card>

      <Card className="divide-y divide-border">
        <button
          onClick={() => setTwoFactor(!twoFactor)}
          className="flex items-center justify-between w-full p-4 hover-elevate"
          data-testid="button-two-factor"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium">{t('twoFactor')}</span>
          </div>
          <Badge variant={twoFactor ? 'default' : 'secondary'}>
            {twoFactor ? 'ON' : 'OFF'}
          </Badge>
        </button>

        <div
          className="flex items-center justify-between w-full p-4 hover-elevate cursor-pointer"
          onClick={() => setNotifications(!notifications)}
          data-testid="button-notifications"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <span className="font-medium">{t('notifications')}</span>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        <button
          onClick={() => console.log('API clicked')}
          className="flex items-center justify-between w-full p-4 hover-elevate"
          data-testid="button-api"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Code className="w-5 h-5 text-purple-500" />
            </div>
            <span className="font-medium">{t('apiInterface')}</span>
          </div>
          <ChevronIcon className="w-5 h-5 text-muted-foreground" />
        </button>
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
    </div>
  );
}
