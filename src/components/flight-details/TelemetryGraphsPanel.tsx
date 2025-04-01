
import React, { useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TelemetryData } from './TelemetryPanel';
import { timeToSeconds } from './timeline/timelineUtils';
import { MetricChart, TelemetryDataPoint } from './graphs/MetricChart';
import { Battery, MountainSnow } from 'lucide-react';

interface TelemetryGraphsPanelProps {
  timestamp: string;
  telemetryData: TelemetryData;
}

// Function to generate mock history data for visualization
const generateMockHistoryData = (
  currentValue: number, 
  duration: number, // in seconds
  variability: number, 
  trend: 'stable' | 'increasing' | 'decreasing' | 'fluctuating' = 'stable'
): TelemetryDataPoint[] => {
  const data: TelemetryDataPoint[] = [];
  const points = Math.min(200, duration); // Limit number of points for performance
  
  for (let i = 0; i <= points; i++) {
    const timestampSec = Math.floor((i / points) * duration);
    let value = currentValue;
    
    // Apply trend
    switch (trend) {
      case 'increasing':
        value = currentValue * (0.7 + (0.6 * i / points));
        break;
      case 'decreasing':
        value = currentValue * (1.3 - (0.6 * i / points));
        break;
      case 'fluctuating':
        value = currentValue * (0.9 + 0.2 * Math.sin(i / 5));
        break;
      default: // stable
        value = currentValue * (0.9 + 0.2 * Math.random());
    }
    
    // Add variability
    value += (Math.random() - 0.5) * 2 * variability;
    
    data.push({
      timestamp: timestampSec,
      value: Math.max(0, value), // Ensure no negative values for metrics like battery
    });
  }
  
  return data;
};

const TelemetryGraphsPanel: React.FC<TelemetryGraphsPanelProps> = ({
  timestamp,
  telemetryData
}) => {
  // Convert timestamp to seconds for visualization
  const timestampInSeconds = useMemo(() => timeToSeconds(timestamp), [timestamp]);
  
  // Generate mock history data based on current telemetry values
  const batteryData = useMemo(() => 
    generateMockHistoryData(telemetryData.battery.percentage, 1500, 2, 'decreasing'),
    [telemetryData.battery.percentage]
  );
  
  const altitudeData = useMemo(() => {
    // Create more realistic altitude data with takeoff, cruise, and landing phases
    const duration = 1500;
    const points = Math.min(200, duration);
    const data: TelemetryDataPoint[] = [];
    
    for (let i = 0; i <= points; i++) {
      const timestampSec = Math.floor((i / points) * duration);
      let value: number;
      
      // Simulate takeoff, cruise and landing
      if (i < points * 0.1) {
        // Takeoff phase: 0-10% of flight
        value = telemetryData.altitude.value * (i / (points * 0.1));
      } else if (i > points * 0.85) {
        // Landing phase: 85-100% of flight
        const landingProgress = (i - points * 0.85) / (points * 0.15);
        value = telemetryData.altitude.value * (1 - landingProgress);
      } else {
        // Cruise phase with variations
        const cruisePhase = (i - points * 0.1) / (points * 0.75);
        const baseAltitude = telemetryData.altitude.value;
        
        // Add some realistic altitude variations during cruise
        const variation = Math.sin(cruisePhase * 6) * 5 + Math.sin(cruisePhase * 12) * 3;
        value = baseAltitude + variation;
      }
      
      // Add some random noise
      value += (Math.random() - 0.5) * 2;
      
      data.push({
        timestamp: timestampSec,
        value: Math.max(0, value)
      });
    }
    
    return data;
  }, [telemetryData.altitude.value]);
  
  const horizontalSpeedData = useMemo(() => {
    // Create more realistic speed data with acceleration and deceleration
    const duration = 1500;
    const points = Math.min(200, duration);
    const data: TelemetryDataPoint[] = [];
    const maxSpeed = telemetryData.horizontalSpeed.value * 1.5;
    
    for (let i = 0; i <= points; i++) {
      const timestampSec = Math.floor((i / points) * duration);
      let value: number;
      
      // Different flight phases
      if (i < points * 0.1) {
        // Takeoff acceleration
        value = maxSpeed * (i / (points * 0.1)) * 0.7;
      } else if (i > points * 0.85) {
        // Landing deceleration
        const landingProgress = (i - points * 0.85) / (points * 0.15);
        value = maxSpeed * 0.6 * (1 - landingProgress);
      } else {
        // Various speed changes during flight
        const flightPhase = (i - points * 0.1) / (points * 0.75);
        
        // Create a pattern of speeds with transitions between slow and fast
        const speedPattern = 
          0.4 + 0.6 * (
            0.5 * Math.sin(flightPhase * 3 * Math.PI) + 
            0.3 * Math.sin(flightPhase * 7 * Math.PI) +
            0.2 * Math.sin(flightPhase * 12 * Math.PI)
          );
        
        value = maxSpeed * speedPattern;
      }
      
      // Add some random variations
      value += (Math.random() - 0.5) * maxSpeed * 0.1;
      value = Math.max(0, value);
      
      data.push({
        timestamp: timestampSec,
        value
      });
    }
    
    return data;
  }, [telemetryData.horizontalSpeed.value]);
  
  const verticalSpeedData = useMemo(() => {
    // Create realistic vertical speed data with positive and negative values
    const duration = 1500;
    const points = Math.min(200, duration);
    const data: TelemetryDataPoint[] = [];
    const maxVerticalSpeed = Math.abs(telemetryData.verticalSpeed.value) * 2;
    
    for (let i = 0; i <= points; i++) {
      const timestampSec = Math.floor((i / points) * duration);
      let value: number;
      
      // Different flight phases with vertical speed
      if (i < points * 0.1) {
        // Takeoff - positive vertical speed
        value = maxVerticalSpeed * (i / (points * 0.1));
      } else if (i > points * 0.85) {
        // Landing - negative vertical speed
        value = -maxVerticalSpeed * 0.5;
      } else {
        // Cruise phase with occasional altitude adjustments
        const flightPhase = (i - points * 0.1) / (points * 0.75);
        
        // Most of the time hover (zero), with occasional climbs and descents
        if (i % 30 < 5) {
          // Climb
          value = maxVerticalSpeed * 0.7 * Math.random();
        } else if (i % 30 > 25) {
          // Descent
          value = -maxVerticalSpeed * 0.7 * Math.random();
        } else {
          // Hover with tiny fluctuations
          value = (Math.random() - 0.5) * 0.5;
        }
        
        // Add some wave patterns for more natural transitions
        value += maxVerticalSpeed * 0.2 * Math.sin(flightPhase * 20 * Math.PI);
      }
      
      data.push({
        timestamp: timestampSec,
        value
      });
    }
    
    return data;
  }, [telemetryData.verticalSpeed.value]);
  
  const signalStrengthData = useMemo(() => {
    // Calculate signal strength as a percentage from RF Link status
    const signalValue = telemetryData.connections.rfLink.status === 'active' ? 90 : 
                       telemetryData.connections.rfLink.status === 'poor' ? 40 : 10;
                       
    // Create realistic signal strength data with occasional drops
    const duration = 1500;
    const points = Math.min(200, duration);
    const data: TelemetryDataPoint[] = [];
    
    for (let i = 0; i <= points; i++) {
      const timestampSec = Math.floor((i / points) * duration);
      let value: number;
      
      // Base signal strength
      value = signalValue * 0.9;
      
      // Add randomness
      value += (Math.random() * 15);
      
      // Add occasional signal drops
      if (Math.random() < 0.05) {
        value *= 0.5;
      }
      
      // Ensure signal is between 0-100%
      value = Math.min(100, Math.max(0, value));
      
      data.push({
        timestamp: timestampSec,
        value
      });
    }
    
    return data;
  }, [telemetryData.connections.rfLink.status]);

  // Dynamically calculate current values at the given timestamp
  const getCurrentValueAtTimestamp = (data: TelemetryDataPoint[], timestamp: number): number => {
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
  };

  // Calculate current values based on timeline position
  const currentBatteryValue = useMemo(() => 
    getCurrentValueAtTimestamp(batteryData, timestampInSeconds),
    [batteryData, timestampInSeconds]
  );
  
  const currentAltitudeValue = useMemo(() => 
    getCurrentValueAtTimestamp(altitudeData, timestampInSeconds),
    [altitudeData, timestampInSeconds]
  );
  
  const currentHorizontalSpeedValue = useMemo(() => 
    getCurrentValueAtTimestamp(horizontalSpeedData, timestampInSeconds),
    [horizontalSpeedData, timestampInSeconds]
  );
  
  const currentVerticalSpeedValue = useMemo(() => 
    getCurrentValueAtTimestamp(verticalSpeedData, timestampInSeconds),
    [verticalSpeedData, timestampInSeconds]
  );
  
  const currentSignalStrengthValue = useMemo(() => 
    getCurrentValueAtTimestamp(signalStrengthData, timestampInSeconds),
    [signalStrengthData, timestampInSeconds]
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
    unit: "m/s",
    color: "#8B5CF6", // Purple
    dataKey: "value",
    minValue: 0,
    gradientFill: false,
    decimals: 1
  };

  const verticalSpeedConfig = {
    title: "Vertical Speed", 
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
    unit: "%",
    color: "#A5F3FC", // Light blue
    dataKey: "value",
    minValue: 0,
    maxValue: 100,
    gradientFill: true,
    decimals: 0
  };

  // CSS for perfect graph alignment
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .timeline-indicator {
        pointer-events: none !important;
      }
      .recharts-reference-line line {
        stroke-width: 1px !important;
        opacity: 0.3 !important;
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
          data={batteryData}
          currentValue={currentBatteryValue}
          currentTimestamp={timestampInSeconds}
          config={batteryConfig}
          height={140}
        />

        <MetricChart 
          data={altitudeData}
          currentValue={currentAltitudeValue}
          currentTimestamp={timestampInSeconds}
          config={altitudeConfig}
          height={140}
        />

        <MetricChart 
          data={horizontalSpeedData}
          currentValue={currentHorizontalSpeedValue}
          currentTimestamp={timestampInSeconds}
          config={horizontalSpeedConfig}
          height={140}
        />

        <MetricChart 
          data={verticalSpeedData}
          currentValue={currentVerticalSpeedValue}
          currentTimestamp={timestampInSeconds}
          config={verticalSpeedConfig}
          height={140}
        />

        <MetricChart 
          data={signalStrengthData}
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
