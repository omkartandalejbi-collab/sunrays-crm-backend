import { ChartCard } from '../common/ChartCard';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const data = [
  { name: 'Assigned', value: 100, fill: '#3b82f6' },
  { name: 'Contacted', value: 80, fill: '#6366f1' },
  { name: 'Interested', value: 50, fill: '#10b981' },
  { name: 'Meeting', value: 30, fill: '#a855f7' },
  { name: 'Converted', value: 15, fill: '#16a34a' },
];

export const LeadFunnelChart = () => {
  return (
    <ChartCard 
      title="Lead Conversion Stages" 
      subtitle="Current status of all leads"
      height={200}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--popover))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
          />
          <Pie
            dataKey="value"
            data={data}
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            isAnimationActive
          >
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))
            }
          </Pie>
          <Legend layout="vertical" verticalAlign="middle" align="left" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
