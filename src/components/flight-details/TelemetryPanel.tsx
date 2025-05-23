import React, { useState } from 'react';
import { Activity, Clock, Wifi, Thermometer, Wind, Compass, Home, Gauge, Signal, Video, Cpu, Eye, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import our components
import TelemetryMetricCard from './TelemetryMetricCard';
import ConnectionStatusCard from './ConnectionStatusCard';
import BatteryStatusCard from './BatteryStatusCard';
import SectionHeader from './SectionHeader';
import TelemetryMetricsGrid from './TelemetryMetricsGrid';
import NetworkStatusSection from './NetworkStatusSection';
import PositionDataSection from './PositionDataSection';
import SystemStatusSection from './SystemStatusSection';
import CompassHeadingCard from './CompassHeadingCard';
import ControlSection, { ControlHistory } from './ControlSection';

// Import types
import { TelemetryData } from './types/telemetryTypes';

interface TelemetryPanelProps {
  telemetryData: TelemetryData;
  timestamp: string; // Added timestamp prop
  controlHistory: ControlHistory; // Added controlHistory prop
  className?: string;
}

const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  telemetryData,
  timestamp,
  controlHistory,
  className
}) => {
  const [altitudeMode, setAltitudeMode] = useState<'AGL' | 'ASL' | 'RLT'>(telemetryData.altitude.mode);
  
  const handleAltitudeModeToggle = (mode: 'AGL' | 'ASL' | 'RLT') => {
    setAltitudeMode(mode);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Make everything scrollable */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full pr-1" type="hover">
          <div className="space-y-0 pb-6 relative">
            {/* Control Section - Added above Battery */}
            <SectionHeader title="Control" icon={Users}>
              <div className="flex items-center gap-1">
                <span className="text-xs text-text-icon-01">{timestamp}</span>
              </div>
            </SectionHeader>
            
            <ControlSection 
              currentTimestamp={timestamp}
              controlHistory={controlHistory}
              showAllControllers={false} // Only show current controller without +X notation
            />
            
            {/* Battery Section */}
            <div className="px-4 py-3">
              <BatteryStatusCard 
                percentage={telemetryData.battery.percentage}
                estimatedRemaining={telemetryData.battery.estimatedRemaining}
                temperature={telemetryData.battery.temperature}
                voltage={telemetryData.battery.voltage}
                dischargeRate={telemetryData.battery.dischargeRate}
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
              altitude={{
                ...telemetryData.altitude,
                mode: altitudeMode
              }}
              distance={telemetryData.distance}
              verticalSpeed={telemetryData.verticalSpeed}
              horizontalSpeed={telemetryData.horizontalSpeed}
              onAltitudeModeToggle={handleAltitudeModeToggle}
            />
            
            {/* Heading (removed Distance to Home) */}
            <div className="px-4 py-2">
              <CompassHeadingCard 
                heading={telemetryData.heading}
              />
            </div>
            
            {/* Position Data Section */}
            <PositionDataSection 
              coordinates={telemetryData.coordinates}
            />
            
            {/* Environmental Data Section removed */}
            
            {/* System Status Section */}
            <SystemStatusSection 
              gpsStatus={telemetryData.gpsStatus}
              rtkStatus={telemetryData.rtkStatus}
              latency={telemetryData.latency}
              visionSystem={telemetryData.visionSystem}
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
