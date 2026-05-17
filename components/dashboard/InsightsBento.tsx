'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Lightbulb } from 'lucide-react';
import { useKrostData } from '@/hooks/use-krost-data';

// Fallback platform colors
const PLATFORM_COLORS: Record<string, string> = {
  uber: '#141413',
  doordash: '#FF3008',
  upwork: '#3860BE',
  fiverr: '#1DBF73',
  lyft: '#FF00BF',
  grubhub: '#FE5300',
  instacart: '#1C9B5E',
  'amazon flex': '#FF9900',
  taskrabbit: '#2D9CDB',
  turo: '#0F0F0F',
};

function getPlatformColor(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, '');
  return PLATFORM_COLORS[key] || '#17171c';
}

export default function InsightsBento() {
  const { platformPercentages, entries, isLoading } = useKrostData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasData = entries.length > 0 && platformPercentages.length > 0;

  // Use real data or fallback to empty chart
  const chartData = hasData
    ? platformPercentages.slice(0, 5).map((p, idx) => ({
        name: p.name.length > 8 ? p.name.substring(0, 7) + '…' : p.name,
        value: p.value,
        color: getPlatformColor(p.name),
        opacity: 0.9 - (idx * 0.12),
      }))
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-cohere flex flex-col justify-between overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-ink/40 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-black" />
            Market Insights • Strategy
          </p>
          <h2 className="font-display text-2xl font-medium tracking-tight">Earning Sources</h2>
        </div>
        <div className="w-8 h-8 rounded-full bg-soft-stone flex items-center justify-center text-ink border border-hairline">
          <Lightbulb size={16} />
        </div>
      </div>

      <div className="h-[140px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.length > 0 ? chartData : [{ name: 'No data', value: 0, color: '#d9d9dd', opacity: 0.3 }]}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 500, fill: '#17171c', opacity: 0.4 }}
                dy={5}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#eeece7' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #d9d9dd', 
                  boxShadow: 'none',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`${value}%`]}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={entry.opacity} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {!hasData && !isLoading && (
        <p className="text-xs text-ink/40 text-center -mt-2 mb-2">
          Connect a platform to see source breakdown
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-hairline pt-4">
        {(hasData ? platformPercentages.slice(0, 5) : []).map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: getPlatformColor(item.name), opacity: 0.9 - (idx * 0.12) }}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40">{item.name}</span>
            <span className="text-[10px] font-mono text-ink">{item.value}%</span>
          </div>
        ))}
        {!hasData && !isLoading && (
          <span className="text-[10px] font-mono text-ink/30">No platforms connected yet</span>
        )}
      </div>
    </motion.div>
  );
}
