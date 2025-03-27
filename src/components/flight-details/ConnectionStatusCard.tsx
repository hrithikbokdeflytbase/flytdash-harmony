
import React from 'react';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'active' | 'inactive' | 'poor';

interface ConnectionStatusCardProps {
  label: string;
  status: ConnectionStatus;
  details?: string;
  className?: string;
}

const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({
  label,
  status,
  details,
  className
}) => {
  // Status styling configurations
  const statusConfig = {
    active: {
      bg: 'bg-success-200/10',
      text: 'text-success-200',
      dot: 'bg-success-200'
    },
    inactive: {
      bg: 'bg-text-icon-03/10',
      text: 'text-text-icon-03',
      dot: 'bg-text-icon-03'
    },
    poor: {
      bg: 'bg-caution-200/10',
      text: 'text-caution-200',
      dot: 'bg-caution-200'
    }
  };

  // NetworkBar style display for connection health
  const renderNetworkBar = () => {
    const barClasses = {
      active: 'bg-success-200',
      poor: 'bg-caution-200',
      inactive: 'bg-text-icon-03'
    };

    // Generate bars with appropriate styling
    return (
      <div className="flex gap-0.5 h-[6px] items-end">
        <div className={cn("w-[3px] h-full rounded-sm", barClasses[status])} />
        <div className={cn("w-[3px] h-[60%] rounded-sm", 
          status === 'inactive' ? 'bg-text-icon-03' : 
          (status === 'poor' ? 'bg-caution-200' : 'bg-success-200'))} />
        <div className={cn("w-[3px] h-[40%] rounded-sm", 
          status === 'active' ? 'bg-success-200' : 'bg-text-icon-03')} />
      </div>
    );
  };

  return (
    <div className={cn("flex items-center justify-between py-2.5 px-3 border-b border-outline-primary last:border-b-0", className)}>
      <div className="flex items-center gap-2">
        <div className={cn('h-2 w-2 rounded-full', statusConfig[status].dot)} />
        <span className="text-xs text-text-icon-01 font-medium">{label}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {renderNetworkBar()}
        {details && (
          <span className="text-xs text-text-icon-02">{details}</span>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusCard;
