import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, BookOpen, Star, RefreshCw, XCircle, Clock } from 'lucide-react';

export default function ServiceInfoTabs() {
  const { t, language, direction } = useLanguage();

  const iconMargin = direction === 'rtl' ? 'ml-1' : 'mr-1';

  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-none bg-muted/50 h-auto p-0">
          <TabsTrigger value="info" className="py-3 rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Info className={`w-4 h-4 ${iconMargin}`} />
            {t('serviceInfo')}
          </TabsTrigger>
          <TabsTrigger value="read" className="py-3 rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className={`w-4 h-4 ${iconMargin}`} />
            {t('readBeforeOrder')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="p-4 m-0">
          <div className="space-y-3 text-sm" dir={direction}>
            {language === 'ar' ? (
              <>
                <p className="font-medium text-foreground mb-3">
                  اسم الخدمة ~ السرعه ~ وقت البدأ ~ مدة الضمان
                </p>
                <p className="text-muted-foreground">
                  تبدأ سرعة التوصيل بعد وقت البدأ الموجود بالوصف.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>= افضل الخدمات.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                    <span>= خاصية تجزئة الطلب مفعلة.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>= زر التعويض مفعل.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>= زر الالغاء مفعل.</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p><strong>Rxx</strong> = فترة التعويض (xx تدل على عدد ايام التعويض، مثال: R30 = 30 يوم ضمان تعويض).</p>
                  <p><strong>ARxx</strong> = فترة التعويض التلقائي (xx تدل على عدد ايام التعويض التلقائي، مثال: AR30 = 30 يوم تعويض تلقائي).</p>
                </div>
              </>
            ) : (
              <>
                <p className="font-medium text-foreground mb-3">
                  Service Name ~ Speed ~ Start Time ~ Warranty Period
                </p>
                <p className="text-muted-foreground">
                  Delivery speed starts after the start time mentioned in the description.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>= Best services.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                    <span>= Drip feed feature enabled.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>= Refill button enabled.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>= Cancel button enabled.</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p><strong>Rxx</strong> = Refill period (xx indicates days, e.g., R30 = 30 days refill warranty).</p>
                  <p><strong>ARxx</strong> = Auto refill period (xx indicates days, e.g., AR30 = 30 days auto refill).</p>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="read" className="p-4 m-0">
          <div className="space-y-3 text-sm" dir={direction}>
            {language === 'ar' ? (
              <>
                <p>- جميع الحسابات يجب ان تكون عامة قبل الطلب، وليست خاصة</p>
                <p>- يرجى عدم وضع اكثر من طلب لنفس الرابط بنفس الوقت الا بعد اكتمال الطلب الاول</p>
                <p>- يرجى التأكد ان عداد المشتركين والمشاهدات واللايكات وغيره عام وليس خاص قبل وضع الطلب</p>
                <p>- لا يمكننا الغاء/تعديل اي طلب بعد وضعه نهائياً الا اذا وجد فيه مشاكل لذلك يرجى التأكد من الطلبات قبل وضعها</p>
                <p>- اذا تم تحويل الحساب الى برايفت او تم حذف المنشور او المقطع بعد وضع الطلب سيتم اعتبار الطلب مكتمل ولا يمكننا الغاءه نهائياً</p>
                <p className="text-destructive font-medium">- يمنع الطلب للحسابات (الاباحية، السياسية، التطرف، واي محتوى يثير الرأي العام)</p>
                <p>- عندما تقوم بوضع طلب جديد فأنت توافق على شروط واحكام الموقع</p>
              </>
            ) : (
              <>
                <p>- All accounts must be public before ordering, not private</p>
                <p>- Please do not place more than one order for the same link at the same time until the first order is completed</p>
                <p>- Please make sure that subscriber, view, and like counters are public, not private before placing an order</p>
                <p>- We cannot cancel/modify any order after it is placed unless there are issues, so please verify orders before placing them</p>
                <p>- If the account is switched to private or the post/video is deleted after placing the order, the order will be considered complete and cannot be cancelled</p>
                <p className="text-destructive font-medium">- Ordering for accounts (pornographic, political, extremist, or any content that provokes public opinion) is prohibited</p>
                <p>- When you place a new order, you agree to the terms and conditions of the site</p>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
