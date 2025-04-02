
import React, { useMemo, useRef, useEffect } from 'react';
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
  height?: number; // Height of the chart in pixels
}

export const MetricChart: React.FC<MetricChartProps> = ({
  data,
  currentValue,
  currentTimestamp,
  config,
  isLastChart = false,
  zoomLevel = 100, // Default to 100% if not provided
  height = 140, // Default height of 140px
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
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
    if (!data || data.length === 0) return [0, 100]; // Default if no data
    
    // If minValue and maxValue are both provided in config, use those
    if (config.minValue !== undefined && config.maxValue !== undefined) {
      return [config.minValue, config.maxValue];
    }
    
    // Calculate actual min/max from data points
    const values = data.map(d => d.value);
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

  // Calculate nice round Y-axis ticks for better readability
  const calculateYAxisTicks = useMemo(() => {
    const [min, max] = yDomain;
    const range = max - min;
    
    // Special case for vertical speed to ensure we have a 0 tick
    if (config.title === "Vertical Speed") {
      // For vertical speed, always include 0 and symmetrically add ticks
      const ticks = [min, -2.5, 0, 2.5, max];
      return ticks.filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
    }
    
    // For battery, ensure we have 0, 25, 50, 75, 100
    if (config.title === "Battery") {
      return [0, 25, 50, 75, 100];
    }
    
    // Choose appropriate step size based on range
    let step: number;
    if (range <= 1) step = 0.2;
    else if (range <= 5) step = 1;
    else if (range <= 20) step = 5;
    else if (range <= 50) step = 10;
    else if (range <= 100) step = 25;
    else step = Math.ceil(range / 5 / 100) * 100;
    
    // Generate nice round ticks
    const ticks: number[] = [];
    for (let i = Math.floor(min / step) * step; i <= max; i += step) {
      ticks.push(parseFloat(i.toFixed(1)));
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

  // Find nearest data point to the current timestamp
  const nearestDataPoint = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    let closestPoint = data[0];
    let minDistance = Math.abs(closestPoint.timestamp - currentTimestamp);
    
    for (let i = 1; i < data.length; i++) {
      const distance = Math.abs(data[i].timestamp - currentTimestamp);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = data[i];
      }
    }
    
    return closestPoint;
  }, [data, currentTimestamp]);

  // Custom tooltip for hover info
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let displayValue = payload[0].value.toFixed(config.decimals);
      
      // Special formatting for vertical speed
      if (config.title === "Vertical Speed" && payload[0].value > 0) {
        displayValue = `+${displayValue}`;
      }
      
      return (
        <div className="bg-background-level-1 p-2 border border-outline-primary rounded shadow text-xs">
          <p className="text-xs">{`Time: ${formatXAxis(label)}`}</p>
          <p className="text-xs font-medium" style={{ color: config.color }}>
            {`${config.title}: ${displayValue}${config.unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Ensure the Y-axis shows the full range of values
  const yAxisDomain = useMemo(() => {
    let [min, max] = yDomain;
    
    // For battery, always show 0-100% range
    if (config.title === "Battery") {
      return [0, 100];
    }
    
    // For vertical speed, ensure we include 0 in the domain
    if (config.title === "Vertical Speed") {
      min = Math.min(min, -3);
      max = Math.max(max, 3);
      return [min, max];
    }
    
    // For altitude and other metrics, ensure we have a reasonable range
    if (config.title.includes("Altitude")) {
      // Make sure altitude starts from 0 unless we have negative values
      min = min < 0 ? min : 0;
      // Add some headroom on top
      max = max * 1.1;
    }
    
    return [min, max];
  }, [yDomain, config.title]);

  return (
    <div 
      className="bg-background-level-2 rounded-md overflow-hidden mb-4"
      style={{
        borderBottom: !isLastChart ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
      }}
      ref={chartRef}
    >
      <div className="flex justify-between items-start py-4 px-0">
        <div className="text-text-icon-01 text-sm font-medium flex items-center gap-2 ml-4">
          {config.icon && config.icon}
          {config.title}
        </div>
        <div 
          className="text-text-icon-01 text-base font-medium tabular-nums mr-4 transition-all duration-200"
          key={`${currentValue}-${config.title}`}
        >
          {formattedCurrentValue}{config.unit}
        </div>
      </div>

      <div className="w-full px-0 pb-4">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, bottom: isLastChart ? 20 : 5, left: 30 }}
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
              domain={yAxisDomain}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.54)' }}
              width={45} // Increased Y-axis width for better label display
              ticks={calculateYAxisTicks} // Use calculated nice round ticks
              interval={0} // Show all calculated ticks
              padding={{ top: 10, bottom: 10 }}
            />

            {/* Threshold reference lines */}
            {config.thresholds && config.thresholds.map((threshold, index) => (
              <ReferenceLine 
                key={`threshold-${index}`}
                y={threshold.value}
                stroke={threshold.color}
                strokeDasharray="3 3"
                strokeWidth={1.5}
              >
                {threshold.label && (
                  <text
                    x={30}
                    y={threshold.value > 0 ? -8 : 16}
                    textAnchor="start"
                    fill={threshold.color}
                    fontSize={9}
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
              opacity={0.8}
              isFront={true}
              className="timeline-indicator"
            />

            {/* Chart line with consistent thickness and smooth curve */}
            <Line
              type="monotoneX"
              dataKey="value"
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: config.color, stroke: '#FFF' }}
              isAnimationActive={false}
              connectNulls={true}
            />

            {/* Add visible dot at current position - uses nearest data point */}
            {nearestDataPoint && (
              <Line
                data={[{ 
                  timestamp: nearestDataPoint.timestamp, 
                  value: nearestDataPoint.value 
                }]}
                type="monotone"
                dataKey="value"
                stroke="none"
                dot={{
                  r: 5,
                  fill: '#FFFFFF',
                  stroke: config.color,
                  strokeWidth: 2
                }}
                isAnimationActive={false}
              />
            )}

            {/* Area under the line if gradient fill is enabled */}
            {config.gradientFill && (
              <Area
                type="monotoneX"
                dataKey="value"
                stroke="none"
                fillOpacity={1}
                fill={`url(#gradient-${config.title})`}
                isAnimationActive={false}
                connectNulls={true}
              />
            )}
            
            <Tooltip content={<CustomTooltip />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
