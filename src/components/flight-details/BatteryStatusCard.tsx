
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Battery, BatteryCharging, BatteryWarning, BatteryLow, BatteryMedium, BatteryFull, Thermometer, Zap } from 'lucide-react';
import { BatteryStatusCardProps } from './types/telemetryTypes';

const BatteryStatusCard: React.FC<BatteryStatusCardProps> = ({
  percentage,
  estimatedRemaining,
  temperature,
  voltage,
  dischargeRate,
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
  
  // Get temperature color
  const getTempColor = (temp: number) => {
    if (temp >= 40) return "text-error-200";
    if (temp >= 35) return "text-caution-200";
    return "text-text-icon-02";
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
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="text-text-icon-02">Est. Remaining: {estimatedRemaining}</span>
        <div className="flex items-center gap-1">
          <Thermometer className="w-3.5 h-3.5" />
          <span className={getTempColor(temperature)}>{temperature}°C</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-text-icon-02" />
          <span className="text-text-icon-02">{voltage}V</span>
        </div>
        {dischargeRate && (
          <span className="text-text-icon-02">{dischargeRate}A</span>
        )}
      </div>
    </div>
  );
};

export default BatteryStatusCard;
