
import React from 'react';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
  className?: string;
}

const QuickStats = ({ className }: QuickStatsProps) => {
  return (
    <div className={cn("flybase-card overflow-hidden", className)}>
      <div className="p-400 border-b border-outline-primary">
        <h3 className="fb-title1-medium text-text-icon-01">Operation Progress</h3>
      </div>
      
      <div className="p-400">
        <div className="flex justify-between items-center mb-200">
          <span className="fb-body2-regular text-text-icon-02">Scans Completed</span>
          <span className="fb-body1-medium text-text-icon-01">24/30</span>
        </div>
        <div className="w-full h-2 bg-background-level-3 rounded-full overflow-hidden mb-400">
          <div 
            className="h-full bg-primary-200 rounded-full transition-all duration-500"
            style={{ width: '80%' }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mb-200">
          <span className="fb-body2-regular text-text-icon-02">Data Processing</span>
          <span className="fb-body1-medium text-text-icon-01">65%</span>
        </div>
        <div className="w-full h-2 bg-background-level-3 rounded-full overflow-hidden mb-400">
          <div 
            className="h-full bg-info-200 rounded-full transition-all duration-500"
            style={{ width: '65%' }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mb-200">
          <span className="fb-body2-regular text-text-icon-02">Reporting</span>
          <span className="fb-body1-medium text-text-icon-01">40%</span>
        </div>
        <div className="w-full h-2 bg-background-level-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-warning-200 rounded-full transition-all duration-500"
            style={{ width: '40%' }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 border-t border-outline-primary">
        <div className="p-400 border-r border-outline-primary">
          <p className="fb-body4-medium text-text-icon-02">Flight Time</p>
          <p className="fb-title2-medium text-text-icon-01">3.5 hrs</p>
        </div>
        <div className="p-400 border-r border-outline-primary">
          <p className="fb-body4-medium text-text-icon-02">Area Coverage</p>
          <p className="fb-title2-medium text-text-icon-01">125 acres</p>
        </div>
        <div className="p-400">
          <p className="fb-body4-medium text-text-icon-02">Battery Used</p>
          <p className="fb-title2-medium text-text-icon-01">4 units</p>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
