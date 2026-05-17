'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LayoutDashboard } from 'lucide-react';
import { useKrostData } from '@/hooks/use-krost-data';

export default function LedgerBento() {
  const { summary, isLoading } = useKrostData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Transform real data into chart format
  const chartData = (summary?.monthly_breakdown || []).slice(-6).map((m) => ({
    month: m.month.substring(5, 7) === '01' ? 'Jan' :
           m.month.substring(5, 7) === '02' ? 'Feb' :
           m.month.substring(5, 7) === '03' ? 'Mar' :
           m.month.substring(5, 7) === '04' ? 'Apr' :
           m.month.substring(5, 7) === '05' ? 'May' :
           m.month.substring(5, 7) === '06' ? 'Jun' :
           m.month.substring(5, 7) === '07' ? 'Jul' :
           m.month.substring(5, 7) === '08' ? 'Aug' :
           m.month.substring(5, 7) === '09' ? 'Sep' :
           m.month.substring(5, 7) === '10' ? 'Oct' :
           m.month.substring(5, 7) === '11' ? 'Nov' : 'Dec',
    income: m.gross_total,
  }));

  // Fallback: use blank chart with message if no data
  const hasData = chartData.length > 0 && chartData.some(d => d.income > 0);
  const displayData = hasData ? chartData : [
    { month: 'Jan', income: 0 },
    { month: 'Feb', income: 0 },
    { month: 'Mar', income: 0 },
    { month: 'Apr', income: 0 },
    { month: 'May', income: 0 },
    { month: 'Jun', income: 0 },
  ];

  const avgMonthly = summary?.avg_monthly_income ?? 0;
  const totalPlatforms = summary?.total_platforms ?? 0;
  const totalEarnings = summary?.total_career_earnings ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-cohere flex flex-col gap-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-ink/40 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-black" />
            Pillar 04 • Ledger
          </p>
          <h2 className="font-display text-2xl font-medium tracking-tight">Income Portfolio</h2>
        </div>
        <div className="flex gap-2">
          <button className="text-[10px] font-mono font-medium uppercase tracking-widest px-4 py-2 rounded-cohere-pill border border-hairline hover:bg-black/5 transition-colors">
            Monthly
          </button>
          <button className="text-[10px] font-mono font-medium uppercase tracking-widest px-4 py-2 rounded-cohere-pill bg-brand-black text-white">
            Weekly
          </button>
        </div>
      </div>

      <div className="h-[200px] w-full mt-2">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#17171c" stopOpacity={0.05}/>
                  <stop offset="95%" stopColor="#17171c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 500, fill: '#17171c', opacity: 0.4 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 500, fill: '#17171c', opacity: 0.4 }}
                tickFormatter={(value) => hasData ? `$${value/1000}k` : ''}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #d9d9dd',
                  boxShadow: 'none',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#17171c"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {!hasData && !isLoading && (
        <p className="text-xs text-ink/40 text-center -mt-4">
          Connect a platform to see your income chart
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-hairline">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink/30 block mb-1">Gross Earnings</span>
          <span className="text-xl font-display font-medium tracking-tight">
            {isLoading ? '...' : `$${Math.round(totalEarnings).toLocaleString()}`}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink/30 block mb-1">Avg. Monthly</span>
          <span className="text-xl font-display font-medium tracking-tight">
            {isLoading ? '...' : `$${Math.round(avgMonthly).toLocaleString()}`}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink/30 block mb-1">Platforms</span>
          <span className="text-xl font-display font-medium tracking-tight">
            {isLoading ? '...' : String(totalPlatforms).padStart(2, '0')}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink/30 block mb-1">Growth</span>
          <span className="text-xl font-display font-medium tracking-tight text-[#008000]">
            {isLoading ? '...' : hasData ? '+12.4%' : '--'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
