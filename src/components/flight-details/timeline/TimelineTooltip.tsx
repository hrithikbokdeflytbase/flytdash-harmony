
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomTooltipProps {
  active: boolean;
  payload: any[];
  label: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isCurrentPeriod = payload[0]?.payload?.isCurrent;
    const isFuturePeriod = payload[0]?.payload?.isFuture;
    
    if (isFuturePeriod) {
      return (
        <div className="flybase-card p-300 border shadow-lg rounded-lg border-outline-primary bg-background-level-2/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-100">
            <span className="inline-block w-2 h-2 rounded-full bg-text-icon-02/50"></span>
            <p className="fb-body1-medium text-text-icon-01">
              {label}
            </p>
          </div>
          <div className="flex items-center gap-2 pb-100 mb-100 border-b border-outline-primary/50">
            <span className="text-xs py-1 px-2 bg-background-level-3 rounded-full text-text-icon-02 font-medium">FUTURE</span>
          </div>
          <p className="fb-body2-regular text-text-icon-02">
            No flight data available yet
          </p>
        </div>
      );
    }
    
    return (
      <div className={cn(
        "flybase-card p-300 border shadow-lg rounded-lg", 
        isCurrentPeriod 
          ? "border-primary-100 bg-background-level-2/90 backdrop-blur-sm" 
          : "border-outline-primary bg-background-level-2/80"
      )}>
        <p className={cn(
          "fb-body1-medium mb-100", 
          isCurrentPeriod ? "text-primary-100" : "text-text-icon-01"
        )}>
          {isCurrentPeriod && "● "}{label}{isCurrentPeriod ? " (Current)" : ""}
        </p>
        {payload.map((entry: any, index: number) => (
          <p 
            key={`item-${index}`} 
            className="fb-body2-regular flex justify-between items-center gap-300" 
          >
            <span className="flex items-center gap-100">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const CustomCursor: React.FC<any> = ({ x, y, width, height, payload }) => {
  const isCurrentPeriod = payload && payload[0]?.payload?.isCurrent;
  const isFuturePeriod = payload && payload[0]?.payload?.isFuture;
  
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={
        isFuturePeriod 
          ? "rgba(255, 255, 255, 0.05)" 
          : isCurrentPeriod 
            ? "rgba(155, 135, 245, 0.2)" 
            : "rgba(73, 109, 200, 0.15)"
      }
      fillOpacity={0.4}
      stroke={
        isFuturePeriod 
          ? "rgba(255, 255, 255, 0.2)" 
          : isCurrentPeriod 
            ? "#9b87f5" 
            : "none"
      }
      strokeWidth={1}
      strokeDasharray={isFuturePeriod ? "3 3" : "none"}
      style={{ pointerEvents: 'none' }}
    />
  );
};
