import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { Transaction } from '@/types/transaction';
import { FinancialGoal } from '@/components/FinancialGoals';
import { getAllAlerts, checkBudgetAlerts, checkGoalAlerts } from '@/utils/alerts';

interface Budget {
  id: string;
  category: string;
  limit: number;
}

export const useAlerts = (
  transactions: Transaction[],
  budgets: Budget[],
  goals: FinancialGoal[]
) => {
  const previousGoalsRef = useRef<FinancialGoal[]>([]);
  const shownAlertsRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    // Throttle alert checks to avoid too many notifications
    const now = Date.now();
    if (now - lastCheckRef.current < 2000) return; // Only check every 2 seconds
    lastCheckRef.current = now;

    // Get previous goals from localStorage
    const stored = localStorage.getItem('student-finance-alert-history');
    const previousGoals = stored ? JSON.parse(stored).goals || [] : [];

    // Check for new alerts
    const budgetAlerts = checkBudgetAlerts(transactions, budgets);
    const goalAlerts = checkGoalAlerts(goals, previousGoals);

    // Show toast notifications for new alerts
    [...budgetAlerts, ...goalAlerts].forEach(alert => {
      // Create unique key with timestamp to avoid duplicates
      const alertKey = `${alert.id}-${Math.floor(new Date(alert.timestamp).getTime() / 60000)}`; // Minute precision
      
      if (!shownAlertsRef.current.has(alertKey)) {
        shownAlertsRef.current.add(alertKey);
        
        // Clean up old alert keys (keep only last 100)
        if (shownAlertsRef.current.size > 100) {
          const keysArray = Array.from(shownAlertsRef.current);
          shownAlertsRef.current = new Set(keysArray.slice(-50));
        }

        // Small delay to avoid notification spam
        setTimeout(() => {
          // Show toast based on severity
          if (alert.severity === 'success') {
            toast({
              title: alert.title,
              description: alert.description,
            });
          } else if (alert.severity === 'warning') {
            toast({
              title: alert.title,
              description: alert.description,
              variant: 'default',
            });
          } else if (alert.severity === 'error') {
            toast({
              title: alert.title,
              description: alert.description,
              variant: 'destructive',
            });
          } else {
            toast({
              title: alert.title,
              description: alert.description,
            });
          }
        }, 100);
      }
    });

    // Save current goals for next comparison
    if (goals.length > 0) {
      const goalsToSave = goals.map(g => ({
        id: g.id,
        currentAmount: g.currentAmount,
        targetAmount: g.targetAmount,
      }));
      localStorage.setItem('student-finance-alert-history', JSON.stringify({ 
        goals: goalsToSave, 
        timestamp: new Date().toISOString() 
      }));
      previousGoalsRef.current = goals;
    }
  }, [transactions, budgets, goals]);
};

