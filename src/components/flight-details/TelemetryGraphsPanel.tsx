
import React, { useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TelemetryData } from './TelemetryPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { timeToSeconds, secondsToTime } from './timeline/timelineUtils';

interface TelemetryGraphsPanelProps {
  timestamp: string;
  telemetryData: TelemetryData;
}

// Define a structure for time-series data points
interface TimeSeriesDataPoint {
  timestamp: number; // seconds from flight start
  value: number;
  time?: string; // formatted time
}

// Define mock history data (in production, this would come from API)
const generateMockHistoryData = (
  currentValue: number, 
  duration: number, // in seconds
  variability: number, 
  trend: 'stable' | 'increasing' | 'decreasing' | 'fluctuating' = 'stable'
): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
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
      time: secondsToTime(timestampSec)
    });
  }
  
  return data;
};

// Function to decimate data for performance
const decimateData = (data: TimeSeriesDataPoint[], maxPoints: number = 100): TimeSeriesDataPoint[] => {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  const result: TimeSeriesDataPoint[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    result.push(data[i]);
  }
  
  // Always include the last data point for continuity
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }
  
  return result;
};

// Function to calculate nice min/max values for axis
const calculateAxisDomain = (data: TimeSeriesDataPoint[]): [number, number] => {
  if (data.length === 0) return [0, 100];
  
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Add padding to the domain
  const padding = Math.max((max - min) * 0.1, 5);
  return [Math.max(0, min - padding), max + padding];
};

const TelemetryGraphsPanel: React.FC<TelemetryGraphsPanelProps> = ({
  timestamp,
  telemetryData
}) => {
  // Ensure current timestamp is consistent
  const timestampInSeconds = useMemo(() => timeToSeconds(timestamp), [timestamp]);
  
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

  // Common chart configuration
  const chartHeight = 150;
  const commonChartProps = {
    syncId: "telemetryTimeline",
    width: "100%",
    height: chartHeight,
    margin: { top: 10, right: 30, left: 10, bottom: 10 },
  };
  
  // Format for time axis and tooltip
  const formatTimeAxis = (value: number) => secondsToTime(value);
  
  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 space-y-6">
        {/* Battery Percentage Graph */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Battery</h3>
          <div className="h-[150px]">
            <ResponsiveContainer {...commonChartProps}>
              <LineChart data={decimateData(batteryData)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number"
                  tickFormatter={formatTimeAxis} 
                  stroke="rgba(255,255,255,0.4)"
                />
                <YAxis 
                  domain={calculateAxisDomain(batteryData)} 
                  stroke="rgba(255,255,255,0.4)"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Battery']}
                  labelFormatter={formatTimeAxis}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <ReferenceLine 
                  x={timestampInSeconds} 
                  stroke="#FFFFFF" 
                  strokeWidth={1}
                  opacity={0.7}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Altitude Graph */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Altitude</h3>
          <div className="h-[150px]">
            <ResponsiveContainer {...commonChartProps}>
              <LineChart data={decimateData(altitudeData)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number"
                  tickFormatter={formatTimeAxis} 
                  stroke="rgba(255,255,255,0.4)"
                />
                <YAxis 
                  domain={calculateAxisDomain(altitudeData)} 
                  stroke="rgba(255,255,255,0.4)"
                  tickFormatter={(value) => `${value.toFixed(1)}m`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}m`, 'Altitude']}
                  labelFormatter={formatTimeAxis}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#496DC8" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <ReferenceLine 
                  x={timestampInSeconds} 
                  stroke="#FFFFFF" 
                  strokeWidth={1}
                  opacity={0.7}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Speed Graph */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Horizontal Speed</h3>
          <div className="h-[150px]">
            <ResponsiveContainer {...commonChartProps}>
              <LineChart data={decimateData(horizontalSpeedData)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number"
                  tickFormatter={formatTimeAxis} 
                  stroke="rgba(255,255,255,0.4)"
                />
                <YAxis 
                  domain={calculateAxisDomain(horizontalSpeedData)} 
                  stroke="rgba(255,255,255,0.4)"
                  tickFormatter={(value) => `${value.toFixed(1)}m/s`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}m/s`, 'Horizontal Speed']}
                  labelFormatter={formatTimeAxis}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <ReferenceLine 
                  x={timestampInSeconds} 
                  stroke="#FFFFFF" 
                  strokeWidth={1}
                  opacity={0.7}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vertical Speed Graph */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Vertical Speed</h3>
          <div className="h-[150px]">
            <ResponsiveContainer {...commonChartProps}>
              <LineChart data={decimateData(verticalSpeedData)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number"
                  tickFormatter={formatTimeAxis} 
                  stroke="rgba(255,255,255,0.4)"
                />
                <YAxis 
                  domain={calculateAxisDomain(verticalSpeedData)} 
                  stroke="rgba(255,255,255,0.4)"
                  tickFormatter={(value) => `${value.toFixed(1)}m/s`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}m/s`, 'Vertical Speed']}
                  labelFormatter={formatTimeAxis}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#14B8A6" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <ReferenceLine 
                  x={timestampInSeconds} 
                  stroke="#FFFFFF" 
                  strokeWidth={1}
                  opacity={0.7}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Signal Strength Graph */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#262627] p-4">
          <h3 className="text-[rgba(255,255,255,0.84)] text-lg font-medium mb-2">Signal Strength</h3>
          <div className="h-[150px]">
            <ResponsiveContainer {...commonChartProps}>
              <LineChart data={decimateData(signalStrengthData)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number"
                  tickFormatter={formatTimeAxis} 
                  stroke="rgba(255,255,255,0.4)"
                />
                <YAxis 
                  domain={calculateAxisDomain(signalStrengthData)} 
                  stroke="rgba(255,255,255,0.4)"
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(0)}%`, 'Signal Strength']}
                  labelFormatter={formatTimeAxis}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#A5F3FC" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <ReferenceLine 
                  x={timestampInSeconds} 
                  stroke="#FFFFFF" 
                  strokeWidth={1}
                  opacity={0.7}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default TelemetryGraphsPanel;
