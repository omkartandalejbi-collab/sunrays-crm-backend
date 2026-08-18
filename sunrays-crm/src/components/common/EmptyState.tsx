import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { animations } from '../../lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className
}) => {
  return (
    <motion.div 
      className={cn("flex flex-col items-center justify-center p-8 text-center", className)}
      variants={animations.fadeIn}
      initial="initial"
      animate="animate"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full scale-150" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-primary/10">
          <Icon className="h-10 w-10" strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="mb-2 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mb-8 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} className="w-full sm:w-auto">
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button onClick={primaryAction.onClick} className="w-full sm:w-auto shadow-sm hover:shadow">
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};
