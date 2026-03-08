import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, EXPENSE_CATEGORIES } from '@/types/transaction';
import { formatCurrency } from '@/utils/analytics';
import { Target, Plus, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface Budget {
  category: string;
  limit: number;
  id: string;
}

interface BudgetTrackerProps {
  transactions: Transaction[];
}

const BUDGETS_KEY = 'student-finance-budgets';

export const BudgetTracker = ({ transactions }: BudgetTrackerProps) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });

  useEffect(() => {
    const stored = localStorage.getItem(BUDGETS_KEY);
    if (stored) {
      setBudgets(JSON.parse(stored));
    }
  }, []);

  const saveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(newBudgets));
  };

  const addBudget = () => {
    if (!newBudget.category || !newBudget.limit) return;

    const budget: Budget = {
      id: crypto.randomUUID(),
      category: newBudget.category,
      limit: parseFloat(newBudget.limit),
    };

    const existingIndex = budgets.findIndex(b => b.category === budget.category);
    let updatedBudgets;
    
    if (existingIndex >= 0) {
      updatedBudgets = [...budgets];
      updatedBudgets[existingIndex] = budget;
    } else {
      updatedBudgets = [...budgets, budget];
    }

    saveBudgets(updatedBudgets);
    setNewBudget({ category: '', limit: '' });
    setIsDialogOpen(false);
  };

  const removeBudget = (id: string) => {
    saveBudgets(budgets.filter(b => b.id !== id));
  };

  const getCurrentMonthSpending = (category: string) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === category &&
        new Date(t.date) >= firstDayOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    
    if (percentage >= 100) return { status: 'over', color: 'destructive', icon: AlertTriangle };
    if (percentage >= 80) return { status: 'warning', color: 'warning', icon: AlertTriangle };
    return { status: 'good', color: 'success', icon: CheckCircle };
  };

  const unusedCategories = EXPENSE_CATEGORIES.filter(
    category => !budgets.some(b => b.category === category)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Budget Tracker</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Category Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newBudget.category} onValueChange={(value) => 
                  setNewBudget(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                        {budgets.some(b => b.category === category) && (
                          <span className="text-xs text-muted-foreground"> (existing)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Monthly Limit ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, limit: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addBudget} className="flex-1">
                  {budgets.some(b => b.category === newBudget.category) ? 'Update Budget' : 'Add Budget'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No budgets set</h3>
            <p className="text-muted-foreground mb-4">
              Set monthly spending limits for your expense categories to track your progress.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => {
            const spent = getCurrentMonthSpending(budget.category);
            const remaining = Math.max(0, budget.limit - spent);
            const percentage = Math.min(100, (spent / budget.limit) * 100);
            const { status, color, icon: StatusIcon } = getBudgetStatus(spent, budget.limit);

            return (
              <Card key={budget.id} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{budget.category}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={status === 'over' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {percentage.toFixed(0)}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBudget(budget.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={percentage} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent: {formatCurrency(spent)}</span>
                    <span className="text-muted-foreground">Limit: {formatCurrency(budget.limit)}</span>
                  </div>
                  
                  <div className="text-center">
                    {status === 'over' ? (
                      <p className="text-sm text-destructive font-medium">
                        Over budget by {formatCurrency(spent - budget.limit)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(remaining)} remaining this month
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};