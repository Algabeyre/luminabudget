/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Wallet, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  Search,
  Bell,
  Menu,
  X,
  History,
  Target,
  LogIn,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Transaction, Category, Budget } from './types';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { TransactionChart } from './components/TransactionChart';
import { BudgetTracker } from './components/BudgetTracker';
import { AICounselor } from './components/AICounselor';
import { TransactionForm } from './components/TransactionForm';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  subscribeToTransactions, 
  subscribeToBudgets, 
  addTransaction, 
  updateBudgetSpent,
  initializeUserBudgets
} from './services/dbService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'insights'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        initializeUserBudgets(u.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubTransactions = subscribeToTransactions(user.uid, setTransactions);
    const unsubBudgets = subscribeToBudgets(user.uid, setBudgets);
    
    return () => {
      unsubTransactions();
      unsubBudgets();
    };
  }, [user]);

  const handleAddTransaction = async (newT: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    
    const transactionData = {
      ...newT,
      userId: user.uid
    };
    
    await addTransaction(transactionData);
    await updateBudgetSpent(user.uid, newT.category, newT.amount, newT.type);
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    
    const monthlyTransactions = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), currentMonth)
    );

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalBalance = transactions.reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0
    );

    return {
      totalBalance,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
    };
  }, [transactions]);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'insights', label: 'AI Strategy', icon: Sparkles },
  ];

  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center animate-pulse">
          <TrendingUp className="text-brand-primary w-6 h-6" />
        </div>
        <p className="text-zinc-500 font-medium animate-pulse tracking-widest text-xs uppercase">Initializing Lumina...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex relative overflow-hidden bg-[#0f172a]">
        <div className="mesh-bg" />
        
        <div className="relative z-10 m-auto max-w-md w-full px-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-brand-primary to-brand-secondary p-3 mb-8 shadow-2xl shadow-brand-primary/20 rotate-12">
            <TrendingUp className="text-white w-full h-full" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">LUMINA</h1>
          <p className="text-zinc-500 font-medium mb-10 text-lg">Intelligent wealth management for the modern economy.</p>
          
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-white text-zinc-950 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </div>
            Access Wealth Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden text-zinc-100 font-sans">
      <div className="mesh-bg" />

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="relative z-30 flex flex-col glass-panel border-r-0 h-full backdrop-blur-2xl"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary flex items-center justify-center p-2 shadow-xl shadow-brand-primary/20">
            <TrendingUp className="text-white w-full h-full" />
          </div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                LUMINA
              </span>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] -mt-1">Wealth Studio</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative",
                activeTab === item.id 
                  ? "text-white" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-500 group-hover:scale-110", activeTab === item.id && "text-brand-primary")} />
              {isSidebarOpen && <span className="font-semibold tracking-tight">{item.label}</span>}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 -z-10 shadow-inner shadow-white/5"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          {isSidebarOpen && (
            <>
              <div className="glass-inset p-4 mb-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Wealth Tier</p>
                <div className="w-full h-1 bg-slate-800 rounded-full mb-3">
                  <div className="w-3/4 h-full bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">75% Efficiency score</p>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-brand-secondary hover:bg-brand-secondary/5 transition-all text-sm font-bold"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-white/5 text-zinc-500 transition-all hover:text-zinc-200"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden bg-zinc-950/20">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative group max-w-sm w-full hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search financials..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-brand-secondary rounded-full border-2 border-zinc-950 animate-pulse" />
            </button>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex items-center gap-3 group px-2 py-1 rounded-2xl">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold tracking-tight">{user?.displayName}</p>
                <p className="text-[10px] uppercase tracking-tighter text-zinc-500 font-black">Elite Member</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-white/10 overflow-hidden ring-4 ring-brand-primary/5 group-hover:ring-brand-primary/10 transition-all">
                <img src={user?.photoURL || "https://picsum.photos/seed/financial/100/100"} alt="Avatar" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Action Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-6xl mx-auto"
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-10">
                  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-4xl font-black tracking-tighter text-gradient">Your Financial Universe</h1>
                      <p className="text-zinc-500 mt-1 font-medium italic">Synchronized and secure. Spending is down 4% today.</p>
                    </div>
                    <button 
                      onClick={() => setIsFormOpen(true)}
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3.5 rounded-2xl font-bold tracking-tight flex items-center justify-center gap-2 shadow-2xl shadow-brand-primary/30 transition-all active:scale-95 group"
                    >
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      Add Entry
                    </button>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                      label="Current Balance" 
                      value={`$${stats.totalBalance.toLocaleString()}`} 
                      subtext="Available Liquid Wealth"
                      icon={Wallet}
                      trend="+5.4%"
                    />
                    <StatCard 
                      label="Monthly Revenue" 
                      value={`$${stats.monthlyIncome.toLocaleString()}`} 
                      subtext="Projected: $5,400"
                      icon={TrendingUp}
                      color="text-brand-accent"
                    />
                    <StatCard 
                      label="Critical Expenses" 
                      value={`$${stats.monthlyExpenses.toLocaleString()}`} 
                      subtext="Fixed Commitments"
                      icon={TrendingDown}
                      color="text-brand-secondary"
                    />
                    <StatCard 
                      label="Efficiency Score" 
                      value={`${stats.savingsRate.toFixed(1)}%`} 
                      subtext="Savings Index"
                      icon={Sparkles}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card rounded-[32px] p-8 min-h-[460px] flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                           Global Trajectory
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 py-1 px-3 rounded-full border border-white/5">Realtime Dynamics</span>
                        </h3>
                        <div className="flex gap-2">
                          {['1D', '1W', '1M', 'ALL'].map(t => (
                            <button key={t} className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all", t === '1M' ? "bg-brand-primary/10 text-brand-primary" : "text-zinc-500 hover:text-zinc-300")}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 w-full min-h-[300px]">
                        <TransactionChart transactions={transactions} />
                      </div>
                    </div>
                    
                    <div className="glass-card rounded-[32px] p-8 flex flex-col">
                      <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                        Recent Flow
                      </h3>
                      <div className="space-y-5 flex-1">
                        {transactions.slice(0, 6).map(t => (
                          <div key={t.id} className="flex items-center justify-between group cursor-pointer p-1 rounded-2xl transition-all">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                t.type === 'income' ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/10" : "bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/10"
                              )}>
                                {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold tracking-tight">{t.description}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t.category} • {format(parseISO(t.date), 'MMM d')}</p>
                              </div>
                            </div>
                            <p className={cn(
                              "font-bold text-lg tracking-tighter",
                              t.type === 'income' ? "text-brand-accent" : "text-zinc-200"
                            )}>
                              {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => setActiveTab('transactions')}
                        className="w-full mt-8 py-4 rounded-2xl border border-white/5 bg-white/5 text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-sm"
                      >
                        Deep Scan History
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="space-y-8">
                  <header>
                    <h1 className="text-4xl font-black tracking-tighter text-gradient">Transaction Ledger</h1>
                    <p className="text-zinc-500 font-medium italic">Immutable history of your digital economy.</p>
                  </header>
                  <div className="glass-card rounded-[32px] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</th>
                          <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(t => (
                          <motion.tr 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={t.id} 
                            className="border-b border-white/2 hover:bg-white/5 transition-all group cursor-default"
                          >
                            <td className="px-8 py-5 text-sm font-medium text-zinc-400">{format(parseISO(t.date), 'MMM dd, yyyy')}</td>
                            <td className="px-8 py-5 font-bold tracking-tight text-white">{t.description}</td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-black bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg uppercase tracking-widest text-zinc-500 group-hover:text-zinc-200 transition-colors">
                                {t.category}
                              </span>
                            </td>
                            <td className={cn(
                              "px-8 py-5 text-right font-black text-lg tracking-tighter",
                              t.type === 'income' ? "text-brand-accent" : "text-white"
                            )}>
                              {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'budgets' && (
                <div className="space-y-8">
                  <header className="flex justify-between items-center">
                    <div>
                      <h1 className="text-4xl font-black tracking-tighter text-gradient">Threshold Monitoring</h1>
                      <p className="text-zinc-500 font-medium italic">Enforcement of financial boundaries.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Aggregated Spent</p>
                        <p className="text-2xl font-black tracking-tighter">${budgets.reduce((a,b) => a+b.spent, 0).toLocaleString()}</p>
                      </div>
                      <div className="w-px h-full bg-white/10" />
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Limit</p>
                        <p className="text-2xl font-black tracking-tighter text-brand-primary">${budgets.reduce((a,b) => a+b.limit, 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </header>
                  <BudgetTracker budgets={budgets} />
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-8">
                  <header>
                    <h1 className="text-4xl font-black tracking-tighter text-gradient">Strategic Intelligence</h1>
                    <p className="text-zinc-500 font-medium italic">High-performance analysis for your wealth accumulation.</p>
                  </header>
                  <AICounselor transactions={transactions} budgets={budgets} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Transaction Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <TransactionForm 
            onClose={() => setIsFormOpen(false)} 
            onSave={handleAddTransaction} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, subtext, icon: Icon, trend, color = "text-brand-primary" }: any) {
  const accentBorder = color.includes('brand-accent') ? 'border-l-brand-accent' : 
                       color.includes('brand-secondary') ? 'border-l-brand-secondary' : 
                       'border-l-brand-primary';

  return (
    <div className={cn(
      "glass-card rounded-[32px] p-8 group hover:translate-y-[-6px] transition-all duration-500 hover:shadow-2xl hover:shadow-brand-primary/5 border-white/5 active:scale-[0.98] border-l-4",
      accentBorder
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className={cn("p-3 rounded-2xl bg-white/5 transition-transform group-hover:rotate-12 duration-500 flex items-center justify-center", color)}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-[10px] font-black text-brand-accent bg-brand-accent/10 py-1.5 px-3 rounded-full border border-brand-accent/20 tracking-widest uppercase">
            {trend}
          </span>
        )}
      </div>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
      <h2 className="text-3xl font-black text-white mb-2 ml-[-2px] tracking-tighter">{value}</h2>
      <p className="text-[11px] font-bold text-zinc-500 flex items-center justify-between italic tracking-tight">
        {subtext}
      </p>
    </div>
  );
}

