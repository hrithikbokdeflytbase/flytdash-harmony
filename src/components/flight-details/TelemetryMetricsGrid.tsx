
import React from 'react';
import TelemetryMetricCard from './TelemetryMetricCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TelemetryMetricsGridProps } from './types/telemetryTypes';

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
      <div className="grid grid-cols-2 gap-3">
        {/* Full-width altitude card with minimal design */}
        <div className="col-span-2 relative">
          <div className="bg-background-level-2 p-3 rounded-md border border-outline-primary h-full">
            <div className="flex flex-col">
              <div className="mb-1">
                <span className="text-xs text-text-icon-02">Altitude ({altitude.mode})</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline">
                  <span className="text-lg text-text-icon-01 font-medium">{altitude.value}</span>
                  <span className="text-sm ml-1 text-text-icon-02">{altitude.unit}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-text-icon-02 hover:text-text-icon-01 p-0" onClick={navigatePrevMode}>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-text-icon-02 hover:text-text-icon-01 p-0" onClick={navigateNextMode}>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex gap-3 text-xs">
                <span className={`${altitude.mode === 'AGL' ? 'text-blue-400' : 'text-text-icon-03'}`}>
                  AGL
                </span>
                <span className={`${altitude.mode === 'ASL' ? 'text-blue-400' : 'text-text-icon-03'}`}>
                  ASL
                </span>
                <span className={`${altitude.mode === 'RLT' ? 'text-blue-400' : 'text-text-icon-03'}`}>
                  RLT
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <TelemetryMetricCard label="Vertical Speed" value={verticalSpeed.value} unit={verticalSpeed.unit} showTrend={true} className="h-full" />
        
        <TelemetryMetricCard label="Horizontal Speed" value={horizontalSpeed.value} unit={horizontalSpeed.unit} showTrend={true} className="h-full" />
      </div>
    </div>
  );
};

export default TelemetryMetricsGrid;
