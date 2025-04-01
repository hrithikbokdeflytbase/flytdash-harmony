import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { secondsToTime } from '../timeline/timelineUtils';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface TelemetryDataPoint {
  timestamp: number; // in seconds from flight start
  value: number;
  rawTime?: string; // HH:MM:SS format
}

export interface ThresholdConfig {
  value: number;
  color: string;
  label?: string;
}

export interface MetricChartConfig {
  title: string;
  icon?: React.ReactNode;
  unit: string;
  color: string;
  dataKey: string;
  minValue?: number;
  maxValue?: number;
  gradientFill?: boolean;
  decimals: number;
  thresholds?: ThresholdConfig[];
}

interface MetricChartProps {
  data: TelemetryDataPoint[];
  currentValue: number;
  currentTimestamp: number; // in seconds from flight start
  config: MetricChartConfig;
  isLastChart?: boolean;
  zoomLevel?: number; // Added zoom level prop
  animate?: boolean;
  className?: string;
}

export const MetricChart: React.FC<MetricChartProps> = ({
  data,
  currentValue,
  currentTimestamp,
  config,
  isLastChart = false,
  zoomLevel = 100, // Default to 100% if not provided
  animate = false,
  className
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TelemetryDataPoint | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const [thresholdOpacity, setThresholdOpacity] = useState(0.7);
  
  // Animation effect when component becomes visible
  useEffect(() => {
    if (animate) {
      setChartReady(true);
      
      // Animate thresholds in
      const timer = setTimeout(() => {
        setThresholdOpacity(0.2);
        setTimeout(() => setThresholdOpacity(0.7), 300);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [animate]);
  
  // Format the current value with the appropriate decimals and sign for vertical speed
  const formattedCurrentValue = useMemo(() => {
    // Special formatting for vertical speed to show + sign for positive values
    if (config.title === "Vertical Speed" && currentValue > 0) {
      return `+${currentValue.toFixed(config.decimals)}`;
    }
    return currentValue.toFixed(config.decimals);
  }, [currentValue, config.decimals, config.title]);

  // Find min and max values for the Y axis - ensure we capture full data variation
  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 100]; // Default if no data
    
    // If minValue and maxValue are both provided in config, use those
    if (config.minValue !== undefined && config.maxValue !== undefined) {
      return [config.minValue, config.maxValue];
    }
    
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
    // Special case for vertical speed to show sign
    if (config.title === "Vertical Speed") {
      if (value > 0) return `+${value}${config.unit}`;
      if (value < 0) return `${value}${config.unit}`;
      return `0${config.unit}`;
    }
    
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
    
    // Special case for vertical speed to ensure we have a 0 tick
    if (config.title === "Vertical Speed") {
      const ticks = [min, 0, max];
      // Add some intermediate values if the range is large enough
      if (Math.abs(min) > 2) ticks.splice(1, 0, min / 2);
      if (Math.abs(max) > 2) ticks.splice(3, 0, max / 2);
      return ticks;
    }
    
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
  }, [yDomain, config.title]);

  // Responsive chart height based on container width
  const chartHeight = 90;

  // Get current value position in chart for dot positioning
  const currentValuePosition = useMemo(() => {
    return {
      timestamp: currentTimestamp,
      value: currentValue
    };
  }, [currentTimestamp, currentValue]);

  // Handler for mouse move on the chart
  const handleMouseMove = useCallback((e: any) => {
    if (e && e.activePayload && e.activePayload.length) {
      const point = {
        timestamp: e.activePayload[0].payload.timestamp,
        value: e.activePayload[0].value
      };
      setHoveredPoint(point);
    }
  }, []);
  
  // Handler for mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  // Custom tooltip for hover info
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let displayValue = payload[0].value.toFixed(config.decimals);
      
      // Special formatting for vertical speed
      if (config.title === "Vertical Speed" && payload[0].value > 0) {
        displayValue = `+${displayValue}`;
      }
      
      return (
        <div className="bg-background-level-1 p-2 border border-outline-primary rounded shadow-lg text-xs backdrop-blur-sm animate-in fade-in duration-200">
          <p className="text-xs">{`Time: ${formatXAxis(label)}`}</p>
          <p className="text-xs font-medium" style={{ color: config.color }}>
            {`${config.title}: ${displayValue}${config.unit}`}
          </p>
        </div>
    );
    }
    return null;
  };

  return (
    <div 
      className={cn(
        "bg-background-level-2 rounded-md px-3 py-2 transition-all duration-300 shadow-sm hover:shadow-md", 
        chartReady ? "opacity-100" : "opacity-0 translate-y-2",
        className
      )}
      style={{height: `${chartHeight}px`}}
    >
      <div className="flex justify-between items-start">
        <div className="text-text-icon-01 text-sm font-medium flex items-center gap-1.5">
          {config.icon && (
            <div className={cn(
              "transition-all duration-300",
              chartReady ? "opacity-100" : "opacity-0 scale-90"
            )}>
              {config.icon}
            </div>
          )}
          {config.title}
        </div>
        <div className="text-text-icon-01 text-base font-medium tabular-nums transition-all duration-300">
          {formattedCurrentValue}{config.unit}
        </div>
      </div>

      <div className="w-full" style={{height: `${chartHeight - 25}px`}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visibleData}
            margin={{ top: 0, right: 2, bottom: 0, left: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={chartReady ? "opacity-100 transition-opacity duration-500" : "opacity-0"}
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
              className="transition-opacity duration-300"
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
              className="transition-all duration-300"
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
              className="transition-all duration-300"
            />

            {/* Threshold reference lines with animation */}
            {config.thresholds && config.thresholds.map((threshold, index) => (
              <ReferenceLine 
                key={`threshold-${index}`}
                y={threshold.value}
                stroke={threshold.color}
                strokeDasharray="3 3"
                strokeWidth={1.5}
                strokeOpacity={thresholdOpacity}
                className="transition-all duration-500"
              >
                {threshold.label && (
                  <text
                    x={25}
                    y={threshold.value > 0 ? -5 : 15}
                    textAnchor="start"
                    fill={threshold.color}
                    fontSize={9}
                    opacity={thresholdOpacity}
                    className="transition-opacity duration-500"
                  >
                    {threshold.label}
                  </text>
                )}
              </ReferenceLine>
            ))}

            {/* Reference line showing current timestamp - consistent style across all charts */}
            <ReferenceLine
              x={currentTimestamp}
              stroke="#FFFFFF"
              strokeWidth={1}
              opacity={0.3}
              isFront={true}
              className="transition-all duration-300 ease-out"
            />

            {/* Chart line with consistent thickness and smooth curve */}
            <Line
              type="monotoneX" // Use monotoneX for smoother curves with natural-looking interpolation
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2} // Consistent 2px thickness
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: config.color, 
                stroke: '#FFF',
                className: "transition-all duration-200"
              }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
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
                strokeWidth: 2,
                className: "animate-pulse"
              }}
              isAnimationActive={false}
            />

            {/* Highlight dot for hovered position */}
            {hoveredPoint && (
              <Line
                data={[hoveredPoint]}
                type="monotone"
                dataKey="value"
                stroke="none"
                dot={{
                  r: 5,
                  fill: '#FFFFFF',
                  stroke: config.color,
                  strokeWidth: 2,
                  className: "animate-pulse"
                }}
                isAnimationActive={false}
              />
            )}

            {/* Area under the line if gradient fill is enabled */}
            {config.gradientFill && (
              <Area
                type="monotoneX" // Match the line interpolation
                dataKey={config.dataKey}
                stroke="none"
                fillOpacity={1}
                fill={`url(#gradient-${config.title})`}
                isAnimationActive={true}
                animationDuration={1000}
                connectNulls={true} // Connect across null values
              />
            )}
            
            {/* Tooltip for interactive hover information */}
            <Tooltip 
              content={<CustomTooltip />} 
              animationDuration={200}
              animationEasing="ease-out"
              wrapperStyle={{ outline: "none" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Small panel indicator for current value - shown only on hover */}
      {hoveredPoint && (
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="absolute bottom-1 right-2 text-xs font-mono flex items-center opacity-75 hover:opacity-100 transition-opacity">
                <div 
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: config.color }} 
                />
                <span className="tabular-nums">
                  {formatXAxis(hoveredPoint.timestamp)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              <span>Click to jump to this time</span>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
