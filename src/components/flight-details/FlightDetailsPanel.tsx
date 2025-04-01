
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, Clock, LineChart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import our components
import DetailsPanelHeader from './DetailsPanelHeader';
import TelemetryPanel, { TelemetryData } from './TelemetryPanel';
import TimelinePanel from './TimelinePanel';
import TelemetryGraphsPanel from './TelemetryGraphsPanel';

interface FlightDetailsPanelProps {
  flightId: string;
  flightMode: string;
  timestamp: string;
  className?: string;
  onEventSelect?: (eventId: string) => void;
}

const FlightDetailsPanel: React.FC<FlightDetailsPanelProps> = ({
  flightId,
  flightMode,
  timestamp,
  className,
  onEventSelect
}) => {
  // State for active tab (handled by Radix UI Tabs)
  const [activeTab, setActiveTab] = useState("telemetry");
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  
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
  
  // Handle tab transitions with animations
  useEffect(() => {
    if (previousTab !== null && previousTab !== activeTab) {
      setIsTabTransitioning(true);
      const timer = setTimeout(() => {
        setIsTabTransitioning(false);
      }, 300); // Match this with your CSS transition duration
      
      return () => clearTimeout(timer);
    }
    
    return () => {};
  }, [activeTab, previousTab]);
  
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
    setPreviousTab(activeTab);
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
          defaultValue="telemetry" 
          className="flex flex-col w-full h-full" 
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="flex w-full h-[40px] bg-transparent shrink-0 border-b border-outline-primary">
            <TabsTrigger 
              value="telemetry" 
              className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Telemetry
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="graphs" 
              className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
            >
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Graphs
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <div className="flex-1 overflow-hidden relative">
            <TabsContent 
              value="telemetry" 
              className={cn(
                "h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col absolute inset-0 transition-all duration-300",
                activeTab === "telemetry" 
                  ? "opacity-100 translate-x-0 z-10" 
                  : previousTab === "telemetry" && isTabTransitioning 
                    ? "opacity-0 -translate-x-5 z-0"
                    : "opacity-0 translate-x-5 z-0"
              )}
            >
              <div className="flex-1 overflow-hidden">
                <TelemetryPanel telemetryData={telemetryData} />
              </div>
            </TabsContent>
            
            <TabsContent 
              value="graphs" 
              className={cn(
                "h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col absolute inset-0 transition-all duration-300",
                activeTab === "graphs" 
                  ? "opacity-100 translate-x-0 z-10" 
                  : previousTab === "graphs" && isTabTransitioning 
                    ? "opacity-0 -translate-x-5 z-0"
                    : "opacity-0 translate-x-5 z-0"
              )}
            >
              <div className="flex-1 overflow-hidden">
                <TelemetryGraphsPanel 
                  timestamp={timestamp}
                  telemetryData={telemetryData} 
                />
              </div>
            </TabsContent>
            
            <TabsContent 
              value="timeline" 
              className={cn(
                "h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col absolute inset-0 transition-all duration-300",
                activeTab === "timeline" 
                  ? "opacity-100 translate-x-0 z-10" 
                  : previousTab === "timeline" && isTabTransitioning 
                    ? "opacity-0 -translate-x-5 z-0"
                    : "opacity-0 translate-x-5 z-0"
              )}
            >
              <div className="flex-1 overflow-hidden">
                <TimelinePanel timelinePosition={timestamp} onEventSelect={onEventSelect} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
};

export default FlightDetailsPanel;
