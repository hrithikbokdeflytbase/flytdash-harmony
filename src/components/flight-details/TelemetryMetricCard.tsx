
import React from 'react';
import { cn } from '@/lib/utils';

interface TelemetryMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

const TelemetryMetricCard: React.FC<TelemetryMetricCardProps> = ({
  label,
  value,
  unit,
  className
}) => {
  return (
    <div className={cn("bg-background-level-3 p-3 rounded-md", className)}>
      <div className="space-y-1">
        <span className="text-xs text-text-icon-02 block">{label}</span>
        <span className="text-xl text-text-icon-01 font-medium">
          {value}
          {unit && <span className="text-lg ml-1">{unit}</span>}
        </span>
      </div>
    </div>
  );
};

export default TelemetryMetricCard;
