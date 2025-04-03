
/**
 * FlightStatistics - Represents the high-level flight statistics for the dashboard.
 */
export interface FlightStatistics {
  total: number;
  failed: number;
  successful: number;
  failureRate: number;
}

/**
 * FlightTrend - Represents trend data for flight metrics.
 */
export interface FlightTrend {
  value: number;
  isPositive: boolean;
  comparisonPeriod?: string;
}

/**
 * FailureCategory - Represents a category of flight failures.
 */
export interface FailureCategory {
  cause: string;
  count: number;
  iconName: string;
  flights: FlightError[];
}

/**
 * FlightError - Details of a specific flight error.
 */
export interface FlightError {
  id: string;
  date: string;
  missionName: string;
  missionType: string;
  isManualControl: boolean;
  details: string;
  severity: ErrorSeverity;
}

/**
 * ErrorSeverity - Severity level of a flight error.
 */
export type ErrorSeverity = 'critical' | 'warning';

/**
 * FailedFlightsPopupProps - Props for the failed flights popup component.
 */
export interface FailedFlightsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  failedCount: number;
  totalCount: number;
}

/**
 * FlightPerformanceData - Represents high-level performance data for flight operations.
 */
export interface FlightPerformanceData {
  flightTime: number;
  areaCoverage: number;
  batteryUnits: number;
}

/**
 * OperationProgress - Represents the progress of different operation aspects.
 */
export interface OperationProgress {
  scansCompleted: number;
  totalScans: number;
  dataProcessing: number;
  reporting: number;
}
