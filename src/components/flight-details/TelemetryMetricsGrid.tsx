
import React from 'react';
import TelemetryMetricCard from './TelemetryMetricCard';

interface TelemetryMetricsGridProps {
  altitude: {
    value: number;
    unit: string;
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
}

const TelemetryMetricsGrid: React.FC<TelemetryMetricsGridProps> = ({
  altitude,
  distance,
  verticalSpeed,
  horizontalSpeed
}) => {
  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-2 gap-2">
        <TelemetryMetricCard 
          label="Altitude" 
          value={altitude.value} 
          unit={altitude.unit}
        />
        <TelemetryMetricCard 
          label="Distance" 
          value={distance.value} 
          unit={distance.unit}
        />
        <TelemetryMetricCard 
          label="Vertical Speed" 
          value={verticalSpeed.value} 
          unit={verticalSpeed.unit}
        />
        <TelemetryMetricCard 
          label="Horizontal Speed" 
          value={horizontalSpeed.value} 
          unit={horizontalSpeed.unit}
        />
      </div>
    </div>
  );
};

export default TelemetryMetricsGrid;
