
import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TelemetryMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  showTrend?: boolean;
  trendDirection?: 'up' | 'down' | 'stable';
  className?: string;
}

const TelemetryMetricCard: React.FC<TelemetryMetricCardProps> = ({
  label,
  value,
  unit,
  showTrend = false,
  trendDirection = 'stable',
  className
}) => {
  // Generate a pseudo-random trend direction based on the value for demo purposes
  const getTrendDirection = (): 'up' | 'down' | 'stable' => {
    if (!showTrend) return 'stable';
    
    // For demo: generate trend based on value to ensure consistency
    const seed = typeof value === 'number' ? value : String(value).length;
    if (seed % 3 === 0) return 'up';
    if (seed % 3 === 1) return 'down';
    return 'stable';
  };
  
  const actualTrendDirection = trendDirection !== 'stable' ? trendDirection : getTrendDirection();
  
  const renderTrendIndicator = () => {
    if (!showTrend) return null;
    
    if (actualTrendDirection === 'up') {
      return <TrendingUp className="w-3.5 h-3.5 text-success-200" />;
    }
    
    if (actualTrendDirection === 'down') {
      return <TrendingDown className="w-3.5 h-3.5 text-error-200" />;
    }
    
    return null;
  };

  return (
    <div className={cn(
      "bg-background-level-1 p-3 rounded-md border border-outline-primary hover:border-primary-100 transition-colors", 
      className
    )}>
      <div className="flex flex-col">
        <div className="mb-1">
          <span className="text-xs text-text-icon-02">{label}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline">
            <span className="text-lg text-text-icon-01 font-medium">{value}</span>
            {unit && <span className="text-sm ml-1 text-text-icon-02">{unit}</span>}
          </div>
          {renderTrendIndicator()}
        </div>
      </div>
    </div>
  );
};

export default TelemetryMetricCard;
