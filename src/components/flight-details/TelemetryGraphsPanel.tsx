
import React, { useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TelemetryData } from './TelemetryPanel';
import { timeToSeconds } from './timeline/timelineUtils';
import { MetricChart, TelemetryDataPoint } from './graphs/MetricChart';
import { Battery, MountainSnow } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  
  // State for animation triggers
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);
  
  // Generate mock history data based on current telemetry values
  const batteryData = useMemo(() => 
    generateMockHistoryData(telemetryData.battery.percentage, 1500, 2, 'decreasing'),
    [telemetryData.battery.percentage]
  );
  
  const altitudeData = useMemo(() => 
    generateMockHistoryData(telemetryData.altitude.value, 1500, 5, 'fluctuating'),
    [telemetryData.altitude.value]
  );
  
  const horizontalSpeedData = useMemo(() => 
    generateMockHistoryData(telemetryData.horizontalSpeed.value, 1500, 1, 'fluctuating'),
    [telemetryData.horizontalSpeed.value]
  );
  
  const verticalSpeedData = useMemo(() => 
    generateMockHistoryData(telemetryData.verticalSpeed.value, 1500, 0.5, 'fluctuating'),
    [telemetryData.verticalSpeed.value]
  );
  
  const signalStrengthData = useMemo(() => {
    // Calculate signal strength as a percentage from RF Link status
    const signalValue = telemetryData.connections.rfLink.status === 'active' ? 90 : 
                       telemetryData.connections.rfLink.status === 'poor' ? 40 : 10;
    return generateMockHistoryData(signalValue, 1500, 10, 'fluctuating');
  }, [telemetryData.connections.rfLink.status]);

  // Sequential animation for charts when panel becomes visible
  useEffect(() => {
    // Reset animation state
    setActiveChartIndex(null);
    
    // Trigger sequential animations with small delays
    const timer = setTimeout(() => {
      const animationSequence = [0, 1, 2, 3, 4];
      
      animationSequence.forEach((index, i) => {
        setTimeout(() => {
          setActiveChartIndex(index);
        }, i * 100); // 100ms delay between each chart animation
      });
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 space-y-4 md:space-y-6">
        {/* Responsive grid for larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricChart 
            data={batteryData}
            currentValue={telemetryData.battery.percentage}
            currentTimestamp={timestampInSeconds}
            config={batteryConfig}
            animate={activeChartIndex !== null && activeChartIndex >= 0}
            className={cn(
              "transition-opacity duration-300",
              activeChartIndex === null ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          />

          <MetricChart 
            data={altitudeData}
            currentValue={telemetryData.altitude.value}
            currentTimestamp={timestampInSeconds}
            config={altitudeConfig}
            animate={activeChartIndex !== null && activeChartIndex >= 1}
            className={cn(
              "transition-all duration-300 delay-100",
              activeChartIndex === null || activeChartIndex < 1 ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricChart 
            data={horizontalSpeedData}
            currentValue={telemetryData.horizontalSpeed.value}
            currentTimestamp={timestampInSeconds}
            config={horizontalSpeedConfig}
            animate={activeChartIndex !== null && activeChartIndex >= 2}
            className={cn(
              "transition-all duration-300 delay-200",
              activeChartIndex === null || activeChartIndex < 2 ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          />

          <MetricChart 
            data={verticalSpeedData}
            currentValue={telemetryData.verticalSpeed.value}
            currentTimestamp={timestampInSeconds}
            config={verticalSpeedConfig}
            animate={activeChartIndex !== null && activeChartIndex >= 3}
            className={cn(
              "transition-all duration-300 delay-300",
              activeChartIndex === null || activeChartIndex < 3 ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          />
        </div>

        <MetricChart 
          data={signalStrengthData}
          currentValue={telemetryData.connections.rfLink.status === 'active' ? 90 : 
                      telemetryData.connections.rfLink.status === 'poor' ? 40 : 10}
          currentTimestamp={timestampInSeconds}
          config={signalStrengthConfig}
          isLastChart={true}
          animate={activeChartIndex !== null && activeChartIndex >= 4}
          className={cn(
            "transition-all duration-300 delay-400",
            activeChartIndex === null || activeChartIndex < 4 ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}
        />
      </div>
    </ScrollArea>
  );
};

export default TelemetryGraphsPanel;
