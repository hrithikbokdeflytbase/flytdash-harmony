
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TelemetryData } from './TelemetryPanel';

interface TelemetryGraphsPanelProps {
  timestamp: string;
  telemetryData: TelemetryData;
}

const TelemetryGraphsPanel: React.FC<TelemetryGraphsPanelProps> = ({
  timestamp,
  telemetryData
}) => {
  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 space-y-6">
        {/* Battery Percentage Graph Placeholder */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Battery</h3>
          <div className="h-[150px] flex items-center justify-center text-[rgba(255,255,255,0.5)]">
            Battery graph placeholder
          </div>
        </div>

        {/* Altitude Graph Placeholder */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Altitude</h3>
          <div className="h-[150px] flex items-center justify-center text-[rgba(255,255,255,0.5)]">
            Altitude graph placeholder
          </div>
        </div>

        {/* Horizontal Speed Graph Placeholder */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Horizontal Speed</h3>
          <div className="h-[150px] flex items-center justify-center text-[rgba(255,255,255,0.5)]">
            Horizontal speed graph placeholder
          </div>
        </div>

        {/* Vertical Speed Graph Placeholder */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Vertical Speed</h3>
          <div className="h-[150px] flex items-center justify-center text-[rgba(255,255,255,0.5)]">
            Vertical speed graph placeholder
          </div>
        </div>

        {/* Signal Strength Graph Placeholder */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Signal Strength</h3>
          <div className="h-[150px] flex items-center justify-center text-[rgba(255,255,255,0.5)]">
            Signal strength graph placeholder
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default TelemetryGraphsPanel;
