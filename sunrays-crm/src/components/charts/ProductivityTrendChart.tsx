// ProductivityTrendChart
import { ChartCard } from '../common/ChartCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', actions: 45, calls: 30 },
  { day: 'Tue', actions: 52, calls: 42 },
  { day: 'Wed', actions: 38, calls: 25 },
  { day: 'Thu', actions: 65, calls: 48 },
  { day: 'Fri', actions: 48, calls: 38 },
  { day: 'Sat', actions: 12, calls: 5 },
  { day: 'Sun', actions: 8, calls: 2 },
];

export const ProductivityTrendChart = () => {
  return (
    <ChartCard 
      title="Daily Productivity Trend" 
      subtitle="Volume of calls and actions logged"
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Area type="monotone" dataKey="actions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActions)" name="Total Actions" />
          <Area type="monotone" dataKey="calls" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" name="Calls Made" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
