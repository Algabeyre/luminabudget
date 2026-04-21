import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, RefreshCcw, Lightbulb, TriangleAlert, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { getFinancialAdvice } from '../services/aiService';
import { Transaction, Budget } from '../types';
import { cn } from '../lib/utils';

interface AICounselorProps {
  transactions: Transaction[];
  budgets: Budget[];
}

interface Insight {
  title: string;
  description: string;
  category: 'Warning' | 'Opportunity' | 'Tip' | 'Success';
}

export function AICounselor({ transactions, budgets }: AICounselorProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const data = await getFinancialAdvice(transactions, budgets);
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'Warning': return <TriangleAlert className="w-5 h-5 text-brand-secondary" />;
      case 'Success': return <Trophy className="w-5 h-5 text-brand-accent" />;
      case 'Tip': return <Lightbulb className="w-5 h-5 text-orange-400" />;
      default: return <BrainCircuit className="w-5 h-5 text-brand-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center p-2">
            <Sparkles className="text-brand-primary w-full h-full" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gradient">Lumina Strategist</h3>
            <p className="text-xs text-indigo-300 uppercase tracking-widest font-semibold italic">Gemini-Powered Engine</p>
          </div>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="p-2 rounded-xl glass-inset hover:bg-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card h-32 animate-pulse rounded-2xl" />
          ))
        ) : (
          insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card rounded-[24px] p-6 relative group border-l-4"
              style={{ 
                borderLeftColor: insight.category === 'Warning' ? '#f43f5e' : 
                                insight.category === 'Success' ? '#34d399' : 
                                insight.category === 'Tip' ? '#fb923c' : '#818cf8' 
              }}
            >
              <div className="flex gap-4">
                <div className="mt-1">{getIcon(insight.category)}</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">{insight.title}</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {!loading && insights.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <BrainCircuit className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500">Click refresh to generate AI insights</p>
        </div>
      )}
    </div>
  );
}
