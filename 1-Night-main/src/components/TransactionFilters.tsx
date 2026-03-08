import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/transaction';
import { Search, Filter, X } from 'lucide-react';

interface TransactionFiltersProps {
  transactions: Transaction[];
  onFilterChange: (filteredTransactions: Transaction[]) => void;
}

export const TransactionFilters = ({ transactions, onFilterChange }: TransactionFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let daysAgo: number;
      
      switch (dateRange) {
        case '7':
          daysAgo = 7;
          break;
        case '30':
          daysAgo = 30;
          break;
        case '90':
          daysAgo = 90;
          break;
        default:
          daysAgo = 0;
      }

      if (daysAgo > 0) {
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
      }
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setDateRange('all');
    onFilterChange(transactions);
  };

  const hasActiveFilters = searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || dateRange !== 'all';

  const availableCategories = selectedType === 'income' 
    ? INCOME_CATEGORIES 
    : selectedType === 'expense' 
    ? EXPENSE_CATEGORIES 
    : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  // Apply filters whenever any filter changes
  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedType, selectedCategory, dateRange]);

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <h3 className="font-medium">Filter Transactions</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-auto">
              Active filters
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {searchTerm && (
                <Badge variant="outline">
                  Search: "{searchTerm}"
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchTerm('')} />
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="outline">
                  Type: {selectedType}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedType('all')} />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="outline">
                  Category: {selectedCategory}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </Badge>
              )}
              {dateRange !== 'all' && (
                <Badge variant="outline">
                  Last {dateRange} days
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setDateRange('all')} />
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};