export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Housing' 
  | 'Entertainment' 
  | 'Shopping' 
  | 'Health' 
  | 'Income' 
  | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  description: string;
  date: string; // ISO string
  userId: string;
}

export interface Budget {
  id?: string;
  category: Category;
  limit: number;
  spent: number;
  userId: string;
}

export interface FinancialStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}
