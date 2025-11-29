import { createContext, useContext, useEffect, type ReactNode } from 'react';

type Direction = 'rtl';

interface LanguageContextType {
  language: 'ar';
  direction: Direction;
  t: (key: string) => string;
}

const translations: Record<string, string> = {
  'home': 'الرئيسية',
  'newOrder': 'طلب جديد',
  'orders': 'الطلبات',
  'addFunds': 'إضافة الأموال',
  'support': 'تذكرة الدعم',
  'account': 'الحساب',
  'balance': 'رصيدك الحالي',
  'totalSpent': 'إنفاقك الكلي',
  'discount': 'الخصم',
  'ordersCompleted': 'طلب تم تنفيذه',
  'welcome': 'مرحباً بك',
  'welcomeMessage': 'نحن هنا لنقدم لك أفضل الخدمات التي تستحقها.',
  'level': 'المستوى',
  'new': 'جديد',
  'selectCategory': 'اختار القسم',
  'allServices': 'كل شي',
  'category': 'القسم',
  'serviceName': 'اسم الخدمة',
  'link': 'الرابط',
  'quantity': 'الكمية',
  'executionTime': 'وقت البدء',
  'totalAmount': 'المبلغ الإجمالي',
  'confirmOrder': 'تأكيد الطلب',
  'searchService': 'ابحث باسم او رقم الخدمة',
  'filterOrders': 'فلترة الطلبات',
  'noOrders': 'لم تقم بوضع طلب من قبل.',
  'noOrdersMessage': 'يمكنك إضافة رصيد وطلب أي خدمة على صفحة الطلب الجديد.',
  'instagram': 'انستجرام',
  'youtube': 'يوتيوب',
  'facebook': 'فيسبوك',
  'tiktok': 'تيك توك',
  'twitter': 'تويتر',
  'telegram': 'تليجرام',
  'snapchat': 'سناب شات',
  'discord': 'ديسكورد',
  'linkedin': 'لينكد ان',
  'google': 'جوجل',
  'spotify': 'سبوتيفاي',
  'twitch': 'تويتش',
  'views': 'مشاهدات',
  'ratings': 'تقييمات',
  'visits': 'زيارات',
  'likes': 'لايكات',
  'followers': 'متابعين',
  'comments': 'تعليقات',
  'shares': 'مشاركات',
  'subscribers': 'مشتركين',
  'addBalance': 'إضافة الرصيد',
  'paymentMethods': 'إضافة الأموال',
  'mastercard': 'ماستر كارد',
  'visa': 'فيزا',
  'zainCash': 'زين كاش',
  'asiaCash': 'آسيا سيل',
  'instructions': 'تعليمات',
  'importantNotes': 'ملاحظات هامة',
  'minDeposit': 'الحد الأدنى للشحن',
  'paymentNote': 'في حال استخدامك لبطاقة بنكية ليست ملكك وخاصة بك فإنك تعرض حسابك للإغلاق بشكل كامل وسحب الطلبات.',
  'cvcNote': 'للحصول على عملية دفع ناجحة، استخدم رمز CVC الخاص بك واجعل اسمك والبريد الإلكتروني متشابهين عند الدفع.',
  'contactSupport': 'إذا كنت تواجه أي مشكلة في الدفع، فلا تتردد في الاتصال بنا عبر تذاكر الدعم وسنحل مشكلتك قدر الإمكان.',
  'serviceInfo': 'معلومات عن الخدمات',
  'readBeforeOrder': 'اقرأ قبل الطلب',
  'newServices': 'الخدمات المضافة حديثاً',
  'buyNow': 'شراء',
  'per1000': 'لكل 1000',
  'min': 'الحد الأدنى',
  'max': 'الحد الأقصى',
  'speed': 'السرعة',
  'startTime': 'وقت البدأ',
  'guarantee': 'الضمان',
  'refillGuarantee': 'ضمان إعادة التعبئة',
  'pending': 'قيد الانتظار',
  'inProgress': 'قيد التنفيذ',
  'completed': 'مكتمل',
  'cancelled': 'ملغي',
  'partial': 'جزئي',
  'processing': 'يتم المعالجة',
  'email': 'البريد الإلكتروني',
  'phone': 'رقم الهاتف',
  'password': 'كلمة المرور',
  'currentPassword': 'كلمة المرور الحالية',
  'newPassword': 'كلمة المرور الجديدة',
  'changeEmail': 'تغيير البريد الالكتروني',
  'changeUsername': 'تغيير اسم المستخدم',
  'changePhone': 'تغيير رقم الهاتف',
  'twoFactor': 'المصادقة الثنائية',
  'security': 'حماية',
  'notifications': 'الإشعارات',
  'apiInterface': 'واجهة برمجة التطبيقات',
  'acceptPayments': 'نحن نقبل المدفوعات من جميع أنحاء العالم!',
  'contactPayment': 'لا تترددوا في التواصل معنا لأي استفسارات حول الدفع. نحن في خدمتكم دائماً.',
  'bulkOrder': 'طلب مجمع',
  'subscriptions': 'الاشتراكات',
  'app': 'التطبيق',
  'hideFilter': 'إخفاء الفلتر',
  'showFilter': 'إظهار الفلتر',
  'login': 'تسجيل الدخول',
  'register': 'إنشاء حساب',
  'logout': 'تسجيل الخروج',
  'username': 'اسم المستخدم',
  'confirmPassword': 'تأكيد كلمة المرور',
  'forgotPassword': 'نسيت كلمة المرور؟',
  'noAccount': 'ليس لديك حساب؟',
  'haveAccount': 'لديك حساب بالفعل؟',
  'loginSuccess': 'تم تسجيل الدخول بنجاح',
  'registerSuccess': 'تم إنشاء الحساب بنجاح',
  'invalidCredentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'adminPanel': 'لوحة التحكم',
  'users': 'المستخدمين',
  'services': 'الخدمات',
  'allOrders': 'جميع الطلبات',
  'searchUsers': 'البحث عن المستخدمين',
  'adjustBalance': 'تعديل الرصيد',
  'subtractBalance': 'خصم رصيد',
  'amount': 'المبلغ',
  'addService': 'إضافة خدمة',
  'deleteService': 'حذف خدمة',
  'serviceId': 'رقم الخدمة',
  'platform': 'المنصة',
  'selectPlatform': 'اختر المنصة',
  'lookupService': 'بحث عن الخدمة',
  'serviceFound': 'تم العثور على الخدمة',
  'serviceNotFound': 'لم يتم العثور على الخدمة',
  'priceWithProfit': 'السعر مع الربح',
  'addedServices': 'الخدمات المضافة',
  'noServices': 'لا توجد خدمات مضافة',
  'orderTracking': 'تتبع الطلبات',
  'userDetails': 'تفاصيل المستخدم',
  'memberSince': 'عضو منذ',
  'totalOrders': 'إجمالي الطلبات',
  'dashboard': 'لوحة التحكم',
  'welcomeAdmin': 'مرحباً بك في لوحة التحكم',
  'totalUsers': 'إجمالي المستخدمين',
  'totalBalance': 'إجمالي الأرصدة',
  'recentOrders': 'الطلبات الأخيرة',
  'back': 'رجوع',
  'save': 'حفظ',
  'cancel': 'إلغاء',
  'confirm': 'تأكيد',
  'success': 'تم بنجاح',
  'error': 'خطأ',
  'loading': 'جاري التحميل...',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  }, []);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: 'ar', direction: 'rtl', t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
