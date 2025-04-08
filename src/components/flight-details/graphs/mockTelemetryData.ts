
import { TelemetryDataPoint } from '../types/telemetryTypes';
import { secondsToTime } from '../timeline/timelineUtils';

// Interface for all telemetry history data
export interface TelemetryHistory {
  battery: TelemetryDataPoint[];
  altitude: TelemetryDataPoint[];
  horizontalSpeed: TelemetryDataPoint[];
  verticalSpeed: TelemetryDataPoint[];
  signal: TelemetryDataPoint[];
}

// Generate a more realistic and varied random walk with patterns
const generateSmoothRandomWalk = (
  length: number, 
  initialValue: number, 
  minValue: number, 
  maxValue: number, 
  volatility: number,
  patternType: 'decreasing' | 'wave' | 'peaks' | 'stable' = 'wave'
): number[] => {
  let value = initialValue;
  const result = [value];

  // Create pattern modifiers for more realistic data
  for (let i = 1; i < length; i++) {
    // Generate trend based on pattern type
    let trendFactor = 0;
    
    switch (patternType) {
      case 'decreasing':
        // Gradually decreasing trend with some recovery points
        trendFactor = -0.05 + (Math.sin(i / 20) * 0.02);
        break;
      case 'wave':
        // Sinusoidal wave pattern
        trendFactor = Math.sin(i / (length / 5) * Math.PI) * 0.3;
        break;
      case 'peaks':
        // Occasional peaks (like speed bursts)
        if (i % Math.floor(length / 7) === 0) {
          trendFactor = volatility * 2;
        } else if (i % Math.floor(length / 7) === 1) {
          trendFactor = -volatility * 1.5;
        } else {
          trendFactor = Math.sin(i / 30) * 0.1;
        }
        break;
      case 'stable':
        // Mostly stable with minor variations
        trendFactor = Math.sin(i / 10) * 0.05;
        break;
    }
    
    // Add some randomness
    const randomFactor = Math.random() < 0.1 ? 2 : 1;
    const movement = (Math.random() - 0.5) * volatility * randomFactor;
    
    // Update value with trend and movement
    value = value + movement + trendFactor;
    
    // Ensure we stay within bounds
    value = Math.max(minValue, Math.min(maxValue, value));
    
    result.push(value);
  }

  return result;
};

// Generate mock data for the telemetry charts with more realistic patterns
export const generateMockTelemetryHistory = (): TelemetryHistory => {
  // Flight duration in seconds (30 minutes)
  const flightDurationSeconds = 30 * 60;
  
  // Number of data points (1 point every 5 seconds for more detail)
  const numPoints = Math.floor(flightDurationSeconds / 5);
  
  // Generate timestamps (every 5 seconds)
  const timestamps = Array.from({ length: numPoints }, (_, i) => i * 5);
  
  // Generate battery data (starts at 100%, gradually decreases)
  const batteryValues = generateSmoothRandomWalk(numPoints, 100, 60, 100, 0.2, 'decreasing');
  
  // Generate altitude data with clear take-off, cruise, and landing phases
  let altitudeValues: number[] = [];
  
  // Take-off phase (first 15%)
  const takeoffLength = Math.floor(numPoints * 0.15);
  for (let i = 0; i < takeoffLength; i++) {
    const rampUpFactor = i / takeoffLength;
    altitudeValues.push(Math.min(120, 120 * rampUpFactor + (Math.random() - 0.5) * 2));
  }
  
  // Cruise phase with variations (middle 70%)
  const cruiseLength = Math.floor(numPoints * 0.7);
  const cruiseAltitude = generateSmoothRandomWalk(
    cruiseLength,
    altitudeValues[altitudeValues.length - 1] || 120,
    100,
    150,
    1,
    'wave'
  );
  altitudeValues = altitudeValues.concat(cruiseAltitude);
  
  // Landing phase (last 15%)
  const landingLength = numPoints - altitudeValues.length;
  const lastAltitude = altitudeValues[altitudeValues.length - 1] || 120;
  for (let i = 0; i < landingLength; i++) {
    const rampDownFactor = 1 - (i / landingLength);
    altitudeValues.push(Math.max(0, lastAltitude * rampDownFactor + (Math.random() - 0.5) * 2));
  }
  
  // Ensure we have exactly numPoints values
  if (altitudeValues.length < numPoints) {
    altitudeValues.push(...Array(numPoints - altitudeValues.length).fill(0));
  } else if (altitudeValues.length > numPoints) {
    altitudeValues = altitudeValues.slice(0, numPoints);
  }
  
  // Generate horizontal speed data with acceleration and deceleration patterns
  const horizontalSpeedValues = generateSmoothRandomWalk(numPoints, 0, 0, 15, 0.3, 'peaks');
  
  // Generate vertical speed data with more variance during altitude changes
  const verticalSpeedValues: number[] = [];
  
  // Calculate vertical speed based on altitude changes
  for (let i = 0; i < numPoints; i++) {
    if (i === 0) {
      verticalSpeedValues.push(0);
    } else {
      // Calculate rate of altitude change and convert to m/s
      const altChange = altitudeValues[i] - altitudeValues[i - 1];
      const timeInterval = 5; // seconds
      let vertSpeed = altChange / timeInterval;
      
      // Add some noise
      vertSpeed += (Math.random() - 0.5) * 0.2;
      
      // Clamp to realistic values
      vertSpeed = Math.max(-5, Math.min(5, vertSpeed));
      verticalSpeedValues.push(vertSpeed);
    }
  }
  
  // Generate signal data with occasional drops
  const signalValues = generateSmoothRandomWalk(numPoints, 95, 70, 100, 1, 'peaks');
  
  // Map values to data points with proper formatting
  const telemetryHistory: TelemetryHistory = {
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
  
  console.log('Generated telemetry history with points:', {
    batteryPointCount: telemetryHistory.battery.length,
    altitudePointCount: telemetryHistory.altitude.length,
    batteryFirstValue: telemetryHistory.battery[0]?.value,
    batteryLastValue: telemetryHistory.battery[telemetryHistory.battery.length - 1]?.value,
    altitudeFirstValue: telemetryHistory.altitude[0]?.value,
    altitudeLastValue: telemetryHistory.altitude[telemetryHistory.altitude.length - 1]?.value
  });
  
  return telemetryHistory;
};
