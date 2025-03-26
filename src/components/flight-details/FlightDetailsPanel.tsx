
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Toggle, toggleVariants } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronLeft, ChevronRight, AlertCircle, Activity, Clock } from 'lucide-react';
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
    reference: 'rlt' | 'agl' | 'asl';
  };
  horizontalSpeed: {
    value: number;
    unit: string;
  };
  verticalSpeed: {
    value: number;
    unit: string;
  };
  gpsStatus: {
    count: number;
    signal: string;
  };
  rtkStatus: {
    count: number;
    signal: string;
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
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock telemetry data (in a real app, this would come from props or API)
  const [telemetryData, setTelemetryData] = useState<TelemetryData>({
    battery: {
      percentage: 91,
      estimatedRemaining: "27 minutes"
    },
    altitude: {
      value: 4.1,
      unit: "m",
      reference: "rlt"
    },
    horizontalSpeed: {
      value: 0,
      unit: "m/s"
    },
    verticalSpeed: {
      value: 3.9,
      unit: "m/s"
    },
    gpsStatus: {
      count: 31,
      signal: "Good"
    },
    rtkStatus: {
      count: 27,
      signal: "Fixed"
    }
  });
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Additional logic if needed when tabs change
    // e.g., fetching specific data for selected tab
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
          defaultValue="overview" 
          className="w-full" 
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="flex w-full h-[45px] bg-transparent">
            <TabsTrigger 
              value="overview" 
              className="flex-1 h-full rounded-none data-[state=active]:bg-background-level-2 data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
            >
              Overview
            </TabsTrigger>
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
          <TabsContent value="overview" className="p-0">
            {/* Critical Telemetry Section */}
            <div className="space-y-0">
              {/* Critical Telemetry Header */}
              <div className="h-[35px] bg-background-level-2 flex items-center justify-between px-400 border-t border-b border-outline-primary">
                <h3 className="fb-body1-medium text-text-icon-01">Critical Telemetry</h3>
                <div className="flex items-center gap-200">
                  <span className="text-[10px] text-text-icon-02">GPS {telemetryData.gpsStatus.count}</span>
                  <span className="text-[10px] text-success-200">RTK {telemetryData.rtkStatus.count} {telemetryData.rtkStatus.signal}</span>
                </div>
              </div>
              
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-2 gap-[10px] p-400">
                {/* Card 1 - Battery */}
                <div className="bg-background-level-2 p-300 rounded-[4px]">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-icon-02 mb-100">Battery</span>
                    <span className="text-lg text-text-icon-01 font-medium mb-200">{telemetryData.battery.percentage}%</span>
                    <div className="mb-200">
                      <Progress value={telemetryData.battery.percentage} className="h-[10px] w-[80px] bg-background-level-1 rounded-full" />
                    </div>
                    <span className="text-[10px] text-text-icon-02">Est. Remaining: {telemetryData.battery.estimatedRemaining}</span>
                  </div>
                </div>
                
                {/* Card 2 - Altitude */}
                <div className="bg-background-level-2 p-300 rounded-[4px]">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-icon-02 mb-100">Altitude</span>
                    <span className="text-lg text-text-icon-01 font-medium">{telemetryData.altitude.value} {telemetryData.altitude.unit}</span>
                    <div className="mt-200">
                      <ToggleGroup type="single" defaultValue={telemetryData.altitude.reference} className="bg-background-level-3 p-[2px] rounded-full w-fit">
                        <ToggleGroupItem value="rlt" size="sm" className="rounded-full text-[10px] px-200 py-[2px]">
                          RLT
                        </ToggleGroupItem>
                        <ToggleGroupItem value="agl" size="sm" className="rounded-full text-[10px] px-200 py-[2px]">
                          AGL
                        </ToggleGroupItem>
                        <ToggleGroupItem value="asl" size="sm" className="rounded-full text-[10px] px-200 py-[2px]">
                          ASL
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </div>
                
                {/* Card 3 - Horizontal Speed */}
                <div className="bg-background-level-2 p-300 rounded-[4px]">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-icon-02 mb-100">Horizontal Speed</span>
                    <span className="text-lg text-text-icon-01 font-medium">{telemetryData.horizontalSpeed.value} {telemetryData.horizontalSpeed.unit}</span>
                  </div>
                </div>
                
                {/* Card 4 - Vertical Speed */}
                <div className="bg-background-level-2 p-300 rounded-[4px]">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-icon-02 mb-100">Vertical Speed</span>
                    <span className="text-lg text-text-icon-01 font-medium">{telemetryData.verticalSpeed.value} {telemetryData.verticalSpeed.unit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Issue Section */}
            <div className="space-y-0 mt-400">
              {/* Current Issue Header */}
              <div className="h-[35px] bg-background-level-2 flex items-center justify-between px-400 border-t border-b border-outline-primary">
                <h3 className="fb-body1-medium text-text-icon-01">Current Issue</h3>
                <div className="flex items-center gap-200">
                  <button className="flex items-center justify-center bg-secondary-300 h-[24px] w-[24px] rounded-[4px]">
                    <ChevronLeft className="h-4 w-4 text-text-icon-02" />
                  </button>
                  <div className="bg-secondary-300 px-200 py-[2px] rounded-[4px]">
                    <span className="text-[11px] text-text-icon-02">1/2</span>
                  </div>
                  <button className="flex items-center justify-center bg-primary-200 h-[24px] w-[24px] rounded-[4px]">
                    <ChevronRight className="h-4 w-4 text-text-icon-01" />
                  </button>
                </div>
              </div>
              
              {/* Issue Card */}
              <div className="p-400">
                <div className="bg-[#EF444422] border border-[#EF4444] rounded-[6px] overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-[#00000044] h-[30px] flex items-center justify-between px-300">
                    <div className="flex items-center gap-200">
                      <div className="bg-[#EF4444] rounded-full flex items-center justify-center h-[18px] w-[18px]">
                        <AlertCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-bold text-text-icon-01">Critical Battery Warning</span>
                    </div>
                    <span className="text-[11px] text-text-icon-02">{timestamp}</span>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-300 space-y-200">
                    <p className="text-xs text-text-icon-01">Battery at 23%, below critical threshold (25%).</p>
                    <p className="text-xs text-text-icon-01">Distance to home: 275m | Est. flight time: 4 min</p>
                    <p className="text-xs text-[#EF4444]">System Response: Return to Home (RTH) initiated</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="telemetry" className="p-400">
            {/* Placeholder for Telemetry Tab Content */}
            <div className="flex flex-col items-center justify-center space-y-400 h-[400px] text-center p-400 text-text-icon-02 border border-dashed border-outline-primary rounded-md">
              <Activity size={48} className="text-primary-200 opacity-50" />
              <div className="space-y-200">
                <h3 className="text-lg text-text-icon-01">Telemetry Content</h3>
                <p className="text-sm">Detailed telemetry information will be displayed here in the future implementation.</p>
                <p className="text-xs">This tab will show charts, graphs, and more detailed metrics about the flight.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="p-400">
            {/* Placeholder for Timeline Tab Content */}
            <div className="flex flex-col items-center justify-center space-y-400 h-[400px] text-center p-400 text-text-icon-02 border border-dashed border-outline-primary rounded-md">
              <Clock size={48} className="text-primary-200 opacity-50" />
              <div className="space-y-200">
                <h3 className="text-lg text-text-icon-01">Timeline Content</h3>
                <p className="text-sm">Flight timeline events will be displayed here in the future implementation.</p>
                <p className="text-xs">This tab will show a chronological list of events that occurred during the flight.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FlightDetailsPanel;
