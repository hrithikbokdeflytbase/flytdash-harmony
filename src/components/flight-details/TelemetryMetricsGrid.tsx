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
  return <div className="px-4 py-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <div className="relative">
            <TelemetryMetricCard label={`Altitude (${altitude.mode})`} value={altitude.value} unit={altitude.unit} />
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={navigatePrevMode}>
                <ArrowLeft className="h-3.5 w-3.5 text-text-icon-02" />
              </Button>
            </div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={navigateNextMode}>
                <ArrowRight className="h-3.5 w-3.5 text-text-icon-02" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center text-xs mt-1">
            
          </div>
        </div>
        <TelemetryMetricCard label="Distance from Home" value={distance.value} unit={distance.unit} />
        <TelemetryMetricCard label="Vertical Speed" value={verticalSpeed.value} unit={verticalSpeed.unit} showTrend={true} />
        <TelemetryMetricCard label="Horizontal Speed" value={horizontalSpeed.value} unit={horizontalSpeed.unit} showTrend={true} />
      </div>
    </div>;
};
export default TelemetryMetricsGrid;