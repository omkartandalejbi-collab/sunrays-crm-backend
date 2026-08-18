import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, PhoneCall, TrendingUp } from 'lucide-react';
import { animations } from '../../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

import { ExecutiveKPICard } from '../../components/admin/ExecutiveKPICard';
import { ClientConversionTrendChart } from '../../components/admin/ClientConversionTrendChart';
import { CallsMadeChart } from '../../components/admin/CallsMadeChart';
import { RecentLeadsTable } from '../../components/admin/RecentLeadsTable';

import { adminAnalytics } from '../../mock/adminAnalytics';

const timeRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7Days', label: 'Last 7 Days' },
  { value: 'last30Days', label: 'Last 30 Days' },
  { value: 'last2Months', label: 'Last 2 Months' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'last6Months', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
];

export const AdminDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('last30Days');
  
  const currentData = adminAnalytics[selectedTimeRange] || adminAnalytics['last30Days'];
  const selectedLabel = timeRangeOptions.find(o => o.value === selectedTimeRange)?.label || 'Last 30 Days';

  return (
    <div className="space-y-6 pb-16 w-full max-w-[1600px] mx-auto">
      {/* ── Header ── */}
      <motion.div
        variants={animations.slideUp}
        initial="initial"
        animate="animate"
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-dashboard-title">Executive Dashboard</h1>
          <p className="text-body text-muted-foreground mt-1">
            Showing analytics for <span className="font-semibold text-foreground">{selectedLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Select value={selectedTimeRange} onValueChange={(val) => val && setSelectedTimeRange(val)}>
            <SelectTrigger className="w-[180px] h-10 bg-card border-border shadow-sm text-[14px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value="custom" disabled>
                Custom Range <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-semibold tracking-wider">Coming Soon</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* ── Section 1: Executive KPI Cards ── */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedTimeRange + '-kpi'}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {[
            {
              title: 'Total Leads',
              value: currentData.stats.totalLeads.value,
              icon: Users,
              trend: { value: currentData.stats.totalLeads.percentage, isPositive: currentData.stats.totalLeads.trend === 'up' },
              subtitle: currentData.stats.totalLeads.subtitle,
              sparklineData: currentData.stats.totalLeads.sparkline,
            },
            {
              title: 'Total Calls Made',
              value: currentData.stats.totalCalls.value,
              icon: PhoneCall,
              trend: { value: currentData.stats.totalCalls.percentage, isPositive: currentData.stats.totalCalls.trend === 'up' },
              subtitle: currentData.stats.totalCalls.subtitle,
              sparklineData: currentData.stats.totalCalls.sparkline,
            },
            {
              title: 'Converted Clients',
              value: Math.round((parseInt(currentData.stats.totalLeads.value.replace(/,/g, '')) * parseFloat(currentData.stats.conversionRate.value)) / 100).toLocaleString(),
              icon: TrendingUp,
              trend: { value: currentData.stats.conversionRate.percentage, isPositive: currentData.stats.conversionRate.trend === 'up' },
              subtitle: `${currentData.stats.conversionRate.value} Conversion Rate`,
              sparklineData: currentData.stats.conversionRate.sparkline,
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              variants={animations.slideUp}
              initial="initial"
              animate="animate"
              transition={{ delay: i * 0.05 }}
            >
              <ExecutiveKPICard
                title={card.title}
                value={card.value}
                icon={card.icon}
                trend={card.trend}
                subtitle={card.subtitle}
                sparklineData={card.sparklineData}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Section 2: Charts ── */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedTimeRange + '-charts'}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-5"
        >
          <ClientConversionTrendChart data={currentData.conversionData} />
          <CallsMadeChart data={currentData.callsData} />
        </motion.div>
      </AnimatePresence>

      {/* ── Section 3: Recent Leads Table ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTimeRange + '-table'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <RecentLeadsTable leads={currentData.recentLeads} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
