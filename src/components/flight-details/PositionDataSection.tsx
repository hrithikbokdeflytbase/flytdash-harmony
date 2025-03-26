
import React from 'react';
import { Clock } from 'lucide-react';
import SectionHeader from './SectionHeader';
import TelemetryMetricCard from './TelemetryMetricCard';

interface PositionDataSectionProps {
  timeElapsed: string;
  timeRemaining: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const PositionDataSection: React.FC<PositionDataSectionProps> = ({
  timeElapsed,
  timeRemaining,
  coordinates
}) => {
  return (
    <>
      <SectionHeader title="Position Data" icon={Clock} />
      
      <div className="px-4 py-2">
        <div className="grid grid-cols-2 gap-2">
          <TelemetryMetricCard 
            label="Time Elapsed" 
            value={timeElapsed}
          />
          <TelemetryMetricCard 
            label="Time Remaining" 
            value={timeRemaining}
          />
          <TelemetryMetricCard 
            label="Latitude" 
            value={coordinates.latitude.toFixed(5)}
          />
          <TelemetryMetricCard 
            label="Longitude" 
            value={coordinates.longitude.toFixed(5)}
          />
        </div>
      </div>
    </>
  );
};

export default PositionDataSection;
