
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, Clock, LineChart, Camera, Info, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import our components
import DetailsPanelHeader from './DetailsPanelHeader';
import TelemetryPanel, { TelemetryData } from './TelemetryPanel';
import TimelinePanel from './TimelinePanel';
import TelemetryGraphsPanel from './TelemetryGraphsPanel';
import { MediaPanel } from './MediaPanel';
import { ControlHistory } from './ControlSection';

interface FlightDetailsPanelProps {
  flightId: string;
  flightMode: string;
  timestamp: string;
  className?: string;
  onEventSelect?: (eventId: string) => void;
  onTimelinePositionChange?: (timestamp: string) => void;
}

const FlightDetailsPanel: React.FC<FlightDetailsPanelProps> = ({
  flightId,
  flightMode,
  timestamp,
  className,
  onEventSelect,
  onTimelinePositionChange
}) => {
  // State for active tab (handled by Radix UI Tabs)
  const [activeTab, setActiveTab] = useState("details"); // Changed from "telemetry" to "details"
  
  // Mock telemetry data (in a real app, this would come from props or API)
  const [telemetryData, setTelemetryData] = useState<TelemetryData>({
    battery: {
      percentage: 91,
      estimatedRemaining: "27 minutes",
      temperature: 32,
      voltage: 15.2,
      dischargeRate: 4.7
    },
    altitude: {
      value: 42.5,
      unit: "m",
      mode: 'AGL'
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
    heading: {
      value: 180,
      direction: "S"
    },
    distanceToHome: {
      value: 320,
      unit: "m",
      direction: "NE"
    },
    environment: {
      wind: {
        speed: 5.2,
        unit: "m/s",
        direction: "SE"
      },
      temperature: 24,
      pressure: 1013.2,
      humidity: 65
    },
    gpsStatus: {
      count: 12,
      signal: "Good",
      quality: 'good'
    },
    rtkStatus: {
      count: 32,
      signal: "Strong",
      mode: 'Fixed'
    },
    latency: {
      video: 120,
      control: 85
    },
    visionSystem: {
      status: 'active',
      details: 'All sensors active'
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
      dockCellular: {
        status: 'poor',
        details: '4G'
      },
      droneCellular: {
        status: 'inactive',
        details: '4G'
      }
    }
  });
  
  // Mock control history data
  const [controlHistory, setControlHistory] = useState<ControlHistory>({
    payload: [
      { name: "John Doe", startTime: "00:00:00", endTime: "00:08:30" },
      { name: "Alice Smith", startTime: "00:08:30", endTime: "00:15:00" },
      { name: "Bob Johnson", startTime: "00:15:00", endTime: "00:25:30" }
    ],
    drone: [
      { name: "Jane Wilson", startTime: "00:00:00", endTime: "00:05:15" },
      { name: "Mike Brown", startTime: "00:05:15", endTime: "00:15:00" },
      { name: "Lisa Garcia", startTime: "00:15:00", endTime: "00:21:30" },
      { name: "Chris Evans", startTime: "00:18:45", endTime: "00:25:30" } // Overlapping with Lisa for demo
    ]
  });
  
  // Function to update network connection statuses based on business rules
  useEffect(() => {
    // Make a copy of the current telemetry data
    const updatedTelemetryData = { ...telemetryData };
    const connections = updatedTelemetryData.connections;
    
    // Apply business rules:
    // 1. When RF Link and Dock Ethernet are active, Dock 4G and Drone 4G are inactive
    if (connections.rfLink.status === 'active' && connections.ethernet.status === 'active') {
      connections.dockCellular.status = 'inactive';
      connections.droneCellular.status = 'inactive';
    }
    
    // 2. When Dock Ethernet is inactive, Dock 4G becomes active
    if (connections.ethernet.status === 'inactive') {
      connections.dockCellular.status = 'active';
    }
    
    // 3. When RF Link is inactive, Drone 4G becomes active
    if (connections.rfLink.status === 'inactive') {
      connections.droneCellular.status = 'active';
    }
    
    // Update state with the new connection statuses
    setTelemetryData(updatedTelemetryData);
  }, []);
  
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
      <div className="flex flex-col flex-1 overflow-hidden">
        <Tabs 
          defaultValue="details" 
          className="flex flex-col w-full h-full" 
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <div className="border-b border-outline-primary overflow-hidden">
            <ScrollArea className="w-full" type="scroll">
              <div className="w-max min-w-full flex">
                <TabsList className="w-full h-[40px] bg-transparent">
                  <TabsTrigger 
                    value="details" 
                    className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Details
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="graphs" 
                    className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
                  >
                    <div className="flex items-center gap-2">
                      <LineChart className="w-4 h-4" />
                      Graphs
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
                  <TabsTrigger 
                    value="media" 
                    className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
                  >
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Media
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
            </ScrollArea>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="details" className="h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="flex-1 overflow-hidden">
                <TelemetryPanel 
                  telemetryData={telemetryData} 
                  timestamp={timestamp}
                  controlHistory={controlHistory}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="graphs" className="h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="flex-1 overflow-hidden">
                <TelemetryGraphsPanel 
                  timestamp={timestamp}
                  telemetryData={telemetryData} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="flex-1 overflow-hidden">
                <TimelinePanel timelinePosition={timestamp} onEventSelect={onEventSelect} />
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="flex-1 overflow-hidden">
                <MediaPanel 
                  flightId={flightId} 
                  timelinePosition={timestamp} 
                  onTimelinePositionChange={onTimelinePositionChange}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
};

export default FlightDetailsPanel;
