import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { SkeletonLoader } from './SkeletonLoader';
import { motion } from 'framer-motion';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number;
  headerAction?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  isLoading = false,
  isEmpty = false,
  height = 300,
  headerAction,
}) => {
  const [filter, setFilter] = useState('this-month');

  return (
    <Card className="border shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-5 pb-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {subtitle && <CardDescription className="mt-1.5">{subtitle}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {headerAction ? headerAction : (
              <>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="this-quarter">This Quarter</option>
                  <option value="this-year">This Year</option>
                </select>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col">
        {isLoading ? (
          <div style={{ height }} className="w-full flex items-center justify-center">
            <SkeletonLoader className="h-full w-full rounded-lg" />
          </div>
        ) : isEmpty ? (
          <div style={{ height }} className="w-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <Loader2 className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">No data available</p>
            <p className="text-xs opacity-70">Try changing your filters</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ height }} 
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
