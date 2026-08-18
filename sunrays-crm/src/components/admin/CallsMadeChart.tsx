import React from 'react';
import { ChartCard } from '../common/ChartCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export interface CallsMadeChartProps {
  data: { label: string; calls: number }[];
}

export const CallsMadeChart: React.FC<CallsMadeChartProps> = ({ data }) => {

  return (
    <ChartCard 
      title="Calls Made" 
      subtitle="Calls completed over time"
      height={220}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 500
            }}
            formatter={(value: any) => [`${value} Calls`, 'Total']}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
          />
          <Bar 
            dataKey="calls" 
            name="Calls" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={48}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
