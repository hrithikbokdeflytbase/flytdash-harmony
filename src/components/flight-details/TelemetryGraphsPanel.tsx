
import React, { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TelemetryData } from './TelemetryPanel';
import { MetricChart } from './graphs/MetricChart';
import { generateMockTelemetryHistory } from './graphs/mockTelemetryData';
import { timeToSeconds } from './timeline/timelineUtils';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface TelemetryGraphsPanelProps {
  timestamp: string;
  telemetryData: TelemetryData;
}

// Supported metrics for visualization
export type TelemetryMetric = 'battery' | 'altitude' | 'horizontalSpeed' | 'verticalSpeed' | 'signal';

// Configuration for each metric chart
const metricConfigs = {
  battery: {
    title: "Battery",
    unit: "%",
    color: "#10B981",
    // Success green
    gradientFill: true,
    dataKey: "value",
    minValue: 0,
    maxValue: 100,
    decimals: 0
  },
  altitude: {
    title: "Altitude",
    unit: "m",
    color: "#496DC8",
    // Primary 200
    dataKey: "value",
    minValue: 0,
    decimals: 1
  },
  horizontalSpeed: {
    title: "Horizontal Speed",
    unit: "m/s",
    color: "#9b87f5",
    // Purple
    dataKey: "value",
    minValue: 0,
    decimals: 1
  },
  verticalSpeed: {
    title: "Vertical Speed",
    unit: "m/s",
    color: "#0EA5E9",
    // Teal
    dataKey: "value",
    minValue: -10,
    decimals: 1
  },
  signal: {
    title: "Signal Strength",
    unit: "%",
    color: "#888888",
    // Gray/white
    dataKey: "value",
    minValue: 0,
    maxValue: 100,
    decimals: 0
  }
};

const TelemetryGraphsPanel: React.FC<TelemetryGraphsPanelProps> = ({
  timestamp,
  telemetryData
}) => {
  // Generate mock historical data for each metric
  const [telemetryHistory] = useState(() => generateMockTelemetryHistory());

  // Zoom level state for all charts (100% is default)
  const [zoomLevel, setZoomLevel] = useState(100);

  // Calculate current timestamp in seconds
  const currentTimestampSeconds = useMemo(() => {
    return timeToSeconds(timestamp);
  }, [timestamp]);

  // Function to get current value based on timestamp
  const getCurrentValue = (metricKey: TelemetryMetric): number => {
    switch (metricKey) {
      case 'battery':
        return telemetryData.battery.percentage;
      case 'altitude':
        return telemetryData.altitude.value;
      case 'horizontalSpeed':
        return telemetryData.horizontalSpeed.value;
      case 'verticalSpeed':
        return telemetryData.verticalSpeed.value;
      case 'signal':
        // Use either RF signal or GPS count as a proxy for signal strength
        return telemetryData.gpsStatus.count / 24 * 100;
      // Normalize to percentage
      default:
        return 0;
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 25, 200));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 25, 50));
  };

  return <div className="h-full w-full relative">
      <ScrollArea className="h-full w-full pb-16">
        <div className="flex flex-col space-y-3 pb-16">
          {/* Render each metric chart */}
          <div className="space-y-3">
            {/* Battery Percentage Chart */}
            <MetricChart data={telemetryHistory.battery} currentValue={getCurrentValue('battery')} currentTimestamp={currentTimestampSeconds} config={metricConfigs.battery} isLastChart={false} zoomLevel={zoomLevel} />

            {/* Altitude Chart */}
            <MetricChart data={telemetryHistory.altitude} currentValue={getCurrentValue('altitude')} currentTimestamp={currentTimestampSeconds} config={metricConfigs.altitude} isLastChart={false} zoomLevel={zoomLevel} />

            {/* Horizontal Speed Chart */}
            <MetricChart data={telemetryHistory.horizontalSpeed} currentValue={getCurrentValue('horizontalSpeed')} currentTimestamp={currentTimestampSeconds} config={metricConfigs.horizontalSpeed} isLastChart={false} zoomLevel={zoomLevel} />

            {/* Vertical Speed Chart */}
            <MetricChart data={telemetryHistory.verticalSpeed} currentValue={getCurrentValue('verticalSpeed')} currentTimestamp={currentTimestampSeconds} config={metricConfigs.verticalSpeed} isLastChart={false} zoomLevel={zoomLevel} />

            {/* Signal Strength Chart */}
            <MetricChart data={telemetryHistory.signal} currentValue={getCurrentValue('signal')} currentTimestamp={currentTimestampSeconds} config={metricConfigs.signal} isLastChart={true} zoomLevel={zoomLevel} />
          </div>
        </div>
      </ScrollArea>
      
      {/* Fixed bottom overlay panel for zoom controls */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-background-level-1 border-t border-outline-primary flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 rounded-full"
            onClick={handleZoomOut}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium px-2 min-w-[60px] text-center tabular-nums">
            {zoomLevel}%
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 rounded-full"
            onClick={handleZoomIn}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>;
};

export default TelemetryGraphsPanel;
