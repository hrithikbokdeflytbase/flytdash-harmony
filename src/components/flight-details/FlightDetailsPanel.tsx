
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
          <TabsContent value="overview" className="px-400 py-300">
            <div className="space-y-300">
              <div className="p-300 bg-background-level-3 rounded-200">
                <h3 className="fb-body1-medium text-text-icon-01">Flight Overview</h3>
                <p className="text-text-icon-02 fb-body2-regular">Flight details will be displayed here</p>
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
