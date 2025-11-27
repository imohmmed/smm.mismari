import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  UserPlus, 
  Wallet, 
  ShoppingBag,
  Shield,
  Zap,
  HeadphonesIcon,
  Layout,
  DollarSign,
  Clock,
  CreditCard,
  Lock,
  Code,
  Headphones,
  Smartphone,
  TrendingUp
} from 'lucide-react';
import { 
  SiInstagram, 
  SiYoutube, 
  SiFacebook, 
  SiTiktok, 
  SiX, 
  SiTelegram,
  SiSnapchat,
  SiSpotify,
  SiDiscord,
  SiTwitch,
  SiWhatsapp,
  SiThreads
} from 'react-icons/si';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: statsData } = useQuery<{ orders?: number; users?: number; services?: number }>({
    queryKey: ['/api/stats'],
  });

  const stats = {
    orders: statsData?.orders ?? 0,
    users: statsData?.users ?? 0,
    services: statsData?.services ?? 0
  };

  const platforms = [
    { icon: SiInstagram, name: 'انستجرام', color: 'text-pink-500' },
    { icon: SiYoutube, name: 'يوتيوب', color: 'text-red-500' },
    { icon: SiFacebook, name: 'فيسبوك', color: 'text-blue-600' },
    { icon: SiTiktok, name: 'تيك توك', color: 'text-foreground' },
    { icon: SiX, name: 'تويتر', color: 'text-foreground' },
    { icon: SiTelegram, name: 'تليجرام', color: 'text-blue-400' },
    { icon: SiSnapchat, name: 'سناب شات', color: 'text-yellow-400' },
    { icon: SiSpotify, name: 'سبوتيفاي', color: 'text-green-500' },
    { icon: SiDiscord, name: 'ديسكورد', color: 'text-indigo-500' },
    { icon: SiTwitch, name: 'تويتش', color: 'text-purple-500' },
    { icon: SiWhatsapp, name: 'واتساب', color: 'text-green-500' },
    { icon: SiThreads, name: 'ثريدز', color: 'text-foreground' },
  ];

  const features = [
    {
      icon: Lock,
      title: 'لا نحتاج كلمة المرور',
      description: 'نستخدم طرق دفع آمنة لحماية معلوماتك الشخصية. جميع المعاملات تتم بدون الحاجة لكلمة المرور.'
    },
    {
      icon: Code,
      title: 'دعم API',
      description: 'نوفر دعم API لعملائنا لوضع الطلبات تلقائياً. يمكنك دمج قوة لوحة SMM في موقعك مجاناً.'
    },
    {
      icon: Headphones,
      title: 'دعم على مدار الساعة',
      description: 'فريق الدعم المخصص لدينا متاح دائماً للمساعدة في أي أسئلة أو استفسارات لضمان تجربة سلسة.'
    },
    {
      icon: Layout,
      title: 'لوحة تحكم سهلة',
      description: 'لوحة تحكم مصممة بأناقة وسهلة الاستخدام توفر مقاييس وتحليلات حيوية لمساعدتك على النمو.'
    },
    {
      icon: DollarSign,
      title: 'أسعار منخفضة',
      description: 'كمزود رائد لخدمات السوشيال ميديا، نقدم حلولاً بأسعار معقولة تبدأ من $0.0001/ألف.'
    },
    {
      icon: Zap,
      title: 'تسليم فوري',
      description: 'هل سئمت من الخدمات التي لا تبدأ ولا تنتهي؟ سنبدأ معالجة طلبك خلال ثوانٍ.'
    },
    {
      icon: CreditCard,
      title: 'طرق دفع متعددة',
      description: 'يمكن لعملائنا الدفع بأكثر من طريقة دفع تناسبهم. إذا لم تجد الطريقة المناسبة، تواصل معنا.'
    },
    {
      icon: Shield,
      title: 'خدمات عالية الجودة',
      description: 'نقدم خدمات حقيقية وعالية الجودة تلبي احتياجات مختلف المستخدمين.'
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      title: 'سجل مجاناً',
      description: 'سجل بسرعة للوصول إلى الخدمات فوراً',
      action: () => setLocation('/register'),
      buttonText: 'تسجيل'
    },
    {
      icon: Wallet,
      title: 'أضف رصيد',
      description: 'اختر طريقة الدفع وأضف الرصيد',
      action: () => onNavigate('addFunds'),
      buttonText: 'إضافة رصيد'
    },
    {
      icon: ShoppingBag,
      title: 'اطلب الخدمة',
      description: 'اختر الخدمة المناسبة لك',
      action: () => onNavigate('newOrder'),
      buttonText: 'طلب الآن'
    },
  ];

  return (
    <div className="pb-4 space-y-6" dir="rtl">
      {/* Live Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold text-primary">{stats.orders?.toLocaleString() || '125,847'}</p>
          <p className="text-[10px] text-muted-foreground">الطلبات</p>
        </Card>
        <Card className="p-3 text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <Users className="w-5 h-5 mx-auto mb-1 text-success" />
          <p className="text-lg font-bold text-success">{stats.users?.toLocaleString() || '5,420'}</p>
          <p className="text-[10px] text-muted-foreground">المستخدمين</p>
        </Card>
        <Card className="p-3 text-center bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <Package className="w-5 h-5 mx-auto mb-1 text-orange-500" />
          <p className="text-lg font-bold text-orange-500">{stats.services?.toLocaleString() || '1,250'}</p>
          <p className="text-[10px] text-muted-foreground">الخدمات</p>
        </Card>
      </div>

      {/* Hero Section */}
      <Card className="p-6 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0yNCAyNmgydjJoLTJ2LTJ6TTI4IDI2aDJ2MmgtMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10 text-center space-y-4">
          <h1 className="text-2xl font-bold">
            أفضل وأرخص وأسرع لوحة SMM
          </h1>
          <p className="text-sm opacity-90">
            AlAli SMM هي أرخص لوحة SMM تقدم مجموعة متنوعة من خدمات زيادة المتابعين والإعجابات والمشاهدات.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span>انضم لعائلتنا من</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 font-bold">
              {stats.users?.toLocaleString() || '5,420'}+
            </Badge>
            <span>عضو!</span>
          </div>
          {!user && (
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => setLocation('/register')}
              className="mt-4 font-bold"
              data-testid="button-hero-signup"
            >
              <UserPlus className="w-4 h-4 ml-2" />
              سجل الآن
            </Button>
          )}
        </div>
      </Card>

      {/* Quick Features */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-xs font-medium">الخدمات تُحدَّث يومياً!</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium">+100 طريقة دفع آمنة!</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-medium">خدمات حقيقية وعالية الجودة!</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-xs font-medium">أسعار تبدأ من $0.0001/ألف</p>
          </div>
        </Card>
      </div>

      {/* Platform Icons */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-center">المنصات المدعومة</h3>
        <div className="grid grid-cols-6 gap-3">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                  <Icon className={`w-5 h-5 ${platform.color}`} />
                </div>
                <span className="text-[9px] text-muted-foreground">{platform.name}</span>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-center">كيف يعمل؟</h3>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={step.action}
                  className="shrink-0"
                >
                  {step.buttonText}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Features Grid */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-center">لماذا نحن؟</h3>
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* CTA Section */}
      <Card className="p-6 bg-gradient-to-r from-success/10 to-success/5 border-success/20 text-center">
        <h3 className="text-lg font-bold mb-2">ابدأ الآن!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          انضم إلى آلاف العملاء الراضين وابدأ في تنمية حساباتك على السوشيال ميديا اليوم.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => onNavigate('newOrder')}
            className="bg-success hover:bg-success/90"
            data-testid="button-cta-order"
          >
            <ShoppingBag className="w-4 h-4 ml-2" />
            ابدأ الطلب
          </Button>
          {!user && (
            <Button
              variant="outline"
              onClick={() => setLocation('/register')}
              data-testid="button-cta-register"
            >
              <UserPlus className="w-4 h-4 ml-2" />
              إنشاء حساب
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
