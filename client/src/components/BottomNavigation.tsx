import { User, ShoppingBag, Plus, Wallet, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = 'account' | 'orders' | 'newOrder' | 'addFunds' | 'home';

interface BottomNavigationProps {
  activeItem: NavItem;
  onItemClick: (item: NavItem) => void;
}

export default function BottomNavigation({ activeItem, onItemClick }: BottomNavigationProps) {
  const leftItems: { id: NavItem; icon: typeof User; label: string }[] = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'addFunds', icon: Wallet, label: 'إضافة الأموال' },
  ];

  const rightItems: { id: NavItem; icon: typeof User; label: string }[] = [
    { id: 'orders', icon: ShoppingBag, label: 'الطلبات' },
    { id: 'account', icon: User, label: 'الحساب' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-2 safe-area-bottom">
      <nav className="bg-card border border-border rounded-2xl shadow-lg">
        <div className="flex items-center h-16 px-2">
          <div className="flex items-center flex-1 justify-evenly">
            {leftItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`button-nav-${item.id}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[11px] font-medium whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onItemClick('newOrder')}
            className="flex items-center justify-center w-14 h-14 -mt-8 mx-2 rounded-full bg-primary text-primary-foreground shadow-lg hover-elevate active-elevate-2 shrink-0"
            data-testid="button-new-order"
          >
            <Plus className="w-7 h-7" />
          </button>

          <div className="flex items-center flex-1 justify-evenly">
            {rightItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`button-nav-${item.id}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[11px] font-medium whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
