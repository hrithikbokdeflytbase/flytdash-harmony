
// Generate realistic mock telemetry data for visualization
import { TelemetryDataPoint } from './MetricChart';
import { secondsToTime } from '../timeline/timelineUtils';

// Helper to get realistic data curve with some randomness
function generateCurve(
  duration: number, 
  pointCount: number, 
  minValue: number, 
  maxValue: number, 
  pattern: 'rising' | 'falling' | 'fluctuating' | 'stable' | 'sinusoidal' = 'fluctuating'
): TelemetryDataPoint[] {
  const data: TelemetryDataPoint[] = [];
  const timeStep = duration / (pointCount - 1);
  
  // Helper to add some realistic noise to the data
  const addNoise = (value: number, noiseAmount: number = 0.02) => {
    const noise = (Math.random() - 0.5) * 2 * noiseAmount * (maxValue - minValue);
    return Math.max(minValue, Math.min(maxValue, value + noise));
  };

  // Generate initial value within the specified range
  let initialValue: number;
  
  switch (pattern) {
    case 'rising':
      initialValue = minValue + (maxValue - minValue) * 0.1;
      break;
    case 'falling':
      initialValue = minValue + (maxValue - minValue) * 0.9;
      break;
    case 'stable':
      initialValue = minValue + (maxValue - minValue) * 0.5;
      break;
    case 'sinusoidal':
    case 'fluctuating':
    default:
      initialValue = minValue + (maxValue - minValue) * 0.5;
      break;
  }
  
  for (let i = 0; i < pointCount; i++) {
    const timestamp = i * timeStep;
    
    let value: number;
    
    switch (pattern) {
      case 'rising':
        // Gradually increasing value with some natural curves and noise
        value = initialValue + (maxValue - initialValue) * (i / pointCount) ** 1.2;
        value = addNoise(value);
        break;
        
      case 'falling':
        // Gradually decreasing value with some natural curves and noise
        value = initialValue - (initialValue - minValue) * (i / pointCount) ** 0.8;
        value = addNoise(value);
        break;
        
      case 'stable':
        // Relatively stable value with minor fluctuations
        const stableMean = initialValue;
        value = stableMean + addNoise(0, 0.01);
        break;
        
      case 'sinusoidal':
        // Sinusoidal pattern (good for altitude, vertical speed, etc.)
        const range = (maxValue - minValue) * 0.4;
        const centerValue = minValue + (maxValue - minValue) * 0.5;
        const cycles = 3 + Math.random() * 2; // 3-5 cycles over the time period
        value = centerValue + Math.sin(i / pointCount * Math.PI * 2 * cycles) * range;
        value = addNoise(value, 0.02);
        break;
        
      case 'fluctuating':
      default:
        // Random but somewhat correlated fluctuations (natural patterns)
        if (i === 0) {
          value = initialValue;
        } else {
          const prevValue = data[i-1].value;
          const maxChange = (maxValue - minValue) * 0.015; 
          const change = (Math.random() - 0.5) * 2 * maxChange;
          
          // Tendency to return to middle
          const meanReversionFactor = 0.05;
          const midPoint = (minValue + maxValue) / 2;
          const meanReversion = (midPoint - prevValue) * meanReversionFactor;
          
          value = prevValue + change + meanReversion;
          value = Math.max(minValue, Math.min(maxValue, value));
        }
        break;
    }
    
    // Add datapoint
    data.push({
      timestamp,
      value,
      rawTime: secondsToTime(timestamp)
    });
  }
  
  return data;
}

// Get battery discharge pattern - naturally declining with ocasional recoveries
function generateBatteryData(duration: number, pointCount: number): TelemetryDataPoint[] {
  // Start with a natural curve
  const baseCurve = generateCurve(duration, pointCount, 70, 100, 'falling');
  
  // Now transform it to make it more battery-like
  let lastValue = 100; // Start at full charge
  const result: TelemetryDataPoint[] = [];
  
  // Ensure the first point is at 100%
  result.push({
    timestamp: 0,
    value: 100,
    rawTime: secondsToTime(0)
  });
  
  // Generate the rest with a natural battery discharge pattern
  for (let i = 1; i < pointCount; i++) {
    const time = baseCurve[i].timestamp;
    
    // Non-linear discharge rate: faster at beginning and end, slower in middle
    const normalizedTime = time / duration;
    
    // Battery discharge often follows a non-linear curve
    // More drain during takeoff and landing, less during cruise
    const dischargeRate = 
      normalizedTime < 0.2 ? 0.4 : // Higher rate at beginning (takeoff)
      normalizedTime > 0.8 ? 0.5 : // Higher rate at end (low battery)
      0.25; // Lower rate in middle (cruise)
      
    // Calculate non-linear discharge
    lastValue = lastValue - dischargeRate * (time - baseCurve[i-1].timestamp) / 60;
    
    // Occasional small battery recoveries
    if (Math.random() > 0.95) {
      lastValue += 0.1 + Math.random() * 0.2;
    }
    
    // Add some slight noise
    const noise = (Math.random() - 0.5) * 0.2;
    lastValue = Math.max(0, Math.min(100, lastValue + noise));
    
    result.push({
      timestamp: time,
      value: lastValue,
      rawTime: secondsToTime(time)
    });
  }
  
  return result;
}

// Main function to generate telemetry data for all metrics
export const generateMockTelemetryHistory = (
  pointCount: number = 250,
  duration: number = 19800 // 5.5 hours in seconds (typical drone flight)
) => {
  // Generate different data patterns for each telemetry metric
  return {
    battery: generateBatteryData(duration, pointCount),
    
    altitude: generateCurve(
      duration, 
      pointCount, 
      0,  // Min altitude (ground level)
      150, // Max altitude
      'sinusoidal' // Altitude tends to have peaks and valleys
    ),
    
    horizontalSpeed: generateCurve(
      duration,
      pointCount,
      0,  // Min speed
      15, // Max speed
      'fluctuating' // Speed varies but with correlation
    ),
    
    verticalSpeed: generateCurve(
      duration,
      pointCount,
      -5, // Max descent speed
      5,  // Max ascent speed
      'sinusoidal' // Vertical speed oscillates between climb and descent
    ),
    
    signal: generateCurve(
      duration,
      pointCount,
      60,  // Minimum acceptable signal
      100, // Max signal
      'fluctuating' // Signal strength fluctuates
    )
  };
};
