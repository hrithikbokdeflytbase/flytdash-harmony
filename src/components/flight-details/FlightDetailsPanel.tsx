
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Import our components
import DetailsPanelHeader from './DetailsPanelHeader';
import TelemetryPanel, { TelemetryData } from './TelemetryPanel';
import TimelinePanel from './TimelinePanel';

interface FlightDetailsPanelProps {
  flightId: string;
  flightMode: string;
  timestamp: string;
  className?: string;
}

const FlightDetailsPanel: React.FC<FlightDetailsPanelProps> = ({
  flightId,
  flightMode,
  timestamp,
  className
}) => {
  // State for active tab (handled by Radix UI Tabs)
  const [activeTab, setActiveTab] = useState("telemetry");
  
  // Mock telemetry data (in a real app, this would come from props or API)
  const [telemetryData, setTelemetryData] = useState<TelemetryData>({
    battery: {
      percentage: 91,
      estimatedRemaining: "27 minutes"
    },
    altitude: {
      value: 42.5,
      unit: "m"
    },
    distance: {
      value: 168,
      unit: "m"
    },
    horizontalSpeed: {
      value: 5.2,
      unit: "m/s"
    },
    verticalSpeed: {
      value: 1.5,
      unit: "m/s"
    },
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    gpsStatus: {
      count: 12,
      signal: "Good"
    },
    connections: {
      rfLink: {
        status: 'active',
        details: '2.4 GHz'
      },
      ethernet: {
        status: 'active',
        details: '7.22 MB/s'
      },
      cellular: {
        status: 'poor',
        details: '4G'
      }
    }
  });
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header Section */}
      <DetailsPanelHeader 
        flightId={flightId} 
        flightMode={flightMode} 
        timestamp={timestamp} 
      />

      {/* Tab Navigation */}
      <div className="border-b border-outline-primary">
        <Tabs 
          defaultValue="telemetry" 
          className="w-full" 
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="flex w-full h-[40px] bg-transparent">
            <TabsTrigger 
              value="telemetry" 
              className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Telemetry
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents - Calculated height based on the header (50px) and tabs (40px) height */}
          <div className="flex-1 overflow-hidden" style={{ height: "calc(100% - 90px)" }}>
            <TabsContent value="telemetry" className="h-full p-0 m-0 overflow-hidden">
              <TelemetryPanel telemetryData={telemetryData} />
            </TabsContent>
            
            <TabsContent value="timeline" className="h-full p-0 m-0 overflow-hidden">
              <TimelinePanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
};

export default FlightDetailsPanel;
