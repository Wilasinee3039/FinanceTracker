import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/transaction';
import { Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditTransactionDialogProps {
  transaction: Transaction;
  onSave: (updatedTransaction: Transaction) => void;
}

export const EditTransactionDialog = ({ transaction, onSave }: EditTransactionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: transaction.type,
    amount: transaction.amount.toString(),
    category: transaction.category,
    date: transaction.date,
  });
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: transaction.date,
    });
  }, [transaction]);

  const handleSave = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    const updatedTransaction: Transaction = {
      ...transaction,
      type: formData.type as 'income' | 'expense',
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
    };

    onSave(updatedTransaction);
    setIsOpen(false);
    
    toast({
      title: "Transaction updated",
      description: "Your transaction has been successfully updated.",
    });
  };

  const availableCategories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => {
              setFormData(prev => ({ 
                ...prev, 
                type: value as 'income' | 'expense',
                category: '' // Reset category when type changes
              }));
              }}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">Expense</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};