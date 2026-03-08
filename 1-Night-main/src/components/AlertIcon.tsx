import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { getAllAlerts, generateWeeklySummary, generateMonthlySummary } from '@/utils/alerts';
import { Transaction } from '@/types/transaction';
import { FinancialGoal } from './FinancialGoals';
import { formatDate } from '@/utils/analytics';

interface Budget {
  id: string;
  category: string;
  limit: number;
}

interface AlertIconProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
}

export const AlertIcon = ({ transactions, budgets, goals }: AlertIconProps) => {
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Calculate active alerts
    const allAlerts = getAllAlerts(transactions, budgets, goals);
    
    // Add summaries
    const weekly = generateWeeklySummary(transactions);
    const monthly = generateMonthlySummary(transactions);
    if (weekly) allAlerts.push(weekly);
    if (monthly) allAlerts.push(monthly);
    
    // Filter alerts from last 7 days
    const recentAlerts = allAlerts.filter(alert => 
      new Date(alert.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setActiveAlerts(recentAlerts);

    // Count only unread/important alerts (warnings and errors)
    const importantAlerts = recentAlerts.filter(a => 
      a.severity === 'warning' || a.severity === 'error'
    ).length;

    setActiveAlertsCount(importantAlerts);
  }, [transactions, budgets, goals]);

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 relative"
          title="View Alerts"
        >
          <Bell className="h-4 w-4" />
          {activeAlertsCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
            >
              {activeAlertsCount > 9 ? '9+' : activeAlertsCount}
            </Badge>
          )}
          <span className="sr-only">View alerts</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts & Notifications
          </h3>
          {activeAlertsCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {activeAlertsCount} important alert{activeAlertsCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {activeAlerts.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No active alerts</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {activeAlerts.slice(0, 10).map((alert) => (
                <Alert
                  key={alert.id}
                  variant={alert.severity === 'error' ? 'destructive' : 'default'}
                  className="p-3 text-xs"
                >
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <AlertTitle className="text-xs font-semibold mb-1">
                        {alert.title}
                      </AlertTitle>
                      <AlertDescription className="text-xs">
                        {alert.description}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                </Alert>
              ))}
              {activeAlerts.length > 10 && (
                <p className="text-xs text-center text-muted-foreground p-2">
                  +{activeAlerts.length - 10} more alerts
                </p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

