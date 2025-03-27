
import React from 'react';
import TelemetryMetricCard from './TelemetryMetricCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TelemetryMetricsGridProps {
  altitude: {
    value: number;
    unit: string;
    mode: 'AGL' | 'ASL' | 'RLT';
  };
  distance: {
    value: number;
    unit: string;
  };
  verticalSpeed: {
    value: number;
    unit: string;
  };
  horizontalSpeed: {
    value: number;
    unit: string;
  };
  onAltitudeModeToggle?: (mode: 'AGL' | 'ASL' | 'RLT') => void;
}

const TelemetryMetricsGrid: React.FC<TelemetryMetricsGridProps> = ({
  altitude,
  distance,
  verticalSpeed,
  horizontalSpeed,
  onAltitudeModeToggle
}) => {
  // Array of available altitude modes for cycling
  const altitudeModes: ('AGL' | 'ASL' | 'RLT')[] = ['AGL', 'ASL', 'RLT'];

  // Find current mode index
  const currentModeIndex = altitudeModes.indexOf(altitude.mode);

  // Navigate to previous mode
  const navigatePrevMode = () => {
    const newIndex = (currentModeIndex - 1 + altitudeModes.length) % altitudeModes.length;
    onAltitudeModeToggle?.(altitudeModes[newIndex]);
  };

  // Navigate to next mode
  const navigateNextMode = () => {
    const newIndex = (currentModeIndex + 1) % altitudeModes.length;
    onAltitudeModeToggle?.(altitudeModes[newIndex]);
  };

  return (
    <div className="p-4">
      <h2 className="flex items-center text-sm font-medium text-text-icon-01 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
        Flight Metrics
        <div className="ml-auto flex items-center gap-1.5">
          <span className="flex items-center text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
            RTK 32
          </span>
        </div>
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <TelemetryMetricCard 
            label={`Altitude (${altitude.mode})`} 
            value={altitude.value} 
            unit={altitude.unit}
            className="h-full"
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-text-icon-02 hover:text-text-icon-01" 
              onClick={navigatePrevMode}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-text-icon-02 hover:text-text-icon-01" 
              onClick={navigateNextMode}
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <TelemetryMetricCard 
          label="Distance from Home" 
          value={distance.value} 
          unit={distance.unit}
          className="h-full"
        />
        
        <TelemetryMetricCard 
          label="Vertical Speed" 
          value={verticalSpeed.value} 
          unit={verticalSpeed.unit} 
          showTrend={true}
          className="h-full"
        />
        
        <TelemetryMetricCard 
          label="Horizontal Speed" 
          value={horizontalSpeed.value} 
          unit={horizontalSpeed.unit} 
          showTrend={true}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default TelemetryMetricsGrid;
