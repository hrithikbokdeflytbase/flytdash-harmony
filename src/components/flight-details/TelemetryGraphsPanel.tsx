
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { timeToSeconds } from './timeline/timelineUtils';
import { MetricChart } from './graphs/MetricChart';
import { Battery, MountainSnow, Wind, LifeBuoy, Signal } from 'lucide-react';
import { generateMockTelemetryHistory } from './graphs/mockTelemetryData';
import { 
  TelemetryGraphsPanelProps, 
  TelemetryDataPoint
} from './types/telemetryTypes';

const TelemetryGraphsPanel: React.FC<TelemetryGraphsPanelProps> = ({
  timestamp,
  telemetryData
}) => {
  // Convert timestamp to seconds for visualization
  const timestampInSeconds = useMemo(() => timeToSeconds(timestamp), [timestamp]);
  
  // Generate mock history data for all telemetry values - use a ref to avoid regenerating
  const [telemetryHistory, setTelemetryHistory] = useState(() => {
    console.log("Generating mock telemetry history");
    return generateMockTelemetryHistory();
  });
  
  useEffect(() => {
    console.log("Telemetry history generated:", 
                `Battery points: ${telemetryHistory.battery.length}`,
                `Altitude points: ${telemetryHistory.altitude.length}`,
                `Current timestamp: ${timestampInSeconds}`);
  }, [telemetryHistory, timestampInSeconds]);
  
  // Dynamically calculate current values at the given timestamp
  const getCurrentValueAtTimestamp = useCallback((data: TelemetryDataPoint[], timestamp: number): number => {
    if (!data || data.length === 0) {
      console.log("No data provided to getCurrentValueAtTimestamp");
      return 0;
    }
    
    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    
    // Find the data points that bracket the current timestamp
    for (let i = 0; i < sortedData.length - 1; i++) {
      if (timestamp >= sortedData[i].timestamp && timestamp <= sortedData[i + 1].timestamp) {
        // Linear interpolation between the two points
        const t1 = sortedData[i].timestamp;
        const t2 = sortedData[i + 1].timestamp;
        const v1 = sortedData[i].value;
        const v2 = sortedData[i + 1].value;
        
        // Calculate interpolation factor
        const factor = (timestamp - t1) / (t2 - t1);
        return v1 + factor * (v2 - v1);
      }
    }
    
    // If timestamp is before first data point
    if (timestamp <= sortedData[0].timestamp) {
      return sortedData[0].value;
    }
    
    // If timestamp is after last data point
    if (timestamp >= sortedData[sortedData.length - 1].timestamp) {
      return sortedData[sortedData.length - 1].value;
    }
    
    // Fallback: return the original telemetry value
    return data.length > 0 ? data[0].value : 0;
  }, []);

  // Calculate current values based on timeline position
  const currentBatteryValue = useMemo(() => 
    getCurrentValueAtTimestamp(telemetryHistory.battery, timestampInSeconds),
    [telemetryHistory.battery, timestampInSeconds, getCurrentValueAtTimestamp]
  );
  
  const currentAltitudeValue = useMemo(() => 
    getCurrentValueAtTimestamp(telemetryHistory.altitude, timestampInSeconds),
    [telemetryHistory.altitude, timestampInSeconds, getCurrentValueAtTimestamp]
  );
  
  const currentHorizontalSpeedValue = useMemo(() => 
    getCurrentValueAtTimestamp(telemetryHistory.horizontalSpeed, timestampInSeconds),
    [telemetryHistory.horizontalSpeed, timestampInSeconds, getCurrentValueAtTimestamp]
  );
  
  const currentVerticalSpeedValue = useMemo(() => 
    getCurrentValueAtTimestamp(telemetryHistory.verticalSpeed, timestampInSeconds),
    [telemetryHistory.verticalSpeed, timestampInSeconds, getCurrentValueAtTimestamp]
  );
  
  const currentSignalStrengthValue = useMemo(() => 
    getCurrentValueAtTimestamp(telemetryHistory.signal, timestampInSeconds),
    [telemetryHistory.signal, timestampInSeconds, getCurrentValueAtTimestamp]
  );

  // Chart configurations for each telemetry metric
  const batteryConfig = {
    title: "Battery",
    icon: <Battery className="h-4 w-4" />,
    unit: "%",
    color: "#10B981", // Green
    dataKey: "value",
    minValue: 0,
    maxValue: 100,
    gradientFill: true,
    decimals: 1,
    thresholds: [
      { value: 15, color: "#ea384c", label: "Critical" }, // Red threshold at 15%
      { value: 25, color: "#F97316", label: "Warning" }, // Orange threshold at 25%
    ]
  };

  const altitudeConfig = {
    title: "Altitude (AGL)",
    icon: <MountainSnow className="h-4 w-4" />,
    unit: "m",
    color: "#496DC8", // Blue
    dataKey: "value",
    minValue: 0,
    gradientFill: false,
    decimals: 1
  };

  const horizontalSpeedConfig = {
    title: "Horizontal Speed",
    icon: <Wind className="h-4 w-4" />,
    unit: "m/s",
    color: "#8B5CF6", // Purple
    dataKey: "value",
    minValue: 0,
    gradientFill: false,
    decimals: 1
  };

  const verticalSpeedConfig = {
    title: "Vertical Speed",
    icon: <LifeBuoy className="h-4 w-4 rotate-90" />,
    unit: "m/s",
    color: "#14B8A6", // Teal
    dataKey: "value",
    gradientFill: false,
    decimals: 1,
    // Center the axis around 0 by explicitly setting min and max values
    // Set a reasonable range based on expected vertical speeds
    minValue: -5,  // Down to -5 m/s (descent)
    maxValue: 5,   // Up to 5 m/s (ascent)
    thresholds: [
      { value: 0, color: "#94A3B8", label: "Hover" }, // Neutral line at 0
    ]
  };

  const signalStrengthConfig = {
    title: "Signal Strength",
    icon: <Signal className="h-4 w-4" />,
    unit: "%",
    color: "#A5F3FC", // Light blue
    dataKey: "value",
    minValue: 0,
    maxValue: 100,
    gradientFill: true,
    decimals: 0
  };

  // Add animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .timeline-indicator {
        pointer-events: none !important;
        transition: all 0.15s ease-out !important;
      }
      .recharts-reference-line line {
        stroke-width: 1px !important;
        opacity: 0.3 !important;
      }
      .recharts-tooltip-cursor {
        stroke-width: 1px !important;
        stroke-dasharray: 3 3 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-0 space-y-4 relative">
        <MetricChart 
          data={telemetryHistory.battery}
          currentValue={currentBatteryValue}
          currentTimestamp={timestampInSeconds}
          config={batteryConfig}
          height={140}
        />

        <MetricChart 
          data={telemetryHistory.altitude}
          currentValue={currentAltitudeValue}
          currentTimestamp={timestampInSeconds}
          config={altitudeConfig}
          height={140}
        />

        <MetricChart 
          data={telemetryHistory.horizontalSpeed}
          currentValue={currentHorizontalSpeedValue}
          currentTimestamp={timestampInSeconds}
          config={horizontalSpeedConfig}
          height={140}
        />

        <MetricChart 
          data={telemetryHistory.verticalSpeed}
          currentValue={currentVerticalSpeedValue}
          currentTimestamp={timestampInSeconds}
          config={verticalSpeedConfig}
          height={140}
        />

        <MetricChart 
          data={telemetryHistory.signal}
          currentValue={currentSignalStrengthValue}
          currentTimestamp={timestampInSeconds}
          config={signalStrengthConfig}
          height={140}
          isLastChart={true}
        />
      </div>
    </ScrollArea>
  );
};

export default TelemetryGraphsPanel;
