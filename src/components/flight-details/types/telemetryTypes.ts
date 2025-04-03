
import React from 'react';

/**
 * TelemetryMetricCardProps - Props for the TelemetryMetricCard component.
 */
export interface TelemetryMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  showTrend?: boolean;
  trendDirection?: 'up' | 'down' | 'stable';
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

/**
 * AltitudeData - Altitude information.
 */
export interface AltitudeData {
  value: number;
  unit: string;
  mode: 'AGL' | 'ASL' | 'RLT';
}

/**
 * DistanceData - Distance information.
 */
export interface DistanceData {
  value: number;
  unit: string;
}

/**
 * SpeedData - Speed information.
 */
export interface SpeedData {
  value: number;
  unit: string;
}

/**
 * HeadingData - Heading information.
 */
export interface HeadingData {
  value: number;
  direction: string;
}

/**
 * TelemetryMetricsGridProps - Props for the TelemetryMetricsGrid component.
 */
export interface TelemetryMetricsGridProps {
  altitude: AltitudeData;
  distance: DistanceData;
  horizontalSpeed: SpeedData;
  verticalSpeed: SpeedData;
  onAltitudeModeToggle?: (mode: 'AGL' | 'ASL' | 'RLT') => void;
}

/**
 * CompassHeadingCardProps - Props for the CompassHeadingCard component.
 */
export interface CompassHeadingCardProps {
  heading: HeadingData;
  className?: string;
}

/**
 * BatteryStatusCardProps - Props for the BatteryStatusCard component.
 */
export interface BatteryStatusCardProps {
  percentage: number;
  estimatedRemaining: string;
  temperature: number;
  voltage: number;
  dischargeRate?: number;
  className?: string;
}

/**
 * ConnectionStatus - Network connection status.
 */
export type ConnectionStatus = 'active' | 'inactive' | 'poor';

/**
 * ConnectionStatusCardProps - Props for the ConnectionStatusCard component.
 */
export interface ConnectionStatusCardProps {
  label: string;
  status: ConnectionStatus;
  details?: string;
  className?: string;
}

/**
 * TelemetryData - Complete telemetry data structure for the flight.
 */
export interface TelemetryData {
  battery: {
    percentage: number;
    estimatedRemaining: string;
    temperature: number;
    voltage: number;
    dischargeRate?: number;
  };
  altitude: AltitudeData;
  distance: DistanceData;
  horizontalSpeed: SpeedData;
  verticalSpeed: SpeedData;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  heading: HeadingData;
  distanceToHome: {
    value: number;
    unit: string;
    direction: string;
  };
  environment: {
    wind: {
      speed: number;
      unit: string;
      direction: string;
    };
    temperature: number;
    pressure: number;
    humidity: number;
  };
  gpsStatus?: {
    count: number;
    signal: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  rtkStatus: {
    count: number;
    signal: string;
    mode: 'Fixed' | 'Float' | 'None';
  };
  latency: {
    video: number;
    control: number;
  };
  visionSystem: {
    status: 'active' | 'inactive' | 'limited';
    details?: string;
  };
  connections: {
    rfLink: {
      status: ConnectionStatus;
      details: string;
    };
    ethernet: {
      status: ConnectionStatus;
      details: string;
    };
    dockCellular: {
      status: ConnectionStatus;
      details: string;
    };
    droneCellular: {
      status: ConnectionStatus;
      details: string;
    };
  }
}

/**
 * TelemetryHistoryPoint - Interface for telemetry history point.
 */
export interface TelemetryHistoryPoint {
  timestamp: number;
  value: number;
  label?: string;
}

/**
 * ThresholdConfig - Configuration for visualization thresholds.
 */
export interface ThresholdConfig {
  value: number;
  color: string;
  label?: string;
}

/**
 * MetricChartConfig - Configuration for a metric chart.
 */
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

/**
 * TelemetryDataPoint - Interface for a single telemetry data point.
 */
export interface TelemetryDataPoint {
  timestamp: number; // in seconds from flight start
  value: number;
  rawTime?: string; // HH:MM:SS format
}

/**
 * MetricChartProps - Props for the MetricChart component.
 */
export interface MetricChartProps {
  data: TelemetryDataPoint[];
  currentValue: number;
  currentTimestamp: number; // in seconds from flight start
  config: MetricChartConfig;
  isLastChart?: boolean;
  zoomLevel?: number;
  height?: number;
}

/**
 * TelemetryGraphsPanelProps - Props for the TelemetryGraphsPanel component.
 */
export interface TelemetryGraphsPanelProps {
  timestamp: string;
  telemetryData: TelemetryData;
}
