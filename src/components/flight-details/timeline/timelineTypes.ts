
// Timeline position interface
export interface TimelinePosition {
  timestamp: string;
  hasVideo: boolean;
}

// Video segment interface
export interface VideoSegment {
  startTime: string;
  endTime: string;
  url: string;
}

// Mission phase type alias - Keep only implementable phases
type MissionPhaseType = 'mission' | 'gtl' | 'manual' | 'rtds';

// Mission phase interface
export interface MissionPhase {
  type: MissionPhaseType;
  startTime: string;
  endTime: string;
  label: string;
}

// System event type alias - Simplified to only include implementable events
type SystemEventType = 'connection' | 'calibration' | 'modeChange' | 'command';

// System event interface
export interface SystemEvent {
  type: SystemEventType;
  timestamp: string;
  details: string;
}

// Warning severity type
type WarningSeverity = 'low' | 'medium' | 'high';

// Warning event type alias - Simplified to core warning types
type WarningEventType = 'warning' | 'error';

// Warning event interface
export interface WarningEvent {
  type: WarningEventType;
  timestamp: string;
  details: string;
  severity: WarningSeverity;
}

// Media action type alias - Keep only implementable media actions
type MediaActionType = 'photo' | 'videoStart' | 'videoEnd';

// Media action interface
export interface MediaAction {
  type: MediaActionType;
  timestamp: string;
  fileId: string;
}

// Interface for timeline synchronization event
export interface TimelineSyncEvent {
  timestamp: string;
  source: 'timeline' | 'telemetry' | 'graph' | 'map' | 'video';
}

// Interface for synchronizable telemetry value
export interface SyncedTelemetryValue<T> {
  value: T;
  timestamp: string;
  previousValue?: T;
  nextValue?: T;
}

// Interface for telemetry history point
export interface TelemetryHistoryPoint {
  timestamp: number; // in seconds from flight start
  value: number;
  label?: string;
}

/**
 * Flight Data Filter Interfaces
 * The following interfaces define the structure of flight data filters used across the application.
 */

/**
 * DateRangeType - Represents the time period options for filtering dashboard data
 * @value 'daily' - Filter data for the current day
 * @value 'weekly' - Filter data for the current week
 * @value 'monthly' - Filter data for the current month
 */
export type DateRangeType = 'daily' | 'weekly' | 'monthly';

/**
 * DateRangeValue - Represents a custom date range with explicit start and end dates
 * @property {Date | undefined} from - The start date of the range (inclusive)
 * @property {Date | undefined} to - The end date of the range (inclusive)
 */
export interface DateRangeValue {
  from: Date | undefined;
  to: Date | undefined;
}

/**
 * OperationType - Represents the type of drone operation for filtering
 * @value 'all' - All operation types (default)
 * @value 'gtl' - GTL (Go-To-Location) operations only
 * @value 'mission' - Mission operations only
 */
export type OperationType = 'all' | 'gtl' | 'mission';

/**
 * TriggerType - Represents the event that initiated the flight
 * @value 'all' - All trigger types (default)
 * @value 'normal' - Normal user-initiated flights
 * @value 'alarm' - Flights triggered by alarm sensors
 */
export type TriggerType = 'all' | 'normal' | 'alarm';

/**
 * FlightFilterOptions - Comprehensive interface for all flight data filter options
 * @property {DateRangeType | DateRangeValue} dateRange - Time period or custom date range
 * @property {OperationType} operationType - Type of operation (all, gtl, mission)
 * @property {boolean} includeManual - Whether to include manual operations
 * @property {TriggerType} triggerType - Type of trigger that initiated the flight
 * @property {string[]} selectedDrones - Array of drone IDs to filter by
 */
export interface FlightFilterOptions {
  dateRange: DateRangeType | DateRangeValue;
  operationType: OperationType;
  includeManual: boolean;
  triggerType: TriggerType;
  selectedDrones: string[];
}

/**
 * FilterChangeHandler - Type for filter change event handlers
 * @template T - The type of filter value being changed
 * @param {T} value - The new value for the filter
 * @returns {void}
 */
export type FilterChangeHandler<T> = (value: T) => void;

/**
 * FilterState - Interface representing the current state of all filters
 * @property {FlightFilterOptions} options - Current filter options
 * @property {boolean} isLoading - Whether filter results are being loaded
 * @property {FilterChangeHandlers} onChange - Handler functions for filter changes
 */
export interface FilterState {
  options: FlightFilterOptions;
  isLoading: boolean;
  onChange: {
    dateRange: FilterChangeHandler<DateRangeType | DateRangeValue>;
    operationType: FilterChangeHandler<OperationType>;
    includeManual: FilterChangeHandler<boolean>;
    triggerType: FilterChangeHandler<TriggerType>;
    selectedDrones: FilterChangeHandler<string[]>;
  };
}

/**
 * ActiveFilter - Interface for representing an active filter for display
 * @property {string} id - Unique identifier for the filter
 * @property {string} label - Display label for the filter
 */
export interface ActiveFilter {
  id: string;
  label: string;
}
