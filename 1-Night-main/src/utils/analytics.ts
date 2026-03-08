import { Transaction, WeeklySummary, MonthlySummary } from '@/types/transaction';

export const calculateWeeklySummary = (transactions: Transaction[]): WeeklySummary => {
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
  const avgDailyIncome = totalIncome / 7;
  const avgDailyExpense = totalExpenses / 7;
  
  return {
    totalIncome,
    totalExpenses,
    netBalance,
    avgDailyIncome,
    avgDailyExpense,
  };
};

export const calculateMonthlySummary = (transactions: Transaction[]): MonthlySummary => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= thirtyDaysAgo && transactionDate <= now;
  });
  
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const avgMonthlyIncome = totalIncome;
  const avgMonthlyExpense = totalExpenses;
  
  return {
    avgMonthlyIncome,
    avgMonthlyExpense,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
};