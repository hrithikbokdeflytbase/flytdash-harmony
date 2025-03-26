
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
    <div className={cn("space-y-2", className)}>
      <span className="text-xs text-text-icon-02 block">{label}</span>
      <span className="text-xl text-text-icon-01 font-medium">
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </span>
    </div>
  );
};

export default TelemetryMetricCard;
