
import React from 'react';
import { MapPin } from 'lucide-react';
import SectionHeader from './SectionHeader';
import TelemetryMetricCard from './TelemetryMetricCard';

interface PositionDataSectionProps {
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const PositionDataSection: React.FC<PositionDataSectionProps> = ({
  coordinates
}) => {
  return (
    <div className="flex flex-col mb-400">
      <SectionHeader title="Position Data" icon={MapPin} />
      
      <div className="px-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <TelemetryMetricCard 
            label="Latitude" 
            value={coordinates.latitude.toFixed(5)}
            className="rounded-md"
          />
          <TelemetryMetricCard 
            label="Longitude" 
            value={coordinates.longitude.toFixed(5)}
            className="rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default PositionDataSection;
