
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Activity, Clock, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  };
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

  // Helper function to render connection status indicator
  const renderConnectionStatus = (status: 'active' | 'inactive' | 'poor') => {
    const colors = {
      active: {
        bg: 'bg-success-200 bg-opacity-20',
        border: 'border-success-200',
        text: 'text-success-200',
        dot: 'bg-success-200'
      },
      inactive: {
        bg: 'bg-text-icon-02 bg-opacity-10',
        border: 'border-text-icon-02 border-opacity-30',
        text: 'text-text-icon-02',
        dot: 'bg-text-icon-02'
      },
      poor: {
        bg: 'bg-caution-200 bg-opacity-20',
        border: 'border-caution-200 border-opacity-30',
        text: 'text-caution-200',
        dot: 'bg-caution-200'
      }
    };

    return (
      <div className={cn(
        'flex items-center text-[10px] px-200 py-[2px] rounded-full',
        colors[status].bg,
        'border',
        colors[status].border
      )}>
        <div className={cn('w-[6px] h-[6px] rounded-full mr-[6px]', colors[status].dot)} />
        <span className={colors[status].text}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    );
  };

  return (
    <div 
      className="fixed-width-panel bg-background-bg border-l border-outline-primary flex flex-col h-full"
      style={{ width: '380px' }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-400 h-[50px] border-b border-outline-primary">
        <div className="flex items-center gap-200">
          <Badge 
            className="bg-primary-200 text-text-icon-01 rounded-[10px] py-1 px-300 text-xs font-medium"
          >
            {flightMode}
          </Badge>
          <span className="text-text-icon-02 fb-body1-medium">{flightId}</span>
        </div>
        <div className="bg-background-level-2 px-300 py-1 rounded-200">
          <span className="text-text-icon-01 fb-body2-regular">{timestamp}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="h-[45px] bg-background-level-1">
        <Tabs 
          defaultValue="telemetry" 
          className="w-full" 
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="flex w-full h-[45px] bg-transparent">
            <TabsTrigger 
              value="telemetry" 
              className="flex-1 h-full rounded-none data-[state=active]:bg-background-level-2 data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
            >
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Telemetry
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="flex-1 h-full rounded-none data-[state=active]:bg-background-level-2 data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
            >
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Timeline
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="telemetry" className="p-0">
            {/* Drone Telemetry Section */}
            <div className="space-y-0">
              {/* Telemetry Header */}
              <div className="h-[35px] bg-background-level-2 flex items-center justify-between px-400 border-t border-b border-outline-primary">
                <h3 className="fb-body1-medium text-text-icon-01">Drone Telemetry</h3>
                <div className="flex items-center gap-200">
                  <div className="flex items-center gap-100">
                    <div className="w-[8px] h-[8px] rounded-full bg-success-200"></div>
                    <span className="text-[10px] text-text-icon-01">GPS {telemetryData.gpsStatus.count}</span>
                  </div>
                </div>
              </div>
              
              {/* Battery Section */}
              <div className="p-400">
                <div className="bg-background-level-2 p-300 rounded-[4px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-text-icon-02">Battery</span>
                      <div className="flex items-baseline gap-200">
                        <span className="text-2xl text-text-icon-01 font-medium">{telemetryData.battery.percentage}%</span>
                        <span className="text-[10px] text-text-icon-02">Est. Remaining: {telemetryData.battery.estimatedRemaining}</span>
                      </div>
                    </div>
                    <div className="w-[120px]">
                      <Progress value={telemetryData.battery.percentage} className="h-[8px] bg-background-level-1 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Telemetry Metrics Grid */}
              <div className="px-400 pt-200">
                <div className="grid grid-cols-2 gap-[16px]">
                  {/* Left Column */}
                  <div className="space-y-300">
                    {/* Altitude */}
                    <div>
                      <span className="text-[10px] text-text-icon-02 block">Altitude</span>
                      <span className="text-md text-text-icon-01 font-medium">{telemetryData.altitude.value} {telemetryData.altitude.unit}</span>
                    </div>
                    
                    {/* Vertical Speed */}
                    <div>
                      <span className="text-[10px] text-text-icon-02 block">Vertical Speed</span>
                      <span className="text-md text-text-icon-01 font-medium">{telemetryData.verticalSpeed.value} {telemetryData.verticalSpeed.unit}</span>
                    </div>
                    
                    {/* Time Elapsed */}
                    <div>
                      <span className="text-[10px] text-text-icon-02 block">Time Elapsed</span>
                      <span className="text-md text-text-icon-01 font-medium">{telemetryData.timeElapsed}</span>
                    </div>
                    
                    {/* Latitude */}
                    <div>
                      <span className="text-[10px] text-text-icon-02 block">Latitude</span>
                      <span className="text-md text-text-icon-01 font-medium">{telemetryData.coordinates.latitude.toFixed(5)}</span>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-300">
                    {/* Distance from Home */}
                    <div>
                      <span className="text-[10px] text-text-icon-02 block">Distance from Home</span>
                      <span className="text-md text-text-icon-01 font-medium">{telemetryData.distance.value} {telemetryData.distance.unit}</span>
                    </div>
                    
                    {/* Horizontal Speed */}
                    <div>
                      <span className="text-[10px] text-text-icon-02 block">Horizontal Speed</span>
                      <span className="text-md text-text-icon-01 font-medium">{telemetryData.horizontalSpeed.value} {telemetryData.horizontalSpeed.unit}</span>
                    </div>
                    
                    {/* Time Remaining */}
                    <div>
                      <span className="text-[10px] text-text-icon-02 block">Time Remaining</span>
                      <span className="text-md text-text-icon-01 font-medium">{telemetryData.timeRemaining}</span>
                    </div>
                    
                    {/* Longitude */}
                    <div>
                      <span className="text-[10px] text-text-icon-02 block">Longitude</span>
                      <span className="text-md text-text-icon-01 font-medium">{telemetryData.coordinates.longitude.toFixed(5)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Network Section */}
              <div className="mt-400">
                {/* Network Header */}
                <div className="h-[35px] bg-background-level-2 flex items-center px-400 border-t border-b border-outline-primary">
                  <div className="flex items-center gap-200">
                    <Network className="w-4 h-4 text-text-icon-02" />
                    <h3 className="fb-body1-medium text-text-icon-01">Network</h3>
                  </div>
                </div>
                
                {/* Connection Cards */}
                <div className="p-400 space-y-300">
                  {/* RF Link */}
                  <div className="bg-background-level-2 rounded-[4px] p-300 flex items-center justify-between">
                    <span className="text-xs text-text-icon-01">Dock Drone RF Link</span>
                    <div className="flex items-center gap-200">
                      {renderConnectionStatus(telemetryData.connections.rfLink.status)}
                      <span className="text-[10px] text-text-icon-02">{telemetryData.connections.rfLink.details}</span>
                    </div>
                  </div>
                  
                  {/* Ethernet */}
                  <div className="bg-background-level-2 rounded-[4px] p-300 flex items-center justify-between">
                    <span className="text-xs text-text-icon-01">Dock Ethernet</span>
                    <div className="flex items-center gap-200">
                      {renderConnectionStatus(telemetryData.connections.ethernet.status)}
                      <span className="text-[10px] text-text-icon-02">{telemetryData.connections.ethernet.details}</span>
                    </div>
                  </div>
                  
                  {/* 4G */}
                  <div className="bg-background-level-2 rounded-[4px] p-300 flex items-center justify-between">
                    <span className="text-xs text-text-icon-01">Dock 4G</span>
                    <div className="flex items-center gap-200">
                      {renderConnectionStatus(telemetryData.connections.cellular.status)}
                      <span className="text-[10px] text-text-icon-02">{telemetryData.connections.cellular.details}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="p-0">
            {/* Timeline placeholder */}
            <div className="flex flex-col items-center justify-center space-y-400 h-[400px] text-center p-400 text-text-icon-02 border border-dashed border-outline-primary mx-400 my-400 rounded-md">
              <Clock size={48} className="text-primary-200 opacity-50" />
              <div className="space-y-200">
                <h3 className="text-lg text-text-icon-01">Timeline View</h3>
                <p className="text-sm">Flight timeline details will be implemented in the next step.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FlightDetailsPanel;
