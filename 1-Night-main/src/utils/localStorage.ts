import { Transaction } from '@/types/transaction';

const TRANSACTIONS_KEY = 'student-finance-transactions';

export const getTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading transactions from localStorage:', error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
  }
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
  const newTransaction: Transaction = {
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  const transactions = getTransactions();
  transactions.unshift(newTransaction); // Add to beginning for most recent first
  saveTransactions(transactions);
  
  return newTransaction;
};

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveTransactions(filtered);
};