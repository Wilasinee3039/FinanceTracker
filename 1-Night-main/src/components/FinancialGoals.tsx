import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/utils/analytics';
import { Target, Plus, Trophy, Calendar, TrendingUp, Trash2, Edit, CheckCircle2, AlertCircle } from 'lucide-react';

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description?: string;
  createdAt: string;
}

interface FinancialGoalsProps {
  transactions: Transaction[];
}

const GOALS_KEY = 'student-finance-goals';

export const FinancialGoals = ({ transactions }: FinancialGoalsProps) => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    description: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem(GOALS_KEY);
    if (stored) {
      setGoals(JSON.parse(stored));
    }
  }, []);

  const saveGoals = (newGoals: FinancialGoal[]) => {
    setGoals(newGoals);
    localStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
  };

  const calculateTotalSavings = (): number => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return Math.max(0, totalIncome - totalExpenses);
  };

  const updateGoalProgress = (goal: FinancialGoal): FinancialGoal => {
    const totalSavings = calculateTotalSavings();
    // Calculate how much of total savings is allocated to this goal
    // For simplicity, we'll distribute savings proportionally or use a simple allocation
    // You can enhance this with manual allocation later
    const allocatedSavings = totalSavings * (goal.currentAmount / (goals.reduce((sum, g) => sum + g.currentAmount, 0) || goal.currentAmount || 1));
    
    // For now, we'll allow manual updates to currentAmount via the edit dialog
    // But we can also auto-calculate based on transactions
    return goal;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      return;
    }

    const goal: FinancialGoal = {
      id: editingGoal?.id || crypto.randomUUID(),
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: editingGoal?.currentAmount || 0,
      targetDate: formData.targetDate,
      description: formData.description,
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
    };

    let updatedGoals;
    if (editingGoal) {
      updatedGoals = goals.map(g => g.id === editingGoal.id ? goal : g);
    } else {
      updatedGoals = [...goals, goal];
    }

    saveGoals(updatedGoals);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', targetAmount: '', targetDate: '', description: '' });
    setEditingGoal(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate,
      description: goal.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  };

  const handleUpdateProgress = (id: string, newAmount: number) => {
    const updatedGoals = goals.map(g => 
      g.id === id ? { ...g, currentAmount: Math.max(0, Math.min(newAmount, g.targetAmount)) } : g
    );
    saveGoals(updatedGoals);
  };

  const getProgressPercentage = (goal: FinancialGoal): number => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const getDaysRemaining = (targetDate: string): number => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalStatus = (goal: FinancialGoal) => {
    const progress = getProgressPercentage(goal);
    const daysRemaining = getDaysRemaining(goal.targetDate);
    const isCompleted = progress >= 100;
    const isOverdue = daysRemaining < 0 && !isCompleted;

    if (isCompleted) {
      return { status: 'completed', color: 'success', icon: Trophy, message: 'Goal Achieved!' };
    }
    if (isOverdue) {
      return { status: 'overdue', color: 'destructive', icon: AlertCircle, message: 'Overdue' };
    }
    if (progress >= 80) {
      return { status: 'almost', color: 'warning', icon: TrendingUp, message: 'Almost there!' };
    }
    return { status: 'active', color: 'primary', icon: Target, message: 'On track' };
  };

  const totalSavings = calculateTotalSavings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Financial Goals</h2>
            <p className="text-sm text-muted-foreground">Track your savings and achieve your financial dreams</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Save for Vacation, Emergency Fund"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount ($) *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    required
                  />
                </div>
                {editingGoal && (
                  <div className="space-y-2">
                    <Label htmlFor="currentAmount">Current Amount ($)</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={editingGoal.targetAmount}
                      placeholder="0.00"
                      value={editingGoal.currentAmount || ''}
                      onChange={(e) => {
                        handleUpdateProgress(editingGoal.id, parseFloat(e.target.value) || 0);
                        setEditingGoal({ ...editingGoal, currentAmount: parseFloat(e.target.value) || 0 });
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date *</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Add notes about this goal..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Savings Summary */}
      <Card className="shadow-elevated bg-gradient-to-br from-primary/10 to-balance/10 border-2 border-primary/20 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Available Savings</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalSavings)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Income - Expenses from all transactions
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary/20">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card className="shadow-elevated border-2 border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No goals set yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first financial goal to start tracking your savings progress and achieve your dreams!
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2 shadow-lg hover:shadow-xl">
              <Plus className="w-4 h-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal, index) => {
            const progress = getProgressPercentage(goal);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const remaining = goal.targetAmount - goal.currentAmount;
            const status = getGoalStatus(goal);
            const StatusIcon = status.icon;

            return (
              <Card 
                key={goal.id} 
                className="shadow-elevated border-2 border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/30 animate-fade-in overflow-hidden group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  status.status === 'completed' 
                    ? 'from-success to-success/50' 
                    : status.status === 'overdue'
                    ? 'from-destructive to-destructive/50'
                    : 'from-primary to-balance'
                }`}></div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold mb-1 flex items-center gap-2">
                        {goal.title}
                        <Badge 
                          variant={status.status === 'completed' ? 'default' : status.status === 'overdue' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.message}
                        </Badge>
                      </CardTitle>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-3"
                    />
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target</p>
                      <p className="text-lg font-bold">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>

                  {/* Remaining Amount */}
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Remaining</span>
                      <span className={`text-sm font-semibold ${
                        status.status === 'completed' ? 'text-success' : 'text-foreground'
                      }`}>
                        {status.status === 'completed' 
                          ? 'Goal Achieved! 🎉' 
                          : formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Target Date */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Target Date</p>
                      <p className="text-sm font-medium">
                        {new Date(goal.targetDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Days</p>
                      <p className={`text-sm font-semibold ${
                        daysRemaining < 0 ? 'text-destructive' : 
                        daysRemaining < 30 ? 'text-warning' : 
                        'text-success'
                      }`}>
                        {daysRemaining < 0 ? 'Overdue' : daysRemaining === 0 ? 'Today' : `${daysRemaining} left`}
                      </p>
                    </div>
                  </div>

                  {/* Manual Progress Update */}
                  {status.status !== 'completed' && (
                    <div className="pt-3 border-t border-border/50">
                      <Label className="text-xs mb-2 block">Update Progress</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={goal.targetAmount}
                          placeholder="Current amount"
                          value={goal.currentAmount || ''}
                          onChange={(e) => handleUpdateProgress(goal.id, parseFloat(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateProgress(goal.id, goal.currentAmount + 10)}
                          className="px-3"
                        >
                          +$10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateProgress(goal.id, goal.currentAmount + 50)}
                          className="px-3"
                        >
                          +$50
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

