
/**
 * FlightStatistics - Represents the high-level flight statistics for the dashboard.
 */
export interface FlightStatistics {
  total: number;
  failed: number;
  successful: number;
  failureRate: number;
  totalMedia: number; // Total media count across all flights
  uploadedMedia: number; // Total successfully uploaded media count
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
  mediaCaptured: number; // Number of media files captured during flights
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

/**
 * Flight - Core interface representing a flight entry in the table.
 */
export interface Flight {
  id: string;
  missionName: string;
  operationType: string;
  pilotName: string;
  droneName: string;
  mediaCount: number;
  mediaStatus: MediaUploadStatus;
  dateTime: string;
  status: FlightStatus;
}

/**
 * FlightStatus - Type representing the possible statuses of a flight.
 */
export type FlightStatus = 'completed' | 'warning' | 'failed' | 'inProgress' | 'scheduled';

/**
 * MediaUploadStatus - Interface for tracking the upload status of flight media.
 */
export interface MediaUploadStatus {
  photos?: MediaTypeStatus;
  videos?: MediaTypeStatus;
}

/**
 * MediaTypeStatus - Interface for a specific type of media upload status.
 */
export interface MediaTypeStatus {
  total: number;
  uploaded: number;
}

/**
 * RecentFlightsTableProps - Props for the RecentFlightsTable component.
 */
export interface RecentFlightsTableProps {
  isLoading?: boolean;
  flights?: Flight[];
  itemsPerPage?: number;
  onFlightSelect?: (flightId: string) => void;
}

/**
 * TablePaginationState - Interface for table pagination state.
 */
export interface TablePaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

/**
 * TableSortState - Interface for table sorting state.
 */
export interface TableSortState {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * TableFilterState - Interface for table filtering state.
 */
export interface TableFilterState {
  filters: Record<string, string | string[]>;
}

/**
 * MediaStatusDisplayProps - Props for the media upload status display component.
 */
export interface MediaStatusDisplayProps {
  mediaData?: MediaTypeStatus;
  mediaType: 'photos' | 'videos';
}
