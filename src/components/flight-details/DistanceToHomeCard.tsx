
import React from 'react';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DistanceToHomeCardProps {
  distanceToHome: {
    value: number;
    unit: string;
    direction: string;
  };
  className?: string;
}

const DistanceToHomeCard: React.FC<DistanceToHomeCardProps> = ({
  distanceToHome,
  className
}) => {
  return (
    <div className={cn("bg-background-level-1 p-2 rounded-md border border-outline-primary", className)}>
      <div className="flex flex-col">
        <div className="mb-1">
          <span className="text-xs text-text-icon-02">Distance to Home</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-lg text-text-icon-01 font-medium">{distanceToHome.value}</span>
            <span className="text-sm ml-1 text-text-icon-02">{distanceToHome.unit}</span>
          </div>
          <div className="flex items-center gap-1">
            <Home className="w-4 h-4 text-text-icon-02" />
            <span className="text-sm font-medium text-text-icon-02">{distanceToHome.direction}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistanceToHomeCard;
