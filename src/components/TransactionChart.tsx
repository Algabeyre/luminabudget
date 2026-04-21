import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Transaction } from '../types';

interface TransactionChartProps {
  transactions: Transaction[];
}

export function TransactionChart({ transactions }: TransactionChartProps) {
  const data = React.useMemo(() => {
    // Group transactions by day for the last 30 days
    const dailyData: Record<string, number> = {};
    
    // Sort transactions by date
    const sorted = [...transactions].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    
    let runningBalance = 0;
    
    return sorted.map(t => {
      if (t.type === 'income') runningBalance += t.amount;
      else runningBalance -= t.amount;
      
      return {
        date: format(parseISO(t.date), 'MMM d'),
        balance: runningBalance,
        rawDate: t.date
      };
    });
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#71717a', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          hide
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#18181b', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#fff'
          }}
          itemStyle={{ color: '#8B5CF6' }}
        />
        <Area 
          type="monotone" 
          dataKey="balance" 
          stroke="#8B5CF6" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorBalance)" 
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
