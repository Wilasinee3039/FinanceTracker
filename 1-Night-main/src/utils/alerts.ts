import { Transaction } from '@/types/transaction';
import { formatCurrency } from './analytics';

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface Alert {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'goal_achieved' | 'milestone' | 'spending_summary' | 'over_budget';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  category?: string;
  goalId?: string;
}

// Check for budget alerts
export const checkBudgetAlerts = (transactions: Transaction[], budgets: Budget[]): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  budgets.forEach(budget => {
    const spent = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === budget.category &&
        new Date(t.date) >= firstDayOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (spent / budget.limit) * 100;

    if (percentage >= 100) {
      alerts.push({
        id: `budget-exceeded-${budget.id}`,
        type: 'budget_exceeded',
        title: `Budget Exceeded: ${budget.category}`,
        description: `You've exceeded your ${budget.category} budget by ${formatCurrency(spent - budget.limit)}. Monthly limit: ${formatCurrency(budget.limit)}`,
        severity: 'error',
        timestamp: new Date().toISOString(),
        category: budget.category,
      });
    } else if (percentage >= 80) {
      alerts.push({
        id: `budget-warning-${budget.id}`,
        type: 'budget_warning',
        title: `Budget Warning: ${budget.category}`,
        description: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. ${formatCurrency(budget.limit - spent)} remaining.`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
        category: budget.category,
      });
    }
  });

  return alerts;
};

// Check for goal achievements and milestones
export const checkGoalAlerts = (
  goals: FinancialGoal[],
  previousGoals: FinancialGoal[] = []
): Alert[] => {
  const alerts: Alert[] = [];

  goals.forEach(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const previousGoal = previousGoals.find(g => g.id === goal.id);
    const previousProgress = previousGoal ? (previousGoal.currentAmount / previousGoal.targetAmount) * 100 : 0;

    // Goal achieved
    if (progress >= 100 && previousProgress < 100) {
      alerts.push({
        id: `goal-achieved-${goal.id}`,
        type: 'goal_achieved',
        title: `🎉 Goal Achieved: ${goal.title}`,
        description: `Congratulations! You've reached your goal of ${formatCurrency(goal.targetAmount)}. Well done!`,
        severity: 'success',
        timestamp: new Date().toISOString(),
        goalId: goal.id,
      });
    }

    // Milestones (25%, 50%, 75%)
    const milestones = [25, 50, 75];
    milestones.forEach(milestone => {
      if (progress >= milestone && previousProgress < milestone) {
        alerts.push({
          id: `milestone-${goal.id}-${milestone}`,
          type: 'milestone',
          title: `Milestone Reached: ${goal.title}`,
          description: `You've reached ${milestone}% of your goal! ${formatCurrency(goal.currentAmount)} saved out of ${formatCurrency(goal.targetAmount)}.`,
          severity: 'success',
          timestamp: new Date().toISOString(),
          goalId: goal.id,
        });
      }
    });

    // Savings milestones (total savings amounts)
    const savingsMilestones = [100, 500, 1000, 5000, 10000];
    savingsMilestones.forEach(milestone => {
      if (goal.currentAmount >= milestone && (previousGoal?.currentAmount || 0) < milestone) {
        alerts.push({
          id: `savings-milestone-${goal.id}-${milestone}`,
          type: 'milestone',
          title: `💰 Savings Milestone!`,
          description: `You've saved ${formatCurrency(milestone)} towards ${goal.title}! Keep up the great work!`,
          severity: 'success',
          timestamp: new Date().toISOString(),
          goalId: goal.id,
        });
      }
    });
  });

  return alerts;
};

// Generate weekly spending summary
export const generateWeeklySummary = (transactions: Transaction[]): Alert | null => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= sevenDaysAgo && transactionDate <= now;
  });

  const totalIncome = weeklyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = weeklyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  return {
    id: `weekly-summary-${now.toISOString()}`,
    type: 'spending_summary',
    title: '📊 Weekly Spending Summary',
    description: `This week: ${formatCurrency(totalIncome)} income, ${formatCurrency(totalExpenses)} expenses. Net: ${formatCurrency(netBalance)}`,
    severity: 'info',
    timestamp: new Date().toISOString(),
  };
};

// Generate monthly spending summary
export const generateMonthlySummary = (transactions: Transaction[]): Alert | null => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= firstDayOfMonth && transactionDate <= now;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const avgDailySpending = totalExpenses / currentDay;
  const projectedMonthlySpending = avgDailySpending * daysInMonth;

  return {
    id: `monthly-summary-${now.toISOString()}`,
    type: 'spending_summary',
    title: '📈 Monthly Spending Summary',
    description: `This month: ${formatCurrency(totalIncome)} income, ${formatCurrency(totalExpenses)} expenses. Net: ${formatCurrency(netBalance)}. Projected monthly spending: ${formatCurrency(projectedMonthlySpending)}`,
    severity: 'info',
    timestamp: new Date().toISOString(),
  };
};

// Check for overall over-budget warnings
export const checkOverBudgetWarnings = (
  transactions: Transaction[],
  budgets: Budget[]
): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const overBudgetCategories = budgets.filter(budget => {
    const spent = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === budget.category &&
        new Date(t.date) >= firstDayOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return spent > budget.limit;
  });

  if (overBudgetCategories.length > 0) {
    alerts.push({
      id: `over-budget-warning-${now.toISOString()}`,
      type: 'over_budget',
      title: `⚠️ Over Budget Warning`,
      description: `You're over budget in ${overBudgetCategories.length} categor${overBudgetCategories.length > 1 ? 'ies' : 'y'}. Review your spending to stay on track.`,
      severity: 'error',
      timestamp: new Date().toISOString(),
    });
  }

  return alerts;
};

// Get all alerts
export const getAllAlerts = (
  transactions: Transaction[],
  budgets: Budget[],
  goals: FinancialGoal[],
  previousGoals: FinancialGoal[] = []
): Alert[] => {
  const alerts: Alert[] = [];

  // Budget alerts
  alerts.push(...checkBudgetAlerts(transactions, budgets));
  
  // Goal alerts
  alerts.push(...checkGoalAlerts(goals, previousGoals));
  
  // Over-budget warnings
  alerts.push(...checkOverBudgetWarnings(transactions, budgets));

  // Sort by timestamp (newest first)
  return alerts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

