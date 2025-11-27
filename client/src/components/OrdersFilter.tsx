import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrdersFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (status: string) => void;
}

export default function OrdersFilter({ onSearch, onFilterChange }: OrdersFilterProps) {
  const { t } = useLanguage();
  const [showFilter, setShowFilter] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('all');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFilterChange(value);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="flex items-center justify-between w-full p-3 bg-card rounded-lg border border-card-border"
        data-testid="button-toggle-filter"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <span className="font-medium">{t('filterOrders')}</span>
        </div>
        {showFilter ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        showFilter ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
      )}>
        <Card className="p-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t('searchService')}
              className="pr-10"
              data-testid="input-search-orders"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
