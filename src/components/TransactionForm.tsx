import React, { useState } from 'react';
import { X, Save, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction, Category } from '../types';
import { cn } from '../lib/utils';

interface TransactionFormProps {
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
}

const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Income', 'Other'
];

export function TransactionForm({ onClose, onSave }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Other');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    onSave({
      amount: Number(amount),
      type,
      category,
      description,
      date: new Date(date).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md glass-panel rounded-[32px] p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gradient">New Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex p-1 glass-inset rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                type === 'expense' ? "bg-white/10 text-brand-secondary shadow-lg blur-0" : "text-zinc-500"
              )}
            >
              <TrendingDown className="w-4 h-4" /> Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                type === 'income' ? "bg-white/10 text-brand-accent shadow-lg blur-0" : "text-zinc-500"
              )}
            >
              <TrendingUp className="w-4 h-4" /> Income
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-500">$</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold focus:outline-none focus:border-brand-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:border-brand-primary/40 transition-all appearance-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:border-brand-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Description</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:border-brand-primary/40 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
          >
            <Save className="w-5 h-5" /> Save Transaction
          </button>
        </form>
      </motion.div>
    </div>
  );
}
