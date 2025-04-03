
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DetailsPanelHeaderProps {
  flightId: string;
  flightMode: string;
  timestamp: string;
  className?: string;
}

const DetailsPanelHeader: React.FC<DetailsPanelHeaderProps> = ({
  flightId,
  flightMode,
  timestamp,
  className
}) => {
  // Map the flightMode to appropriate display labels
  const getFlightModeLabel = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'mission':
        return 'Mission';
      case 'manual':
        return 'Manual';
      case 'gtt':
        return 'GTT';
      case 'rtds':
        return 'RTDS';
      case 'takeoff':
        return 'Takeoff';
      default:
        return mode;
    }
  };
  
  return <div className={cn("flex items-center justify-between px-4 h-[50px] border-b border-outline-primary", className)}>
      <div className="flex items-center gap-2">
        <Badge variant="flight" className="bg-primary-200 text-text-icon-01 rounded-[10px] py-1 px-3 text-xs font-medium">
          {getFlightModeLabel(flightMode)}
        </Badge>
      </div>
    </div>;
};

export default DetailsPanelHeader;
