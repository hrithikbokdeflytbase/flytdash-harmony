
// Type definition for date range selection
export type DateRangeType = 'daily' | 'weekly' | 'monthly';

// Type for custom date range picker
export interface DateRangeValue {
  from: Date | undefined;
  to: Date | undefined;
}

/**
 * OperationType - Represents the type of drone operation for filtering
 * @value 'all' - All operation types (default)
 * @value 'gtt' - GTT (Go-To-Target) operations only
 * @value 'mission' - Mission operations only
 */
export type OperationType = 'all' | 'gtt' | 'mission';

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
 * @property {OperationType} operationType - Type of operation (all, gtt, mission)
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
