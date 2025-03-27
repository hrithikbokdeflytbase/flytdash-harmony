
import React from 'react';
import { Activity, Clock, Wifi } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import our components
import TelemetryMetricCard from './TelemetryMetricCard';
import ConnectionStatusCard from './ConnectionStatusCard';
import BatteryStatusCard from './BatteryStatusCard';
import SectionHeader from './SectionHeader';
import TelemetryMetricsGrid from './TelemetryMetricsGrid';
import NetworkStatusSection from './NetworkStatusSection';
import PositionDataSection from './PositionDataSection';

// Define interface for telemetry data
export interface TelemetryData {
  battery: {
    percentage: number;
    estimatedRemaining: string;
  };
  altitude: {
    value: number;
    unit: string;
  };
  distance: {
    value: number;
    unit: string;
  };
  horizontalSpeed: {
    value: number;
    unit: string;
  };
  verticalSpeed: {
    value: number;
    unit: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  gpsStatus: {
    count: number;
    signal: string;
  };
  rtkStatus: {
    count: number;
    signal: string;
  };
  connections: {
    rfLink: {
      status: 'active' | 'inactive' | 'poor';
      details: string;
    };
    ethernet: {
      status: 'active' | 'inactive' | 'poor';
      details: string;
    };
    dockCellular: {
      status: 'active' | 'inactive' | 'poor';
      details: string;
    };
    droneCellular: {
      status: 'active' | 'inactive' | 'poor';
      details: string;
    };
  }
}

interface TelemetryPanelProps {
  telemetryData: TelemetryData;
  className?: string;
}

const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  telemetryData,
  className
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Make everything scrollable */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full pr-1" type="hover">
          <div className="space-y-0 pb-6 relative">
            {/* Battery Section - Now inside ScrollArea */}
            <div className="px-4 py-3">
              <BatteryStatusCard 
                percentage={telemetryData.battery.percentage}
                estimatedRemaining={telemetryData.battery.estimatedRemaining}
              />
            </div>
            
            {/* General Telemetry Section */}
            <SectionHeader title="Flight Metrics" icon={Activity}>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-success-200"></div>
                <span className="text-xs text-text-icon-01">RTK {telemetryData.rtkStatus.count}</span>
              </div>
            </SectionHeader>
            
            {/* Telemetry Metrics Grid */}
            <TelemetryMetricsGrid 
              altitude={telemetryData.altitude}
              distance={telemetryData.distance}
              verticalSpeed={telemetryData.verticalSpeed}
              horizontalSpeed={telemetryData.horizontalSpeed}
            />
            
            {/* Position Data Section */}
            <PositionDataSection 
              coordinates={telemetryData.coordinates}
            />
            
            {/* Network Section */}
            <NetworkStatusSection connections={telemetryData.connections} />
          </div>
        </ScrollArea>
        
        {/* Fade gradient at bottom to indicate scrolling */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background-level-2 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default TelemetryPanel;
