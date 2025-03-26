
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className={cn("bg-background-level-3 border-outline-primary", className)}>
      <CardContent className="p-3">
        <div className="space-y-1">
          <span className="text-xs text-text-icon-02 block">{label}</span>
          <span className="text-xl text-text-icon-01 font-medium">
            {value}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelemetryMetricCard;
