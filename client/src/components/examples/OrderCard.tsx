import OrderCard from '../OrderCard';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function OrderCardExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="p-4 bg-background max-w-md space-y-4">
          <OrderCard
            id={123456}
            serviceName="مشاهدات فيديو انستجرام"
            platform="instagram"
            link="https://instagram.com/p/xyz"
            quantity={10000}
            startCount={5000}
            remains={2500}
            status="inProgress"
            price={0.0150}
            date="27-11-2025"
          />
          <OrderCard
            id={123455}
            serviceName="متابعين تيك توك"
            platform="tiktok"
            link="https://tiktok.com/@user"
            quantity={5000}
            status="completed"
            price={0.0250}
            date="26-11-2025"
          />
          <OrderCard
            id={123454}
            serviceName="لايكات يوتيوب"
            platform="youtube"
            link="https://youtube.com/watch?v=xyz"
            quantity={1000}
            status="pending"
            price={0.0080}
            date="25-11-2025"
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
