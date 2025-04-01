import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
} from 'recharts';
import { cn } from '@/lib/utils';
import { secondsToTime } from '../timeline/timelineUtils';

export interface TelemetryDataPoint {
  timestamp: number; // in seconds from flight start
  value: number;
  rawTime?: string; // HH:MM:SS format
}

export interface MetricChartConfig {
  title: string;
  unit: string;
  color: string;
  dataKey: string;
  minValue?: number;
  maxValue?: number;
  gradientFill?: boolean;
  decimals: number;
}

interface MetricChartProps {
  data: TelemetryDataPoint[];
  currentValue: number;
  currentTimestamp: number; // in seconds from flight start
  config: MetricChartConfig;
  isLastChart?: boolean;
  zoomLevel?: number; // Added zoom level prop
}

export const MetricChart: React.FC<MetricChartProps> = ({
  data,
  currentValue,
  currentTimestamp,
  config,
  isLastChart = false,
  zoomLevel = 100 // Default to 100% if not provided
}) => {
  // Format the current value with the appropriate decimals
  const formattedCurrentValue = useMemo(() => {
    return currentValue.toFixed(config.decimals);
  }, [currentValue, config.decimals]);

  // Find min and max values for the Y axis - ensure we capture full data variation
  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 100]; // Default if no data
    
    const values = data.map(d => d.value);
    
    // Calculate actual min/max from data points
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    
    // Ensure there's always some visible variation (at least 10% of the max value)
    const variation = Math.max((dataMax - dataMin), dataMax * 0.1);
    
    // Apply config constraints if provided
    let minValue = config.minValue !== undefined ? config.minValue : Math.floor(dataMin - variation * 0.1);
    let maxValue = config.maxValue !== undefined ? config.maxValue : Math.ceil(dataMax + variation * 0.1);
    
    // Ensure min and max are different
    if (minValue === maxValue) {
      minValue = minValue - 1;
      maxValue = maxValue + 1;
    }
    
    return [minValue, maxValue];
  }, [data, config.minValue, config.maxValue]);

  // Format timestamp for hover tooltip
  const formatXAxis = (value: number) => {
    return secondsToTime(value);
  };

  // Format the Y axis with the unit
  const formatYAxis = (value: number) => {
    // Use different precision based on the value range and type
    let formattedValue: string;
    
    if (Math.abs(yDomain[1] - yDomain[0]) > 100) {
      // Large range values - use no decimals
      formattedValue = Math.round(value).toString();
    } else if (config.decimals === 0) {
      // Integer values
      formattedValue = Math.round(value).toString();
    } else {
      // Use specified decimal precision but avoid trailing zeros
      formattedValue = parseFloat(value.toFixed(config.decimals)).toString();
    }
    
    return `${formattedValue}${config.unit}`;
  };

  // Process data to ensure no gaps or breaks in visualization
  const processedData = useMemo(() => {
    if (data.length <= 1) return data;
    
    // Ensure data is sorted by timestamp
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    
    // Fill any gaps in data with interpolated values
    const result: TelemetryDataPoint[] = [];
    
    for (let i = 0; i < sortedData.length - 1; i++) {
      const current = sortedData[i];
      const next = sortedData[i + 1];
      result.push(current);
      
      // Check if there's a significant gap (more than 30 seconds)
      if (next.timestamp - current.timestamp > 30) {
        // Add interpolated points
        const timeGap = next.timestamp - current.timestamp;
        const valueChange = next.value - current.value;
        const steps = Math.min(5, Math.floor(timeGap / 10)); // Add at most 5 points
        
        for (let step = 1; step <= steps; step++) {
          const interpolatedTime = current.timestamp + (timeGap * step) / (steps + 1);
          const interpolatedValue = current.value + (valueChange * step) / (steps + 1);
          result.push({
            timestamp: interpolatedTime,
            value: interpolatedValue,
            rawTime: secondsToTime(interpolatedTime)
          });
        }
      }
    }
    
    // Add the last point
    if (sortedData.length > 0) {
      result.push(sortedData[sortedData.length - 1]);
    }
    
    return result;
  }, [data]);
  
  // Decimate data if there are too many points (performance optimization)
  const decimatedData = useMemo(() => {
    if (processedData.length <= 100) return processedData;
    
    // Ensure we keep enough detail for proper visualization
    // Use a more intelligent approach - keep min/max points in each segment
    const factor = Math.ceil(processedData.length / 100);
    const result: TelemetryDataPoint[] = [];
    
    for (let i = 0; i < processedData.length; i += factor) {
      const segment = processedData.slice(i, i + factor);
      
      // Always include the first point in the segment
      result.push(segment[0]);
      
      // If segment has more than 2 points, add min and max points if they're different
      if (segment.length > 2) {
        // Find min and max values in segment
        let minPoint = segment[0];
        let maxPoint = segment[0];
        
        for (let j = 1; j < segment.length; j++) {
          if (segment[j].value < minPoint.value) minPoint = segment[j];
          if (segment[j].value > maxPoint.value) maxPoint = segment[j];
        }
        
        // Add min and max points if they're different from the first point
        if (minPoint !== segment[0] && !result.includes(minPoint)) {
          result.push(minPoint);
        }
        
        if (maxPoint !== segment[0] && maxPoint !== minPoint && !result.includes(maxPoint)) {
          result.push(maxPoint);
        }
      }
    }
    
    // Make sure we include the last data point
    const lastPoint = processedData[processedData.length - 1];
    if (!result.includes(lastPoint)) {
      result.push(lastPoint);
    }
    
    // Sort by timestamp to ensure proper rendering
    return result.sort((a, b) => a.timestamp - b.timestamp);
  }, [processedData]);

  // Filter data to only show points within visible range based on zoom
  const visibleData = useMemo(() => {
    if (zoomLevel === 100) {
      return decimatedData;
    }
    
    // Calculate the visible range based on zoom level
    const dataCenter = currentTimestamp;
    const totalRange = data.length > 0 ? 
      Math.max(...data.map(d => d.timestamp)) - Math.min(...data.map(d => d.timestamp)) : 0;
    const visibleRange = totalRange * (100 / zoomLevel);
    
    const startTime = dataCenter - (visibleRange / 2);
    const endTime = dataCenter + (visibleRange / 2);
    
    return decimatedData.filter(d => d.timestamp >= startTime && d.timestamp <= endTime);
  }, [decimatedData, zoomLevel, currentTimestamp, data]);

  // Calculate nice round Y-axis ticks for better readability
  const calculateYAxisTicks = useMemo(() => {
    const [min, max] = yDomain;
    const range = max - min;
    
    // Choose appropriate step size based on range
    let step: number;
    if (range <= 1) step = 0.2;
    else if (range <= 5) step = 1;
    else if (range <= 20) step = 5;
    else if (range <= 50) step = 10;
    else if (range <= 100) step = 25;
    else if (range <= 500) step = 100;
    else step = Math.ceil(range / 5 / 100) * 100;
    
    // Generate nice round ticks
    const ticks: number[] = [];
    for (let i = Math.floor(min / step) * step; i <= max; i += step) {
      ticks.push(i);
    }
    
    // Make sure we have at least min and max
    if (!ticks.includes(min)) ticks.unshift(min);
    if (!ticks.includes(max)) ticks.push(max);
    
    // Limit to at most 6 ticks for readability
    if (ticks.length > 6) {
      const newTicks = [];
      const stride = Math.floor(ticks.length / 5);
      for (let i = 0; i < ticks.length; i += stride) {
        newTicks.push(ticks[i]);
      }
      if (!newTicks.includes(ticks[ticks.length - 1])) {
        newTicks.push(ticks[ticks.length - 1]);
      }
      return newTicks;
    }
    
    return ticks;
  }, [yDomain]);

  // Keep chart height fixed regardless of zoom level
  const chartHeight = 90;

  // Get current value position in chart for dot positioning
  const currentValuePosition = useMemo(() => {
    return {
      timestamp: currentTimestamp,
      value: currentValue
    };
  }, [currentTimestamp, currentValue]);

  return (
    <div className="bg-background-level-2 rounded-md px-3 py-2" style={{height: `${chartHeight}px`}}>
      <div className="flex justify-between items-start">
        <div className="text-text-icon-01 text-sm font-medium">
          {config.title}
        </div>
        <div className="text-text-icon-01 text-base font-medium tabular-nums">
          {formattedCurrentValue}{config.unit}
        </div>
      </div>

      <div className="w-full" style={{height: `${chartHeight - 25}px`}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visibleData}
            margin={{ top: 0, right: 2, bottom: 0, left: 20 }} // Minimized margins to maximize space
          >
            <defs>
              {config.gradientFill && (
                <linearGradient id={`gradient-${config.title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.08)"
              horizontalPoints={[0, 25, 50, 75, 100]} // Ensure grid lines extend full width
            />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatXAxis}
              tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.54)' }}
              hide={!isLastChart} // Only show X axis on the last chart
            />

            <YAxis
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.54)' }}
              width={18} // Minimized Y-axis width to optimize space
              ticks={calculateYAxisTicks} // Use calculated nice round ticks
              interval={0} // Show all calculated ticks
            />

            {/* Reference line showing current timestamp - consistent style across all charts */}
            <ReferenceLine
              x={currentTimestamp}
              stroke="#FFFFFF"
              strokeWidth={1}
              opacity={0.3}
              isFront={true}
            />

            {/* Chart line with consistent thickness and smooth curve */}
            <Line
              type="monotoneX" // Use monotoneX for smoother curves with natural-looking interpolation
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2} // Consistent 2px thickness
              dot={false}
              activeDot={{ r: 4, fill: config.color, stroke: '#FFF' }}
              isAnimationActive={false} // Disable animation for better performance
              connectNulls={true} // Connect across null/undefined values to avoid breaks
            />

            {/* Add visible dot at current position */}
            <Line
              data={[currentValuePosition]}
              type="monotone"
              dataKey="value"
              stroke="none"
              dot={{
                r: 4,
                fill: config.color,
                stroke: '#FFFFFF',
                strokeWidth: 2
              }}
              isAnimationActive={false}
            />

            {/* Area under the line if gradient fill is enabled */}
            {config.gradientFill && (
              <Area
                type="monotoneX" // Match the line interpolation
                dataKey={config.dataKey}
                stroke="none"
                fillOpacity={1}
                fill={`url(#gradient-${config.title})`}
                isAnimationActive={false}
                connectNulls={true} // Connect across null values
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
