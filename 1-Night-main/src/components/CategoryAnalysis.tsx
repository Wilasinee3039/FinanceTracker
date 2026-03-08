import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/utils/analytics';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingDown, PieChart as PieChartIcon } from 'lucide-react';

interface CategoryAnalysisProps {
  transactions: Transaction[];
}

export const CategoryAnalysis = ({ transactions }: CategoryAnalysisProps) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= thirtyDaysAgo && transactionDate <= now;
  });

  const expensesByCategory = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomeByCategory = recentTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
  })).sort((a, b) => b.amount - a.amount);

  const incomeData = Object.entries(incomeByCategory).map(([category, amount]) => ({
    category,
    amount,
  })).sort((a, b) => b.amount - a.amount);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--success))'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm">{payload[0].payload.category}</p>
          <p className="text-sm font-semibold text-primary">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Category Analysis (Last 30 Days)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-2">
                  {expenseData.slice(0, 5).map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No expense data available</p>
            )}
          </CardContent>
        </Card>

        {/* Income Breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-success rotate-180" />
              Income Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={incomeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No income data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};