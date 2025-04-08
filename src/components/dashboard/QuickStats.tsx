
import React from 'react';
import { cn } from '@/lib/utils';
import { OperationProgress, FlightPerformanceData } from './DashboardTypes';

interface QuickStatsProps {
  className?: string;
  operationProgress?: OperationProgress;
  performanceData?: FlightPerformanceData;
}

const QuickStats = ({ 
  className,
  operationProgress = {
    scansCompleted: 24,
    totalScans: 30,
    dataProcessing: 65,
    reporting: 40
  },
  performanceData = {
    flightTime: 3.5,
    areaCoverage: 125,
    batteryUnits: 4,
    mediaCaptured: 58  // Added the missing mediaCaptured property
  }
}: QuickStatsProps) => {
  const scansPercentage = (operationProgress.scansCompleted / operationProgress.totalScans) * 100;
  
  return (
    <div className={cn("flybase-card overflow-hidden", className)}>
      <div className="p-400 border-b border-outline-primary">
        <h3 className="fb-title1-medium text-text-icon-01">Operation Progress</h3>
      </div>
      
      <div className="p-400">
        <div className="flex justify-between items-center mb-200">
          <span className="fb-body2-regular text-text-icon-02">Scans Completed</span>
          <span className="fb-body1-medium text-text-icon-01">
            {operationProgress.scansCompleted}/{operationProgress.totalScans}
          </span>
        </div>
        <div className="w-full h-2 bg-background-level-3 rounded-full overflow-hidden mb-400">
          <div 
            className="h-full bg-primary-200 rounded-full transition-all duration-500"
            style={{ width: `${scansPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mb-200">
          <span className="fb-body2-regular text-text-icon-02">Data Processing</span>
          <span className="fb-body1-medium text-text-icon-01">{operationProgress.dataProcessing}%</span>
        </div>
        <div className="w-full h-2 bg-background-level-3 rounded-full overflow-hidden mb-400">
          <div 
            className="h-full bg-info-200 rounded-full transition-all duration-500"
            style={{ width: `${operationProgress.dataProcessing}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mb-200">
          <span className="fb-body2-regular text-text-icon-02">Reporting</span>
          <span className="fb-body1-medium text-text-icon-01">{operationProgress.reporting}%</span>
        </div>
        <div className="w-full h-2 bg-background-level-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-warning-200 rounded-full transition-all duration-500"
            style={{ width: `${operationProgress.reporting}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 border-t border-outline-primary">
        <div className="p-400 border-r border-outline-primary">
          <p className="fb-body4-medium text-text-icon-02">Flight Time</p>
          <p className="fb-title2-medium text-text-icon-01">{performanceData.flightTime} hrs</p>
        </div>
        <div className="p-400 border-r border-outline-primary">
          <p className="fb-body4-medium text-text-icon-02">Area Coverage</p>
          <p className="fb-title2-medium text-text-icon-01">{performanceData.areaCoverage} acres</p>
        </div>
        <div className="p-400">
          <p className="fb-body4-medium text-text-icon-02">Battery Used</p>
          <p className="fb-title2-medium text-text-icon-01">{performanceData.batteryUnits} units</p>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
