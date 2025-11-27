import { useLanguage } from '@/contexts/LanguageContext';
import { User, ShoppingBag, Plus, Wallet, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = 'account' | 'orders' | 'newOrder' | 'addFunds' | 'support';

interface BottomNavigationProps {
  activeItem: NavItem;
  onItemClick: (item: NavItem) => void;
}

export default function BottomNavigation({ activeItem, onItemClick }: BottomNavigationProps) {
  const { t, direction } = useLanguage();

  const navItems: { id: NavItem; icon: typeof User; label: string }[] = [
    { id: 'support', icon: MessageCircle, label: t('support') },
    { id: 'addFunds', icon: Wallet, label: t('addFunds') },
    { id: 'newOrder', icon: Plus, label: '' },
    { id: 'orders', icon: ShoppingBag, label: t('orders') },
    { id: 'account', icon: User, label: t('account') },
  ];

  const orderedItems = direction === 'ltr' ? [...navItems].reverse() : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {orderedItems.map((item) => {
          const Icon = item.icon;
          const isCenter = item.id === 'newOrder';
          const isActive = activeItem === item.id;

          if (isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-success text-success-foreground shadow-lg hover-elevate active-elevate-2"
                data-testid="button-new-order"
              >
                <Icon className="w-7 h-7" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={`button-nav-${item.id}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
