
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TelemetryMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const TelemetryMetricCard: React.FC<TelemetryMetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  className
}) => {
  const renderTrendIndicator = () => {
    if (!trend) return null;
    
    return trend === 'up' ? (
      <ArrowUp className="w-3 h-3 text-success-200" />
    ) : trend === 'down' ? (
      <ArrowDown className="w-3 h-3 text-caution-200" />
    ) : null;
  };

  return (
    <div className={cn("bg-background-level-1 p-2 rounded border border-outline-primary hover:border-primary-100 transition-colors", className)}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-icon-02">{label}</span>
          {renderTrendIndicator()}
        </div>
        <div className="flex items-baseline">
          <span className="text-lg text-text-icon-01 font-medium">{value}</span>
          {unit && <span className="text-sm ml-1 text-text-icon-02">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default TelemetryMetricCard;
