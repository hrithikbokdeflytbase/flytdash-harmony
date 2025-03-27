
import React from 'react';
import TelemetryMetricCard from './TelemetryMetricCard';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <TelemetryMetricCard 
            label={`Altitude (${altitude.mode})`}
            value={altitude.value} 
            unit={altitude.unit}
            className="mb-1"
          />
          <div className="flex items-center justify-center text-xs space-x-1.5 mt-1">
            <RadioGroup 
              value={altitude.mode} 
              onValueChange={(value) => onAltitudeModeToggle?.(value as 'AGL' | 'ASL' | 'RLT')}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="AGL" id="altitude-agl" className="w-3 h-3" />
                <Label htmlFor="altitude-agl" className="text-text-icon-02 text-xs">AGL</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="ASL" id="altitude-asl" className="w-3 h-3" />
                <Label htmlFor="altitude-asl" className="text-text-icon-02 text-xs">ASL</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="RLT" id="altitude-rlt" className="w-3 h-3" />
                <Label htmlFor="altitude-rlt" className="text-text-icon-02 text-xs">RLT</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <TelemetryMetricCard 
          label="Distance from Home" 
          value={distance.value} 
          unit={distance.unit}
        />
        <TelemetryMetricCard 
          label="Vertical Speed" 
          value={verticalSpeed.value} 
          unit={verticalSpeed.unit}
          showTrend={true}
        />
        <TelemetryMetricCard 
          label="Horizontal Speed" 
          value={horizontalSpeed.value} 
          unit={horizontalSpeed.unit}
          showTrend={true}
        />
      </div>
    </div>
  );
};

export default TelemetryMetricsGrid;
