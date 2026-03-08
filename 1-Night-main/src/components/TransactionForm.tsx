import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, Transaction } from '@/types/transaction';
import { addTransaction } from '@/utils/localStorage';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface TransactionFormProps {
  onTransactionAdded: (transaction: Transaction) => void;
}

export const TransactionForm = ({ onTransactionAdded }: TransactionFormProps) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    const transaction = addTransaction({
      type,
      amount: numAmount,
      category,
      date,
    });

    onTransactionAdded(transaction);
    
    toast({
      title: "Transaction Added",
      description: `${type === 'income' ? 'Income' : 'Expense'} of $${numAmount.toFixed(2)} added successfully`,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Card className="shadow-elevated border-2 border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/30 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Plus className="w-5 h-5" />
          </div>
          Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            variant={type === 'income' ? 'default' : 'destructive'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {type === 'income' ? 'Income' : 'Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};