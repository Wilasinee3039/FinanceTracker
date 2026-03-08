import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/utils/analytics';
import { deleteTransaction, saveTransactions } from '@/utils/localStorage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditTransactionDialog } from './EditTransactionDialog';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionDeleted: (id: string) => void;
  onTransactionUpdated: (updatedTransaction: Transaction) => void;
}

export const TransactionList = ({ transactions, onTransactionDeleted, onTransactionUpdated }: TransactionListProps) => {
  const { toast } = useToast();
  
  const handleDelete = (id: string, type: string, amount: number) => {
    deleteTransaction(id);
    onTransactionDeleted(id);
    
    toast({
      title: "Transaction Deleted",
      description: `${type === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(amount)} deleted`,
    });
  };

  if (transactions.length === 0) {
    return (
      <Card className="shadow-elevated border-2 border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Receipt className="w-5 h-5" />
            </div>
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Receipt className="w-10 h-10 opacity-50" />
            </div>
            <p className="text-lg font-medium mb-2">No transactions yet</p>
            <p className="text-sm">Add your first transaction above to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated border-2 border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Receipt className="w-5 h-5" />
          </div>
          Transaction History
          <Badge variant="secondary" className="ml-auto text-base px-3 py-1">
            {transactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                  transaction.type === 'income' 
                    ? 'bg-income/20 text-income border-2 border-income/30' 
                    : 'bg-expense/20 text-expense border-2 border-expense/30'
                }`}>
                  <span className="text-lg font-bold">
                    {transaction.type === 'income' ? '↗' : '↘'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-base">{transaction.category}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-bold text-lg mb-1 ${
                    transaction.type === 'income' ? 'text-income' : 'text-expense'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <Badge 
                    variant={transaction.type === 'income' ? 'default' : 'destructive'}
                    className="text-xs font-medium"
                  >
                    {transaction.type}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <EditTransactionDialog 
                    transaction={transaction}
                    onSave={onTransactionUpdated}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(transaction.id, transaction.type, transaction.amount)}
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};