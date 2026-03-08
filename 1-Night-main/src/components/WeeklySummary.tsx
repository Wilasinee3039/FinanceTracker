import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WeeklySummary as WeeklySummaryType, MonthlySummary } from '@/types/transaction';
import { formatCurrency } from '@/utils/analytics';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface WeeklySummaryProps {
  summary: WeeklySummaryType;
  monthlySummary: MonthlySummary;
}

export const WeeklySummary = ({ summary, monthlySummary }: WeeklySummaryProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Calendar className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold">Last 7 Days</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-elevated bg-gradient-income text-income-foreground border-0 overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90 font-medium mb-1">Total Income</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.totalIncome)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 opacity-90" />
              </div>
            </div>
            <div className="pt-3 border-t border-white/20">
              <p className="text-xs opacity-80 font-medium">
                Avg: {formatCurrency(summary.avgDailyIncome)}/day
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elevated bg-gradient-expense text-expense-foreground border-0 overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90 font-medium mb-1">Total Expenses</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <TrendingDown className="w-8 h-8 opacity-90" />
              </div>
            </div>
            <div className="pt-3 border-t border-white/20">
              <p className="text-xs opacity-80 font-medium">
                Avg: {formatCurrency(summary.avgDailyExpense)}/day
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elevated bg-gradient-balance text-balance-foreground border-0 overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90 font-medium mb-1">Net Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.netBalance)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <DollarSign className="w-8 h-8 opacity-90" />
              </div>
            </div>
            <div className="pt-3 border-t border-white/20">
              <p className="text-xs opacity-80 font-medium">
                {summary.netBalance >= 0 ? 'Positive' : 'Negative'} cash flow
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-balance/10 text-balance">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Monthly Averages (Last 30 Days)</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-elevated bg-gradient-income text-income-foreground border-0 overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium mb-2">Average Monthly Income</p>
                  <p className="text-3xl font-bold">{formatCurrency(monthlySummary.avgMonthlyIncome)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 opacity-90" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevated bg-gradient-expense text-expense-foreground border-0 overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium mb-2">Average Monthly Expenses</p>
                  <p className="text-3xl font-bold">{formatCurrency(monthlySummary.avgMonthlyExpense)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                  <TrendingDown className="w-8 h-8 opacity-90" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};