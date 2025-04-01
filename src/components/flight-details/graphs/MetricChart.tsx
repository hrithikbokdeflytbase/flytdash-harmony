
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
import { Battery, ArrowUp, ArrowDown } from 'lucide-react';

export interface TelemetryDataPoint {
  timestamp: number; // in seconds from flight start
  value: number;
  rawTime?: string; // HH:MM:SS format
}

export interface ThresholdLine {
  value: number;
  color: string;
  strokeDasharray?: string;
  label?: string;
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
  icon?: React.ReactNode;
  thresholds?: ThresholdLine[];
  valuePrefix?: string;
  valueSuffix?: string;
  formatYAxis?: (value: number) => string;
}

interface MetricChartProps {
  data: TelemetryDataPoint[];
  currentValue: number;
  currentTimestamp: number; // in seconds from flight start
  config: MetricChartConfig;
  isLastChart?: boolean;
  zoomLevel?: number; // Added zoom level prop
  trendDirection?: 'up' | 'down' | 'stable';
}

export const MetricChart: React.FC<MetricChartProps> = ({
  data,
  currentValue,
  currentTimestamp,
  config,
  isLastChart = false,
  zoomLevel = 100, // Default to 100% if not provided
  trendDirection
}) => {
  // Format the current value with the appropriate decimals
  const formattedCurrentValue = useMemo(() => {
    return currentValue.toFixed(config.decimals);
  }, [currentValue, config.decimals]);

  // Find min and max values for the Y axis
  const yDomain = useMemo(() => {
    const values = data.map(d => d.value);
    const minValue = config.minValue !== undefined ? config.minValue : Math.min(...values) * 0.9;
    const maxValue = config.maxValue !== undefined ? config.maxValue : Math.max(...values) * 1.1;
    return [minValue, maxValue];
  }, [data, config.minValue, config.maxValue]);

  // Format timestamp for hover tooltip
  const formatXAxis = (value: number) => {
    return secondsToTime(value);
  };

  // Format the Y axis with the unit
  const formatYAxis = (value: number) => {
    if (config.formatYAxis) {
      return config.formatYAxis(value);
    }
    return `${value}${config.unit}`;
  };

  // Decimate data if there are too many points (performance optimization)
  const decimatedData = useMemo(() => {
    if (data.length <= 100) return data;
    
    // Simple decimation by picking evenly spaced points
    const factor = Math.ceil(data.length / 100);
    return data.filter((_, index) => index % factor === 0);
  }, [data]);

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

  // Keep chart height fixed regardless of zoom level
  const chartHeight = 90;

  // Get trend indicator component
  const getTrendIndicator = () => {
    if (!trendDirection) return null;
    
    switch(trendDirection) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-success ml-1" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-destructive ml-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background-level-2 rounded-md p-4" style={{height: `${chartHeight}px`}}>
      <div className="flex justify-between items-start mb-1">
        <div className="text-text-icon-01 text-sm font-medium flex items-center">
          {config.icon && <span className="mr-1.5">{config.icon}</span>}
          {config.title}
        </div>
        <div className="text-text-icon-01 text-base font-medium tabular-nums flex items-center">
          {config.valuePrefix && <span className="mr-1">{config.valuePrefix}</span>}
          {formattedCurrentValue}{config.unit}
          {config.valueSuffix && <span className="ml-1">{config.valueSuffix}</span>}
          {getTrendIndicator()}
        </div>
      </div>

      <div className="w-full" style={{height: `${chartHeight - 30}px`}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visibleData}
            margin={{ top: 0, right: 0, bottom: 0, left: 35 }} // Increase left margin to prevent label cutoff
          >
            <defs>
              {config.gradientFill && (
                <linearGradient id={`gradient-${config.title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.2} />
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
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.54)' }}
              width={35} // Increase Y-axis width to prevent label cutoff
            />

            {/* Reference line showing current timestamp */}
            <ReferenceLine
              x={currentTimestamp}
              stroke="#FFFFFF"
              strokeWidth={1}
              strokeDasharray="3 2"
              opacity={0.7}
            />

            {/* Threshold lines if provided */}
            {config.thresholds && config.thresholds.map((threshold, idx) => (
              <ReferenceLine
                key={`threshold-${idx}`}
                y={threshold.value}
                stroke={threshold.color}
                strokeDasharray={threshold.strokeDasharray || "3 3"}
                label={{
                  value: threshold.label || '',
                  position: 'right',
                  fill: threshold.color,
                  fontSize: 10,
                }}
              />
            ))}

            {/* Chart line */}
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: config.color, stroke: '#FFF' }}
              isAnimationActive={false} // Disable animation for better performance
            />

            {/* Area under the line if gradient fill is enabled */}
            {config.gradientFill && (
              <Area
                type="monotone"
                dataKey={config.dataKey}
                stroke="none"
                fillOpacity={1}
                fill={`url(#gradient-${config.title})`}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
