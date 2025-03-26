
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DetailsPanelHeaderProps {
  flightId: string;
  flightMode: string;
  timestamp: string;
}

const DetailsPanelHeader: React.FC<DetailsPanelHeaderProps> = ({
  flightId,
  flightMode,
  timestamp
}) => {
  return (
    <div className="flex items-center justify-between px-4 h-[50px] border-b border-outline-primary">
      <div className="flex items-center gap-2">
        <Badge 
          variant="flight"
          className="bg-primary-200 text-text-icon-01 rounded-[10px] py-1 px-3 text-xs font-medium"
        >
          {flightMode}
        </Badge>
        <span className="text-text-icon-02 fb-body1-medium">{flightId}</span>
      </div>
      <div className="bg-background-level-3 px-3 py-1 rounded-md">
        <span className="text-text-icon-01 fb-body2-regular">{timestamp}</span>
      </div>
    </div>
  );
};

export default DetailsPanelHeader;
