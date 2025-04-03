
import React from 'react';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompassHeadingCardProps } from './types/telemetryTypes';

const CompassHeadingCard: React.FC<CompassHeadingCardProps> = ({
  heading,
  className
}) => {
  return (
    <div className={cn("bg-background-level-1 p-2 rounded-md border border-outline-primary", className)}>
      <div className="flex flex-col">
        <div className="mb-1">
          <span className="text-xs text-text-icon-02">Heading</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-lg text-text-icon-01 font-medium">{heading.value}°</span>
            <span className="text-sm ml-1 text-text-icon-02">{heading.direction}</span>
          </div>
          <div className="relative h-[22px] w-[22px]">
            <Compass className="w-5 h-5 text-text-icon-02" />
            <div 
              className="absolute top-[50%] left-[50%] w-3 h-[1px] bg-primary-200 origin-center"
              style={{ transform: `translate(-50%, -50%) rotate(${heading.value}deg)` }}
            >
              <div className="w-1 h-1 bg-primary-200 rounded-full absolute top-[50%] right-0 transform translate-y-[-50%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompassHeadingCard;
