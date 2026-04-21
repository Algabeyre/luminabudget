import React from 'react';
import { Budget } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface BudgetTrackerProps {
  budgets: Budget[];
}

export function BudgetTracker({ budgets }: BudgetTrackerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {budgets.map((budget) => {
        const percent = Math.min((budget.spent / budget.limit) * 100, 100);
        const isOver = budget.spent > budget.limit;
        const isNear = budget.spent > budget.limit * 0.8 && !isOver;

        return (
          <div key={budget.category} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">{budget.category}</h4>
              {isOver ? (
                <AlertCircle className="w-5 h-5 text-brand-secondary animate-pulse" />
              ) : isNear ? (
                <AlertCircle className="w-5 h-5 text-orange-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-brand-accent" />
              )}
            </div>
            
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-2xl font-bold">${budget.spent}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Spent of ${budget.limit}</p>
              </div>
              <p className={cn(
                "text-sm font-bold",
                isOver ? "text-brand-secondary" : isNear ? "text-orange-400" : "text-brand-accent"
              )}>
                {percent.toFixed(0)}%
              </p>
            </div>

            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full transition-colors duration-500",
                  isOver ? "bg-brand-secondary" : isNear ? "bg-orange-400" : "bg-brand-primary"
                )}
              />
            </div>

            {isOver && (
              <p className="mt-3 text-xs text-brand-secondary font-medium">
                You've exceeded your budget by ${budget.spent - budget.limit}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
