import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrdersFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (status: string) => void;
}

const statusOptions = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'inProgress', label: 'جاري التنفيذ' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'partial', label: 'ملغي بشكل جزئي' },
  { value: 'processing', label: 'قيد المعالجة' },
  { value: 'cancelled', label: 'ملغي' },
];

export default function OrdersFilter({ onSearch, onFilterChange }: OrdersFilterProps) {
  const [showFilter, setShowFilter] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleStatusSelect = (value: string) => {
    setSelectedStatus(value);
    onFilterChange(value);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="flex items-center justify-between w-full p-3 bg-primary text-primary-foreground rounded-lg"
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
        showFilter ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <Card className="p-3 space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ابحث بأسم او رقم الخدمة"
              className="pr-11 text-right"
              data-testid="input-search-orders"
            />
          </div>

          {/* Status Filter Options */}
          <div className="space-y-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusSelect(option.value)}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-lg text-right transition-colors",
                  selectedStatus === option.value
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                )}
                data-testid={`filter-status-${option.value}`}
              >
                <span className="font-medium">{option.label}</span>
                {selectedStatus === option.value && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
