
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
      bg: 'bg-success-200 bg-opacity-20',
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
      bg: 'bg-caution-200 bg-opacity-20',
      border: 'border-caution-200 border-opacity-30',
      text: 'text-caution-200',
      dot: 'bg-caution-200'
    }
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
    <div className={cn("bg-background-level-3 rounded-[4px] p-3 flex items-center justify-between border border-outline-primary", className)}>
      <span className="text-xs text-text-icon-01">{label}</span>
      <div className="flex items-center gap-200">
        {renderStatusIndicator()}
        {details && <span className="text-[10px] text-text-icon-02 ml-2">{details}</span>}
      </div>
    </div>
  );
};

export default ConnectionStatusCard;
