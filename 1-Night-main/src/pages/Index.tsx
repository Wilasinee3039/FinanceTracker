import { useState, useEffect } from 'react';
import { Transaction, WeeklySummary as WeeklySummaryType, MonthlySummary } from '@/types/transaction';
import { getTransactions, saveTransactions } from '@/utils/localStorage';
import { calculateWeeklySummary, calculateMonthlySummary } from '@/utils/analytics';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { WeeklySummary } from '@/components/WeeklySummary';
import { CategoryAnalysis } from '@/components/CategoryAnalysis';
import { TransactionFilters } from '@/components/TransactionFilters';
import { BudgetTracker } from '@/components/BudgetTracker';
import { FinancialGoals } from '@/components/FinancialGoals';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AlertIcon } from '@/components/AlertIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Array<{ id: string; category: string; limit: number }>>([]);
  const [goals, setGoals] = useState<Array<{ id: string; title: string; targetAmount: number; currentAmount: number; targetDate: string }>>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadedTransactions = getTransactions();
    setTransactions(loadedTransactions);
    setFilteredTransactions(loadedTransactions);
  }, []);

  // Load budgets and goals for alerts, and sync when they change
  useEffect(() => {
    const loadData = () => {
      const storedBudgets = localStorage.getItem('student-finance-budgets');
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }
      
      const storedGoals = localStorage.getItem('student-finance-goals');
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    };

    loadData();
    
    // Listen for storage changes (when budgets/goals are updated in other components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'student-finance-budgets' || e.key === 'student-finance-goals') {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (for same-tab updates)
    const interval = setInterval(loadData, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Monitor for alerts and show toast notifications
  useAlerts(transactions, budgets, goals);

  const handleTransactionAdded = (transaction: Transaction) => {
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);
    setFilteredTransactions(newTransactions);
  };

  const handleTransactionDeleted = (id: string) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    setFilteredTransactions(newTransactions.filter(t => 
      filteredTransactions.some(ft => ft.id === t.id)
    ));
  };

  const handleTransactionUpdated = (updatedTransaction: Transaction) => {
    const newTransactions = transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    setTransactions(newTransactions);
    saveTransactions(newTransactions);
    
    // Update filtered transactions if the updated transaction was in the filtered list
    setFilteredTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };

  const weeklySummary = calculateWeeklySummary(transactions);
  const monthlySummary = calculateMonthlySummary(transactions);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Beautiful background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-0 left-1/4 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-full h-full bg-gradient-to-bl from-balance/5 via-transparent to-transparent blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <header className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 group">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Student Finance Tracker
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-primary to-balance rounded-full mt-1"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertIcon 
                transactions={transactions}
                budgets={budgets}
                goals={goals}
              />
              <ThemeToggle />
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Track your income and expenses to stay on top of your finances with beautiful insights and analytics
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50 backdrop-blur-sm border border-border/50 shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Transactions</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Analytics</TabsTrigger>
            <TabsTrigger value="budgets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Budgets</TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <TransactionForm onTransactionAdded={handleTransactionAdded} />
              </div>
              
              <div className="lg:col-span-2 space-y-8">
                <WeeklySummary summary={weeklySummary} monthlySummary={monthlySummary} />
                <TransactionList 
                  transactions={transactions.slice(0, 10)} 
                  onTransactionDeleted={handleTransactionDeleted}
                  onTransactionUpdated={handleTransactionUpdated}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6 animate-fade-in">
            <TransactionFilters 
              transactions={transactions}
              onFilterChange={setFilteredTransactions}
            />
            <TransactionList 
              transactions={filteredTransactions} 
              onTransactionDeleted={handleTransactionDeleted}
              onTransactionUpdated={handleTransactionUpdated}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            <CategoryAnalysis transactions={transactions} />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6 animate-fade-in">
            <BudgetTracker transactions={transactions} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 animate-fade-in">
            <FinancialGoals transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
