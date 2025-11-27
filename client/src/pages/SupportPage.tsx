import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// todo: remove mock functionality - replace with API data
const mockTickets = [
  { id: 1001, subject: 'مشكلة في الطلب رقم 123456', status: 'open', date: '27-11-2025' },
  { id: 1002, subject: 'استفسار عن طريقة الدفع', status: 'closed', date: '25-11-2025' },
];

export default function SupportPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject || !category || !message) return;

    console.log('Ticket submitted:', { subject, category, message });
    // todo: implement ticket submission

    toast({
      title: 'تم إرسال التذكرة',
      description: 'سيتم الرد عليك في أقرب وقت ممكن',
    });

    setSubject('');
    setCategory('');
    setMessage('');
  };

  return (
    <div className="space-y-4 pb-4">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          إنشاء تذكرة دعم جديدة
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">الموضوع</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="أدخل موضوع التذكرة"
              data-testid="input-ticket-subject"
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">القسم</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-ticket-category">
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">مشاكل الدفع</SelectItem>
                <SelectItem value="order">مشاكل الطلبات</SelectItem>
                <SelectItem value="technical">مشاكل تقنية</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">الرسالة</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              rows={5}
              data-testid="textarea-ticket-message"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!subject || !category || !message}
            className="w-full bg-primary"
            data-testid="button-submit-ticket"
          >
            <Send className="w-4 h-4 ml-2" />
            إرسال التذكرة
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">التذاكر السابقة</h2>

        {mockTickets.length > 0 ? (
          <div className="space-y-3">
            {mockTickets.map(ticket => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover-elevate cursor-pointer"
                data-testid={`ticket-${ticket.id}`}
              >
                <div>
                  <p className="font-medium text-sm">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">#{ticket.id} - {ticket.date}</p>
                </div>
                <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                  {ticket.status === 'open' ? (
                    <>
                      <Clock className="w-3 h-3 ml-1" />
                      مفتوحة
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      مغلقة
                    </>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            لا توجد تذاكر سابقة
          </p>
        )}
      </Card>
    </div>
  );
}
