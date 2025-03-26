
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BatteryStatusCardProps {
  percentage: number;
  estimatedRemaining: string;
  className?: string;
}

const BatteryStatusCard: React.FC<BatteryStatusCardProps> = ({
  percentage,
  estimatedRemaining,
  className
}) => {
  // Determine color based on battery percentage
  const getProgressColor = (percent: number) => {
    if (percent <= 20) return "bg-error-200";
    if (percent <= 40) return "bg-caution-200";
    return "bg-success-200";
  };

  return (
    <div className={cn("bg-background-level-2 p-300 rounded-[4px]", className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-text-icon-02">Battery</span>
          <div className="flex items-baseline gap-200">
            <span className="text-2xl text-text-icon-01 font-medium">{percentage}%</span>
            <span className="text-[10px] text-text-icon-02">Est. Remaining: {estimatedRemaining}</span>
          </div>
        </div>
        <div className="w-[120px]">
          <Progress 
            value={percentage} 
            className="h-[8px] bg-background-level-1 rounded-full"
            indicatorClassName={getProgressColor(percentage)}
          />
        </div>
      </div>
    </div>
  );
};

export default BatteryStatusCard;
