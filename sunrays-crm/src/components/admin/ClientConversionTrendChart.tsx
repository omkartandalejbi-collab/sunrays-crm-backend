import React from 'react';
import { ChartCard } from '../common/ChartCard';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface ClientConversionTrendChartProps {
  data: any[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#f43f5e'];

export const ClientConversionTrendChart: React.FC<ClientConversionTrendChartProps> = ({ data }) => {
  return (
    <ChartCard 
      title="Client Conversion Trend" 
      subtitle="Conversion distribution by period"
      height={220}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <Pie
            data={data}
            cx="65%"
            cy="50%"
            labelLine={false}
            outerRadius={95}
            innerRadius={55}
            fill="#8884d8"
            dataKey="deals"
            nameKey="label"
            isAnimationActive={true}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`${value} Conversions`, 'Deals']}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 500
            }}
          />
          <Legend layout="vertical" verticalAlign="middle" align="left" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingLeft: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
