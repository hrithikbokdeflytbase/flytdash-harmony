import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import our components
import TelemetryMetricCard from './TelemetryMetricCard';
import ConnectionStatusCard from './ConnectionStatusCard';
import BatteryStatusCard from './BatteryStatusCard';
import SectionHeader from './SectionHeader';

// Define interface for telemetry data to use across tabs
interface TelemetryData {
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
  timeElapsed: string;
  timeRemaining: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  gpsStatus: {
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
    cellular: {
      status: 'active' | 'inactive' | 'poor';
      details: string;
    };
  }
}

interface FlightDetailsPanelProps {
  flightId: string;
  flightMode: string;
  timestamp: string;
}

const FlightDetailsPanel: React.FC<FlightDetailsPanelProps> = ({
  flightId,
  flightMode,
  timestamp,
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
    timeElapsed: "00:08:45",
    timeRemaining: "00:18:15",
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
    <Card className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 h-[50px] border-b border-outline-primary">
        <div className="flex items-center gap-2">
          <Badge 
            variant="flight"
            className="bg-primary-200 text-text-icon-01 rounded-[10px] py-1 px-3 text-xs font-medium"
          >
            {flightMode}
          </Badge>
          <span className="text-text-icon-02 fb-body1-medium">{flightId}</span>
        </div>
        <div className="bg-background-level-3 px-3 py-1 rounded-md">
          <span className="text-text-icon-01 fb-body2-regular">{timestamp}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="h-[45px] border-b border-outline-primary">
        <Tabs 
          defaultValue="telemetry" 
          className="w-full" 
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="flex w-full h-[45px] bg-transparent">
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

          {/* Tab Contents */}
          <TabsContent value="telemetry" className="p-0 h-[calc(100vh-95px)] flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="space-y-0 pb-6">
                {/* Telemetry Header */}
                <SectionHeader title="Drone Telemetry">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-success-200"></div>
                    <span className="text-xs text-text-icon-01">GPS {telemetryData.gpsStatus.count}</span>
                  </div>
                </SectionHeader>
                
                {/* Battery Section */}
                <div className="px-4 py-3">
                  <div className="bg-background-level-3 p-3 rounded-md">
                    <BatteryStatusCard 
                      percentage={telemetryData.battery.percentage}
                      estimatedRemaining={telemetryData.battery.estimatedRemaining}
                    />
                  </div>
                </div>
                
                {/* Telemetry Metrics Grid */}
                <div className="px-4 py-2">
                  <div className="grid grid-cols-2 gap-3">
                    <TelemetryMetricCard 
                      label="Altitude" 
                      value={telemetryData.altitude.value} 
                      unit={telemetryData.altitude.unit}
                    />
                    <TelemetryMetricCard 
                      label="Distance from Home" 
                      value={telemetryData.distance.value} 
                      unit={telemetryData.distance.unit}
                    />
                    <TelemetryMetricCard 
                      label="Vertical Speed" 
                      value={telemetryData.verticalSpeed.value} 
                      unit={telemetryData.verticalSpeed.unit}
                    />
                    <TelemetryMetricCard 
                      label="Horizontal Speed" 
                      value={telemetryData.horizontalSpeed.value} 
                      unit={telemetryData.horizontalSpeed.unit}
                    />
                    <TelemetryMetricCard 
                      label="Time Elapsed" 
                      value={telemetryData.timeElapsed}
                    />
                    <TelemetryMetricCard 
                      label="Time Remaining" 
                      value={telemetryData.timeRemaining}
                    />
                    <TelemetryMetricCard 
                      label="Latitude" 
                      value={telemetryData.coordinates.latitude.toFixed(5)}
                    />
                    <TelemetryMetricCard 
                      label="Longitude" 
                      value={telemetryData.coordinates.longitude.toFixed(5)}
                    />
                  </div>
                </div>
                
                {/* Network Section */}
                <div className="px-4 pb-4 pt-2">
                  <SectionHeader title="Network" icon={Wifi} />
                  
                  <div className="space-y-3 mt-2">
                    <ConnectionStatusCard 
                      label="Dock Drone RF Link"
                      status={telemetryData.connections.rfLink.status}
                      details={telemetryData.connections.rfLink.details}
                    />
                    
                    <ConnectionStatusCard 
                      label="Dock Ethernet"
                      status={telemetryData.connections.ethernet.status}
                      details={telemetryData.connections.ethernet.details}
                    />
                    
                    <ConnectionStatusCard 
                      label="Dock 4G"
                      status={telemetryData.connections.cellular.status}
                      details={telemetryData.connections.cellular.details}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="timeline" className="p-0">
            {/* Timeline placeholder */}
            <div className="flex flex-col items-center justify-center space-y-4 h-[400px] text-center p-4 text-text-icon-02 border border-dashed border-outline-primary mx-4 my-4 rounded-md">
              <Clock size={48} className="text-primary-200 opacity-50" />
              <div className="space-y-2">
                <h3 className="text-lg text-text-icon-01">Timeline View</h3>
                <p className="text-sm">Flight timeline details will be implemented in the next step.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default FlightDetailsPanel;
