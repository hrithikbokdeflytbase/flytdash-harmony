
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Battery, BatteryCharging, BatteryWarning, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';

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

  // Get appropriate battery icon
  const getBatteryIcon = (percent: number) => {
    if (percent <= 20) return <BatteryLow className="w-5 h-5 text-error-200" />;
    if (percent <= 40) return <BatteryWarning className="w-5 h-5 text-caution-200" />;
    if (percent <= 70) return <BatteryMedium className="w-5 h-5 text-text-icon-01" />;
    return <BatteryFull className="w-5 h-5 text-success-200" />;
  };

  return (
    <div className={cn("bg-background-level-1 p-3 rounded border border-outline-primary", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getBatteryIcon(percentage)}
          <span className="text-sm text-text-icon-01 font-medium">Battery</span>
        </div>
        <span className="text-xl font-bold text-text-icon-01">{percentage}%</span>
      </div>
      <Progress 
        value={percentage} 
        className="h-[5px] bg-background-level-3 rounded-full mb-2"
        indicatorClassName={getProgressColor(percentage)}
      />
      <div className="flex justify-end">
        <span className="text-xs text-text-icon-02">Est. Remaining: {estimatedRemaining}</span>
      </div>
    </div>
  );
};

export default BatteryStatusCard;
