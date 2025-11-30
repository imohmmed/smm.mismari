import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Phone, Loader2, Check, X, RefreshCw, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toEnglishNumbers } from "@/lib/utils";

export default function RegisterPage() {
  const { t, direction } = useLanguage();
  const { register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  
  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const response = await fetch("/api/captcha");
      const data = await response.json();
      setCaptchaQuestion(data.question);
      setCaptchaAnswer("");
    } catch (error) {
      console.error("Failed to fetch captcha:", error);
    } finally {
      setCaptchaLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);
  
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

  const checkUsername = useCallback(async (name: string) => {
    if (!name || name.length < 3) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return;
    }

    setUsernameStatus({ checking: true, available: null, message: "" });

    try {
      const response = await fetch(`/api/auth/check-username/${encodeURIComponent(name)}`);
      const data = await response.json();
      setUsernameStatus({
        checking: false,
        available: data.available,
        message: data.message,
      });
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: null,
        message: "حدث خطأ في التحقق",
      });
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.length >= 3) {
        checkUsername(username);
      } else {
        setUsernameStatus({ checking: false, available: null, message: "" });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: t("error"),
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (usernameStatus.available === false) {
      toast({
        title: t("error"),
        description: "اسم المستخدم غير متاح",
        variant: "destructive",
      });
      return;
    }

    if (!captchaAnswer) {
      toast({
        title: t("error"),
        description: "يرجى حل رمز التحقق",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password, phone || undefined, captchaAnswer);
      toast({
        title: t("registerSuccess"),
        variant: "default",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
      // Refresh captcha on error
      fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={direction}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">SMM</span>
          </div>
          <CardTitle className="text-2xl">{t("register")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  placeholder="username"
                  required
                  dir="ltr"
                  data-testid="input-username"
                />
              </div>
              {/* Username availability status */}
              {username.length >= 3 && (
                <div className="flex items-center gap-2 text-sm mt-1" dir="rtl">
                  {usernameStatus.checking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">جاري التحقق...</span>
                    </>
                  ) : usernameStatus.available === true ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-success">{usernameStatus.message}</span>
                    </>
                  ) : usernameStatus.available === false ? (
                    <>
                      <X className="w-4 h-4 text-destructive" />
                      <span className="text-destructive">{usernameStatus.message}</span>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9+]*"
                  value={phone}
                  onChange={(e) => setPhone(toEnglishNumbers(e.target.value).replace(/[^\d+]/g, ''))}
                  className="pl-10"
                  placeholder="+964..."
                  dir="ltr"
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  dir="ltr"
                  data-testid="input-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  dir="ltr"
                  data-testid="input-confirm-password"
                />
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="space-y-2">
              <Label>رمز التحقق</Label>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                <Shield className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {captchaLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-lg font-bold text-foreground" dir="ltr">
                        {captchaQuestion} = ?
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={fetchCaptcha}
                  disabled={captchaLoading}
                  data-testid="button-refresh-captcha"
                >
                  <RefreshCw className={`w-4 h-4 ${captchaLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <Input
                type="number"
                inputMode="numeric"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(toEnglishNumbers(e.target.value))}
                placeholder="أدخل الناتج"
                required
                dir="ltr"
                className="text-center text-lg"
                data-testid="input-captcha"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || usernameStatus.available === false}
              data-testid="button-register"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("register")
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t("haveAccount")} </span>
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
              {t("login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
