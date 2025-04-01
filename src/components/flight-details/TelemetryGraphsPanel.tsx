
import React, { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TelemetryData } from './TelemetryPanel';
import { MetricChart } from './graphs/MetricChart';
import { generateMockTelemetryHistory } from './graphs/mockTelemetryData';
import { timeToSeconds } from './timeline/timelineUtils';

interface TelemetryGraphsPanelProps {
  timestamp: string;
  telemetryData: TelemetryData;
}

// Supported metrics for visualization
export type TelemetryMetric = 
  | 'battery'
  | 'altitude'
  | 'horizontalSpeed'
  | 'verticalSpeed'
  | 'signal';

// Configuration for each metric chart
const metricConfigs = {
  battery: {
    title: "Battery",
    unit: "%",
    color: "#10B981", // Success green
    gradientFill: true,
    dataKey: "value",
    minValue: 0,
    maxValue: 100,
    decimals: 0
  },
  altitude: {
    title: "Altitude",
    unit: "m",
    color: "#496DC8", // Primary 200
    dataKey: "value",
    minValue: 0,
    decimals: 1
  },
  horizontalSpeed: {
    title: "Horizontal Speed",
    unit: "m/s",
    color: "#9b87f5", // Purple
    dataKey: "value",
    minValue: 0,
    decimals: 1
  },
  verticalSpeed: {
    title: "Vertical Speed",
    unit: "m/s", 
    color: "#0EA5E9", // Teal
    dataKey: "value",
    minValue: -10,
    decimals: 1
  },
  signal: {
    title: "Signal Strength",
    unit: "",
    color: "#888888", // Gray/white
    dataKey: "value",
    minValue: 0,
    maxValue: 100,
    decimals: 0
  }
};

const TelemetryGraphsPanel: React.FC<TelemetryGraphsPanelProps> = ({ timestamp, telemetryData }) => {
  // Generate mock historical data for each metric
  const [telemetryHistory] = useState(() => generateMockTelemetryHistory());
  
  // Calculate current timestamp in seconds
  const currentTimestampSeconds = useMemo(() => {
    return timeToSeconds(timestamp);
  }, [timestamp]);

  // Function to get current value based on timestamp
  const getCurrentValue = (metricKey: TelemetryMetric): number => {
    switch(metricKey) {
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
        return telemetryData.gpsStatus.count / 24 * 100; // Normalize to percentage
      default:
        return 0;
    }
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col space-y-2 px-2 pb-4">
        <p className="text-sm text-text-icon-02 mb-2 px-1">
          Historical telemetry data for this flight
        </p>

        {/* Render each metric chart */}
        <div className="space-y-2">
          {/* Battery Percentage Chart */}
          <MetricChart 
            data={telemetryHistory.battery}
            currentValue={getCurrentValue('battery')}
            currentTimestamp={currentTimestampSeconds}
            config={metricConfigs.battery}
            isLastChart={false}
          />

          {/* Altitude Chart */}
          <MetricChart 
            data={telemetryHistory.altitude}
            currentValue={getCurrentValue('altitude')}
            currentTimestamp={currentTimestampSeconds}
            config={metricConfigs.altitude}
            isLastChart={false}
          />

          {/* Horizontal Speed Chart */}
          <MetricChart 
            data={telemetryHistory.horizontalSpeed}
            currentValue={getCurrentValue('horizontalSpeed')}
            currentTimestamp={currentTimestampSeconds}
            config={metricConfigs.horizontalSpeed}
            isLastChart={false}
          />

          {/* Vertical Speed Chart */}
          <MetricChart 
            data={telemetryHistory.verticalSpeed}
            currentValue={getCurrentValue('verticalSpeed')}
            currentTimestamp={currentTimestampSeconds}
            config={metricConfigs.verticalSpeed}
            isLastChart={false}
          />

          {/* Signal Strength Chart */}
          <MetricChart 
            data={telemetryHistory.signal}
            currentValue={getCurrentValue('signal')}
            currentTimestamp={currentTimestampSeconds}
            config={metricConfigs.signal}
            isLastChart={true}
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default TelemetryGraphsPanel;
