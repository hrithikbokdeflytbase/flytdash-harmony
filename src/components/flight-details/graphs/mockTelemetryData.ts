
import { TelemetryDataPoint } from './MetricChart';
import { secondsToTime } from '../timeline/timelineUtils';

// Interface for all telemetry history data
export interface TelemetryHistory {
  battery: TelemetryDataPoint[];
  altitude: TelemetryDataPoint[];
  horizontalSpeed: TelemetryDataPoint[];
  verticalSpeed: TelemetryDataPoint[];
  signal: TelemetryDataPoint[];
}

// Generate a smooth-ish random walk
const generateSmoothRandomWalk = (
  length: number, 
  initialValue: number, 
  minValue: number, 
  maxValue: number, 
  volatility: number
): number[] => {
  let value = initialValue;
  const result = [value];

  for (let i = 1; i < length; i++) {
    // Generate a trend over time (can be customized for each metric)
    const trendFactor = Math.sin(i / length * Math.PI) * 0.3;
    
    // Generate random movement
    const movement = (Math.random() - 0.5) * volatility;
    
    // Update value with trend and random movement
    value = value + movement + trendFactor;
    
    // Clamp value to min/max
    value = Math.max(minValue, Math.min(maxValue, value));
    
    result.push(value);
  }

  return result;
};

// Generate mock data for the telemetry charts
export const generateMockTelemetryHistory = (): TelemetryHistory => {
  // Flight duration in seconds (30 minutes)
  const flightDurationSeconds = 30 * 60;
  
  // Number of data points (1 point every 10 seconds)
  const numPoints = flightDurationSeconds / 10;
  
  // Generate timestamps (every 10 seconds)
  const timestamps = Array.from({ length: numPoints }, (_, i) => i * 10);
  
  // Generate battery data (starts at 100%, gradually decreases)
  const batteryValues = generateSmoothRandomWalk(numPoints, 100, 60, 100, 0.3);
  
  // Generate altitude data
  const altitudeValues = generateSmoothRandomWalk(numPoints, 0, 0, 150, 1.5);
  
  // Generate horizontal speed data
  const horizontalSpeedValues = generateSmoothRandomWalk(numPoints, 0, 0, 15, 0.5);
  
  // Generate vertical speed data (can be negative for descent)
  const verticalSpeedValues = generateSmoothRandomWalk(numPoints, 0, -5, 5, 0.3);
  
  // Generate signal data
  const signalValues = generateSmoothRandomWalk(numPoints, 90, 70, 100, 3);
  
  // Map values to data points
  return {
    battery: timestamps.map((timestamp, i) => ({
      timestamp,
      value: batteryValues[i],
      rawTime: secondsToTime(timestamp)
    })),
    altitude: timestamps.map((timestamp, i) => ({
      timestamp,
      value: altitudeValues[i],
      rawTime: secondsToTime(timestamp)
    })),
    horizontalSpeed: timestamps.map((timestamp, i) => ({
      timestamp,
      value: horizontalSpeedValues[i],
      rawTime: secondsToTime(timestamp)
    })),
    verticalSpeed: timestamps.map((timestamp, i) => ({
      timestamp,
      value: verticalSpeedValues[i],
      rawTime: secondsToTime(timestamp)
    })),
    signal: timestamps.map((timestamp, i) => ({
      timestamp,
      value: signalValues[i],
      rawTime: secondsToTime(timestamp)
    }))
  };
};
