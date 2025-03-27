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
  return <div className={cn("flex items-center justify-between px-4 h-[50px] border-b border-outline-primary", className)}>
      <div className="flex items-center gap-2">
        <Badge variant="flight" className="bg-primary-200 text-text-icon-01 rounded-[10px] py-1 px-3 text-xs font-medium">
          {flightMode}
        </Badge>
        
      </div>
      <div className="bg-background-level-3 px-3 py-1 rounded-md">
        <span className="text-text-icon-01 fb-body2-regular">{timestamp}</span>
      </div>
    </div>;
};
export default DetailsPanelHeader;