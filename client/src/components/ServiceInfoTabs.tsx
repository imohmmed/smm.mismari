import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, BookOpen, Sparkles, Star, RefreshCw, XCircle, Clock } from 'lucide-react';

interface NewService {
  id: number;
  name: string;
  date: string;
}

interface ServiceInfoTabsProps {
  newServices?: NewService[];
}

export default function ServiceInfoTabs({ newServices = [] }: ServiceInfoTabsProps) {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none bg-muted/50 h-auto p-0">
          <TabsTrigger value="info" className="py-3 rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Info className="w-4 h-4 ml-1" />
            {t('serviceInfo')}
          </TabsTrigger>
          <TabsTrigger value="read" className="py-3 rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="w-4 h-4 ml-1" />
            {t('readBeforeOrder')}
          </TabsTrigger>
          <TabsTrigger value="new" className="py-3 rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
            <Sparkles className="w-4 h-4 ml-1" />
            {t('newServices')}
            {newServices.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-success text-xs">
                {newServices.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="p-4 m-0">
          <div className="space-y-3 text-sm">
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
          </div>
        </TabsContent>

        <TabsContent value="read" className="p-4 m-0">
          <div className="space-y-3 text-sm">
            <p>- جميع الحسابات يجب ان تكون عامة قبل الطلب، وليست خاصة</p>
            <p>- يرجى عدم وضع اكثر من طلب لنفس الرابط بنفس الوقت الا بعد اكتمال الطلب الاول</p>
            <p>- يرجى التأكد ان عداد المشتركين والمشاهدات واللايكات وغيره عام وليس خاص قبل وضع الطلب</p>
            <p>- لا يمكننا الغاء/تعديل اي طلب بعد وضعه نهائياً الا اذا وجد فيه مشاكل لذلك يرجى التأكد من الطلبات قبل وضعها</p>
            <p>- اذا تم تحويل الحساب الى برايفت او تم حذف المنشور او المقطع بعد وضع الطلب سيتم اعتبار الطلب مكتمل ولا يمكننا الغاءه نهائياً</p>
            <p className="text-destructive font-medium">- يمنع الطلب للحسابات (الاباحية، السياسية، التطرف، واي محتوى يثير الرأي العام)</p>
            <p>- عندما تقوم بوضع طلب جديد فأنت توافق على شروط واحكام الموقع</p>
          </div>
        </TabsContent>

        <TabsContent value="new" className="p-4 m-0">
          {newServices.length > 0 ? (
            <div className="space-y-3">
              {newServices.map(service => (
                <Card key={service.id} className="p-3 hover-elevate">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1">{service.id}</Badge>
                      <p className="text-sm font-medium">{service.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{service.date}</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              لا توجد خدمات مضافة حديثاً
            </p>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
