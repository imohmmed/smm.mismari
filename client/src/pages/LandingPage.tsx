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
  Layout,
  DollarSign,
  CreditCard,
  Lock,
  Code,
  Headphones,
  TrendingUp,
  Clock,
  Star,
  MessageCircle
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

interface Subscription {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  deliveryTime: string;
  price: number;
  isActive: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }
};

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: statsData } = useQuery<{ orders?: number; users?: number; services?: number }>({
    queryKey: ['/api/stats'],
  });

  const { data: subscriptionsData } = useQuery<{ subscriptions: Subscription[] }>({
    queryKey: ['/api/subscriptions'],
  });

  const subscriptions = subscriptionsData?.subscriptions || [];

  const stats = {
    orders: statsData?.orders ?? 0,
    users: statsData?.users ?? 0,
    services: statsData?.services ?? 0
  };

  const handleContactSubscription = (subscription: Subscription) => {
    const message = `مرحباً، أريد الاستفسار عن الاشتراك: ${subscription.name}`;
    window.open(`https://wa.me/9647766699669?text=${encodeURIComponent(message)}`, '_blank');
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
      <motion.div 
        className="grid grid-cols-3 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
          <Card className="p-3 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold text-primary">{stats.orders?.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">الطلبات</p>
          </Card>
        </motion.div>
        <motion.div variants={fadeInUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="p-3 text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <Users className="w-5 h-5 mx-auto mb-1 text-success" />
            <p className="text-lg font-bold text-success">{stats.users?.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">المستخدمين</p>
          </Card>
        </motion.div>
        <motion.div variants={fadeInUp} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="p-3 text-center bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <Package className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="text-lg font-bold text-orange-500">{stats.services?.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">الخدمات</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0yNCAyNmgydjJoLTJ2LTJ6TTI4IDI2aDJ2MmgtMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="relative z-10 text-center space-y-4">
            <motion.h1 
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              أفضل وأرخص وأسرع لوحة SMM
            </motion.h1>
            <motion.p 
              className="text-sm opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              AlAli لخدمات مواقع التواصل هي أرخص لوحة SMM تقدم مجموعة متنوعة من خدمات زيادة المتابعين والإعجابات والمشاهدات.
            </motion.p>
            <motion.div 
              className="flex items-center justify-center gap-2 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <span>انضم لعائلتنا من</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 font-bold">
                {stats.users?.toLocaleString()}+
              </Badge>
              <span>عضو!</span>
            </motion.div>
            {!user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
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
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Quick Features */}
      <motion.div 
        className="grid grid-cols-2 gap-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {[
          { icon: TrendingUp, text: 'الخدمات تُحدَّث يومياً!', color: 'success' },
          { icon: Shield, text: '+100 طريقة دفع آمنة!', color: 'primary' },
          { icon: Zap, text: 'خدمات حقيقية وعالية الجودة!', color: 'orange-500' },
          { icon: DollarSign, text: 'أسعار تبدأ من $0.0001/ألف', color: 'green-500' }
        ].map((item, index) => (
          <motion.div key={index} variants={fadeInScale} transition={{ duration: 0.4 }}>
            <Card className="p-3 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-${item.color}/10 flex items-center justify-center shrink-0`}>
                <item.icon className={`w-4 h-4 text-${item.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium">{item.text}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Platform Icons */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-center">المنصات المدعومة</h3>
          <motion.div 
            className="grid grid-cols-6 gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {platforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <motion.div
                  key={platform.name}
                  variants={fadeInScale}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors hover:scale-110 duration-200">
                    <Icon className={`w-5 h-5 ${platform.color}`} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{platform.name}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </Card>
      </motion.div>

      {/* Subscriptions Section */}
      {subscriptions.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-center">الباقات والاشتراكات</h3>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <motion.div 
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {subscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription.id}
                  variants={fadeInScale}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                    {subscription.imageUrl && (
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={subscription.imageUrl}
                          alt={subscription.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-3 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-lg">{subscription.name}</h4>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 shrink-0">
                          ${subscription.price.toFixed(2)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground flex-1">
                        {subscription.description}
                      </p>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>مدة التسليم: {subscription.deliveryTime}</span>
                      </div>
                      
                      <Button
                        className="w-full gap-2 mt-auto bg-green-600 hover:bg-green-700"
                        onClick={() => handleContactSubscription(subscription)}
                        data-testid={`button-subscription-${subscription.id}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        تواصل عبر واتساب
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>
      )}

      {/* How It Works */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-center">كيف يعمل؟</h3>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={slideInRight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:translate-x-[-4px]"
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
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-center">لماذا نحن؟</h3>
          <motion.div 
            className="grid grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInScale}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
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
          </motion.div>
        </Card>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-6 bg-gradient-to-r from-success/10 to-success/5 border-success/20 text-center">
          <motion.h3 
            className="text-lg font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            ابدأ الآن!
          </motion.h3>
          <motion.p 
            className="text-sm text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            انضم إلى آلاف العملاء الراضين وابدأ في تنمية حساباتك على السوشيال ميديا اليوم.
          </motion.p>
          <motion.div 
            className="flex gap-3 justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => onNavigate('newOrder')}
              className="bg-primary hover:bg-primary/90"
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
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
