
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Toggle, toggleVariants } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

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
        <Tabs defaultValue="overview" className="w-full">
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
              Telemetry
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="flex-1 h-full rounded-none data-[state=active]:bg-background-level-2 data-[state=active]:text-text-icon-01 data-[state=inactive]:text-text-icon-02 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-200 after:transform after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
            >
              Timeline
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
                  <span className="text-[10px] text-text-icon-02">GPS 31</span>
                  <span className="text-[10px] text-success-200">RTK 27 Fixed</span>
                </div>
              </div>
              
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-2 gap-[10px] p-400">
                {/* Card 1 - Battery */}
                <div className="bg-background-level-2 p-300 rounded-[4px]">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-icon-02 mb-100">Battery</span>
                    <span className="text-lg text-text-icon-01 font-medium mb-200">91%</span>
                    <div className="mb-200">
                      <Progress value={91} className="h-[10px] w-[80px] bg-background-level-1 rounded-full" />
                    </div>
                    <span className="text-[10px] text-text-icon-02">Est. Remaining: 27 minutes</span>
                  </div>
                </div>
                
                {/* Card 2 - Altitude */}
                <div className="bg-background-level-2 p-300 rounded-[4px]">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-icon-02 mb-100">Altitude</span>
                    <span className="text-lg text-text-icon-01 font-medium">4.1 m</span>
                    <div className="mt-200">
                      <ToggleGroup type="single" defaultValue="rlt" className="bg-background-level-3 p-[2px] rounded-full w-fit">
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
                    <span className="text-lg text-text-icon-01 font-medium">0 m/s</span>
                  </div>
                </div>
                
                {/* Card 4 - Vertical Speed */}
                <div className="bg-background-level-2 p-300 rounded-[4px]">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-icon-02 mb-100">Vertical Speed</span>
                    <span className="text-lg text-text-icon-01 font-medium">3.9 m/s</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="telemetry">
            {/* We'll build this tab later */}
          </TabsContent>
          
          <TabsContent value="timeline">
            {/* We'll build this tab later */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FlightDetailsPanel;
