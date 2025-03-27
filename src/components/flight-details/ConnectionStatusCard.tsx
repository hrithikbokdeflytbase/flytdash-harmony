
import React from 'react';
import { cn } from '@/lib/utils';
import { Wifi } from 'lucide-react';

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
      bg: 'bg-success-200 bg-opacity-10',
      border: 'border-success-200',
      text: 'text-success-200',
      dot: 'bg-success-200'
    },
    inactive: {
      bg: 'bg-text-icon-02 bg-opacity-10',
      border: 'border-text-icon-02 border-opacity-30',
      text: 'text-text-icon-02',
      dot: 'bg-text-icon-02'
    },
    poor: {
      bg: 'bg-caution-200 bg-opacity-10',
      border: 'border-caution-200',
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

  const renderStatusIndicator = () => (
    <div className={cn(
      'flex items-center text-[10px] px-200 py-[2px] rounded-full',
      statusConfig[status].bg,
      'border',
      statusConfig[status].border
    )}>
      <div className={cn('w-[6px] h-[6px] rounded-full mr-[6px]', statusConfig[status].dot)} />
      <span className={statusConfig[status].text}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );

  return (
    <div className={cn("flex items-center justify-between p-2 border-b border-outline-primary last:border-b-0", className)}>
      <span className="text-xs text-text-icon-01">{label}</span>
      <div className="flex items-center gap-200">
        {renderNetworkBar()}
        {renderStatusIndicator()}
        {details && <span className="text-[10px] text-text-icon-02 ml-2">{details}</span>}
      </div>
    </div>
  );
};

export default ConnectionStatusCard;
