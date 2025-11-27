import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrdersFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (status: string) => void;
}

export default function OrdersFilter({ onSearch, onFilterChange }: OrdersFilterProps) {
  const [showFilter, setShowFilter] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="flex items-center justify-between w-full p-3 bg-success text-success-foreground rounded-lg"
        data-testid="button-toggle-filter"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <span className="font-medium">فلترة الطلبات</span>
        </div>
        {showFilter ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        showFilter ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
      )}>
        <Card className="p-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ابحث بأسم او رقم الخدمة"
              className="pr-11 text-right"
              data-testid="input-search-orders"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
