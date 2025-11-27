import ServiceCard from '../ServiceCard';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function ServiceCardExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background max-w-md space-y-4">
          <ServiceCard
            id={18193}
            name="مشاهدات فيديو انستجرام - السرعة: 100 الف"
            price={0.0015}
            minQuantity={100}
            maxQuantity={10000000}
            speed="100K/Day"
            refill={true}
            cancel={true}
            isBest={true}
            onBuy={() => console.log('Buy clicked')}
          />
          <ServiceCard
            id={18628}
            name="تقييمات صفحة فيسبوك - تقييمات مخصصة - ذكور"
            price={0.85}
            minQuantity={10}
            maxQuantity={1000}
            description="1 الف كل يوم - وقت البدأ: 0-12 ساعة"
            refill={true}
            onBuy={() => console.log('Buy clicked')}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
