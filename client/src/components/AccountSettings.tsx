import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Mail, 
  Phone, 
  Lock,
  User,
  LogOut,
  Loader2,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';

interface AccountSettingsProps {
  user: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export default function AccountSettings({ user, onLogout }: AccountSettingsProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { refetchUser } = useAuth();
  
  const [username, setUsername] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const hasProfileChanges = username !== user.name || email !== user.email || phone !== user.phone;

  const handleSaveProfile = async () => {
    if (!hasProfileChanges) {
      toast({
        title: "لا توجد تغييرات",
        description: "لم تقم بتغيير أي بيانات",
      });
      return;
    }
    setShowPasswordDialog(true);
  };

  const confirmSaveProfile = async () => {
    if (!confirmPasswordValue) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة المرور",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: confirmPasswordValue,
          username,
          email,
          phone,
        }),
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        toast({
          title: "خطأ",
          description: data.error || "فشل تحديث البيانات",
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم بنجاح",
          description: data.message,
        });
        refetchUser();
        setShowPasswordDialog(false);
        setConfirmPasswordValue('');
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        toast({
          title: "خطأ",
          description: data.error || "فشل تغيير كلمة المرور",
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم بنجاح",
          description: data.message,
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
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
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">اسم المستخدم</Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pr-10"
                dir="ltr"
                data-testid="input-edit-username"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10"
                dir="ltr"
                data-testid="input-edit-email"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">رقم الهاتف</Label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pr-10"
                dir="ltr"
                placeholder="+964..."
                data-testid="input-edit-phone"
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveProfile}
            className="w-full bg-primary"
            disabled={!hasProfileChanges || isUpdating}
            data-testid="button-save-profile"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ التغييرات
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
            <Input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1" 
              dir="ltr"
              data-testid="input-current-password" 
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">{t('newPassword')}</Label>
            <Input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1" 
              dir="ltr"
              data-testid="input-new-password" 
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">تأكيد كلمة المرور الجديدة</Label>
            <Input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1" 
              dir="ltr"
              data-testid="input-confirm-new-password" 
            />
          </div>
          <Button 
            onClick={handleChangePassword}
            variant="outline" 
            className="w-full"
            disabled={isChangingPassword}
            data-testid="button-change-password"
          >
            {isChangingPassword ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : null}
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

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              لتأكيد التغييرات، يرجى إدخال كلمة المرور الحالية
            </p>
            <Input
              type="password"
              value={confirmPasswordValue}
              onChange={(e) => setConfirmPasswordValue(e.target.value)}
              placeholder="كلمة المرور"
              dir="ltr"
              data-testid="input-confirm-password-dialog"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setConfirmPasswordValue('');
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={confirmSaveProfile}
              disabled={isUpdating || !confirmPasswordValue}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : null}
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
