
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { FlightTrend } from './DashboardTypes';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: FlightTrend;
  className?: string;
}

const StatusCard = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary-100",
  iconBgColor = "bg-primary-100/10",
  trend,
  className
}: StatusCardProps) => {
  return (
    <div 
      className={cn(
        "flybase-card p-400 transition-all duration-300 animate-fade-in",
        "hover:translate-y-[-2px]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="fb-body1-medium text-text-icon-02">{title}</h3>
          <p className="fb-title1-semi text-text-icon-01 mt-100">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-200">
              <span 
                className={cn(
                  "flex items-center fb-body5-regular",
                  trend.isPositive ? "text-success-200" : "text-error-200"
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-200 fb-body5-regular text-text-icon-02">
                {trend.comparisonPeriod || 'from last period'}
              </span>
            </div>
          )}
        </div>
        
        <div className={cn("p-200 rounded-full", iconBgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
