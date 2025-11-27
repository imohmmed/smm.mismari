import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
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
    'executionTime': 'مؤقت التنفيذ',
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
    'buyNow': 'يشتري',
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
  },
  en: {
    'home': 'Home',
    'newOrder': 'New Order',
    'orders': 'Orders',
    'addFunds': 'Add Funds',
    'support': 'Support',
    'account': 'Account',
    'balance': 'Your Balance',
    'totalSpent': 'Total Spent',
    'discount': 'Discount',
    'ordersCompleted': 'Orders Completed',
    'welcome': 'Welcome',
    'welcomeMessage': 'We are here to provide you with the best services you deserve.',
    'level': 'Level',
    'new': 'New',
    'selectCategory': 'Select Category',
    'allServices': 'All',
    'category': 'Category',
    'serviceName': 'Service Name',
    'link': 'Link',
    'quantity': 'Quantity',
    'executionTime': 'Execution Time',
    'totalAmount': 'Total Amount',
    'confirmOrder': 'Confirm Order',
    'searchService': 'Search by name or service number',
    'filterOrders': 'Filter Orders',
    'noOrders': 'You have not placed an order yet.',
    'noOrdersMessage': 'You can add balance and order any service on the new order page.',
    'instagram': 'Instagram',
    'youtube': 'YouTube',
    'facebook': 'Facebook',
    'tiktok': 'TikTok',
    'twitter': 'Twitter',
    'telegram': 'Telegram',
    'snapchat': 'Snapchat',
    'discord': 'Discord',
    'linkedin': 'LinkedIn',
    'google': 'Google',
    'spotify': 'Spotify',
    'twitch': 'Twitch',
    'views': 'Views',
    'likes': 'Likes',
    'followers': 'Followers',
    'comments': 'Comments',
    'shares': 'Shares',
    'subscribers': 'Subscribers',
    'addBalance': 'Add Balance',
    'paymentMethods': 'Add Funds',
    'mastercard': 'MasterCard',
    'visa': 'Visa',
    'zainCash': 'Zain Cash',
    'asiaCash': 'Asia Cell',
    'instructions': 'Instructions',
    'importantNotes': 'Important Notes',
    'minDeposit': 'Minimum Deposit',
    'paymentNote': 'If you use a bank card that is not yours, your account will be permanently closed and orders will be withdrawn.',
    'cvcNote': 'For a successful payment, use your CVC code and make your name and email similar when paying.',
    'contactSupport': 'If you have any payment issues, please contact us via support tickets and we will solve your problem.',
    'serviceInfo': 'Service Information',
    'readBeforeOrder': 'Read Before Ordering',
    'newServices': 'Newly Added Services',
    'buyNow': 'Buy Now',
    'per1000': 'per 1000',
    'min': 'Minimum',
    'max': 'Maximum',
    'speed': 'Speed',
    'startTime': 'Start Time',
    'guarantee': 'Guarantee',
    'refillGuarantee': 'Refill Guarantee',
    'pending': 'Pending',
    'inProgress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'partial': 'Partial',
    'processing': 'Processing',
    'email': 'Email',
    'phone': 'Phone Number',
    'password': 'Password',
    'currentPassword': 'Current Password',
    'newPassword': 'New Password',
    'changeEmail': 'Change Email',
    'twoFactor': 'Two-Factor Authentication',
    'security': 'Security',
    'notifications': 'Notifications',
    'apiInterface': 'API Interface',
    'acceptPayments': 'We accept payments from all over the world!',
    'contactPayment': 'Do not hesitate to contact us for any payment inquiries. We are always at your service.',
    'bulkOrder': 'Bulk Order',
    'subscriptions': 'Subscriptions',
    'app': 'Application',
    'hideFilter': 'Hide Filter',
    'showFilter': 'Show Filter',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
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
