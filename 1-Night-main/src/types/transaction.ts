export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  createdAt: string;
}

export interface WeeklySummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  avgDailyIncome: number;
  avgDailyExpense: number;
}

export interface MonthlySummary {
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
}

export const INCOME_CATEGORIES = [
  'Allowance',
  'Part-time Job',
  'Scholarship',
  'Gifts',
  'Other Income'
];

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Tuition & Fees',
  'Books & Supplies',
  'Entertainment',
  'Clothing',
  'Health & Fitness',
  'Rent & Utilities',
  'Other Expenses'
];