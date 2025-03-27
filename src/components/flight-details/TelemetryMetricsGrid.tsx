
import React from 'react';
import TelemetryMetricCard from './TelemetryMetricCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TelemetryMetricsGridProps {
  altitude: {
    value: number;
    unit: string;
    mode: 'AGL' | 'ASL';
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
  onAltitudeModeToggle?: () => void;
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
          <div className="flex items-center justify-end text-xs space-x-1.5 mt-1">
            <Label htmlFor="altitude-mode" className="text-text-icon-02">AGL</Label>
            <Switch 
              id="altitude-mode" 
              checked={altitude.mode === 'ASL'}
              onCheckedChange={onAltitudeModeToggle}
              className="data-[state=checked]:bg-primary-100 h-4"
            />
            <Label htmlFor="altitude-mode" className="text-text-icon-02">ASL</Label>
          </div>
        </div>
        <TelemetryMetricCard 
          label="Distance" 
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
