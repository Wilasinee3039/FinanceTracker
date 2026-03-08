import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Transaction } from '@/types/transaction';
import { FinancialGoal } from './FinancialGoals';
import { Alert as AlertType, getAllAlerts, generateWeeklySummary, generateMonthlySummary } from '@/utils/alerts';
import { Bell, CheckCircle2, AlertCircle, AlertTriangle, Info, Trophy, TrendingUp, X, Settings } from 'lucide-react';
import { formatDate } from '@/utils/analytics';

interface Budget {
  id: string;
  category: string;
  limit: number;
}

interface AlertsManagerProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
}

const ALERT_SETTINGS_KEY = 'student-finance-alert-settings';
const ALERT_HISTORY_KEY = 'student-finance-alert-history';

interface AlertSettings {
  budgetWarnings: boolean;
  goalCelebrations: boolean;
  spendingSummaries: boolean;
  weeklySummary: boolean;
  monthlySummary: boolean;
}

export const AlertsManager = ({ transactions, budgets, goals }: AlertsManagerProps) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [settings, setSettings] = useState<AlertSettings>({
    budgetWarnings: true,
    goalCelebrations: true,
    spendingSummaries: true,
    weeklySummary: true,
    monthlySummary: true,
  });
  const [previousGoals, setPreviousGoals] = useState<FinancialGoal[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ALERT_SETTINGS_KEY);
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(ALERT_HISTORY_KEY);
    if (stored) {
      const history = JSON.parse(stored);
      setPreviousGoals(history.goals || []);
    }
  }, []);

  useEffect(() => {
    // Check for new alerts
    const allAlerts = getAllAlerts(transactions, budgets, goals, previousGoals);
    
    // Filter based on settings
    const filteredAlerts = allAlerts.filter(alert => {
      if (alert.type === 'budget_warning' || alert.type === 'budget_exceeded' || alert.type === 'over_budget') {
        return settings.budgetWarnings;
      }
      if (alert.type === 'goal_achieved' || alert.type === 'milestone') {
        return settings.goalCelebrations;
      }
      if (alert.type === 'spending_summary') {
        return settings.spendingSummaries;
      }
      return true;
    });

    setAlerts(filteredAlerts);

    // Save current goals state for next comparison
    if (goals.length > 0) {
      localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify({ goals, timestamp: new Date().toISOString() }));
      setPreviousGoals(goals);
    }
  }, [transactions, budgets, goals, settings, previousGoals]);

  const saveSettings = (newSettings: AlertSettings) => {
    setSettings(newSettings);
    localStorage.setItem(ALERT_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'default';
      case 'warning':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getSummaryAlerts = () => {
    const summaries: AlertType[] = [];
    
    if (settings.weeklySummary) {
      const weekly = generateWeeklySummary(transactions);
      if (weekly) summaries.push(weekly);
    }
    
    if (settings.monthlySummary) {
      const monthly = generateMonthlySummary(transactions);
      if (monthly) summaries.push(monthly);
    }
    
    return summaries;
  };

  const allAlertsWithSummaries = [...alerts, ...getSummaryAlerts()].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const activeAlerts = allAlertsWithSummaries.filter(a => 
    new Date(a.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Alerts & Notifications</h2>
            <p className="text-sm text-muted-foreground">Stay informed about your finances</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="shadow-elevated border-2 border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Alert Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="budget-warnings">Budget Warnings</Label>
                <p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
              </div>
              <Switch
                id="budget-warnings"
                checked={settings.budgetWarnings}
                onCheckedChange={(checked) => saveSettings({ ...settings, budgetWarnings: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="goal-celebrations">Goal Celebrations</Label>
                <p className="text-sm text-muted-foreground">Celebrate when you reach goals or milestones</p>
              </div>
              <Switch
                id="goal-celebrations"
                checked={settings.goalCelebrations}
                onCheckedChange={(checked) => saveSettings({ ...settings, goalCelebrations: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="spending-summaries">Spending Summaries</Label>
                <p className="text-sm text-muted-foreground">Receive spending summary notifications</p>
              </div>
              <Switch
                id="spending-summaries"
                checked={settings.spendingSummaries}
                onCheckedChange={(checked) => saveSettings({ ...settings, spendingSummaries: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-summary">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">Show weekly spending summary</p>
              </div>
              <Switch
                id="weekly-summary"
                checked={settings.weeklySummary}
                onCheckedChange={(checked) => saveSettings({ ...settings, weeklySummary: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="monthly-summary">Monthly Summary</Label>
                <p className="text-sm text-muted-foreground">Show monthly spending summary</p>
              </div>
              <Switch
                id="monthly-summary"
                checked={settings.monthlySummary}
                onCheckedChange={(checked) => saveSettings({ ...settings, monthlySummary: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-elevated bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/20 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Alerts</p>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elevated bg-gradient-to-br from-warning/10 to-transparent border-2 border-warning/20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Warnings</p>
                <p className="text-2xl font-bold text-warning">
                  {activeAlerts.filter(a => a.severity === 'warning' || a.severity === 'error').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elevated bg-gradient-to-br from-success/10 to-transparent border-2 border-success/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Achievements</p>
                <p className="text-2xl font-bold text-success">
                  {activeAlerts.filter(a => a.severity === 'success').length}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {activeAlerts.length === 0 ? (
        <Card className="shadow-elevated border-2 border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">All Good!</h3>
            <p className="text-muted-foreground">
              No active alerts. You're managing your finances well! 🎉
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeAlerts.map((alert, index) => (
            <Alert
              key={alert.id}
              variant={getAlertVariant(alert.severity)}
              className="shadow-lg border-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.severity)}
                <div className="flex-1">
                  <AlertTitle className="flex items-center gap-2 mb-1">
                    {alert.title}
                    <Badge
                      variant={
                        alert.severity === 'success' ? 'default' :
                        alert.severity === 'warning' ? 'secondary' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {alert.type.replace('_', ' ')}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    {alert.description}
                  </AlertDescription>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(alert.timestamp)}
                  </p>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

