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

/**
 * Video Feed Interfaces
 * The following interfaces define the structure for the video feed component in the flight details page.
 */

/**
 * VideoState - Possible states of the video component
 * @value 'loading' - Video is currently loading
 * @value 'error' - Video failed to load or encountered an error
 * @value 'empty' - No video available at current position
 * @value 'playing' - Video is available and can be played
 */
export type VideoState = 'loading' | 'error' | 'empty' | 'playing';

/**
 * VideoFeedProps - Props for the VideoFeed component
 * @property {VideoState} videoState - Current state of the video feed
 * @property {TimelinePosition | undefined} timelinePosition - Current position in the timeline
 * @property {VideoSegment[]} videoSegments - Available video segments for the flight
 * @property {(position: string) => void} onPositionUpdate - Callback for when video position changes
 * @property {string} className - Optional CSS class name for styling
 * @property {boolean} isPlaying - Whether video is currently playing
 * @property {number} playbackSpeed - Current playback speed multiplier
 */
export interface VideoFeedProps {
  videoState?: VideoState;
  timelinePosition?: TimelinePosition;
  videoSegments?: VideoSegment[];
  onPositionUpdate?: (position: string) => void;
  className?: string;
  isPlaying?: boolean;
  playbackSpeed?: number;
}

/**
 * VideoControls - Interface for video playback control options
 * @property {boolean} showControls - Whether to show native video controls
 * @property {boolean} autoPlay - Whether video should autoplay when loaded
 * @property {boolean} loop - Whether video should loop when finished
 * @property {boolean} muted - Whether video should be muted
 */
export interface VideoControls {
  showControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

/**
 * MapFeed Interfaces
 * The following interfaces define the structure for the map feed component in the flight details page.
 */

/**
 * FlightPathPoint - Interface for a point in the flight path
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 * @property {number} altitude - Altitude in meters
 * @property {string} timestamp - Timestamp in "HH:MM:SS" format
 * @property {MissionPhaseType} flightMode - Flight mode at this point
 */
export interface FlightPathPoint {
  lat: number;
  lng: number;
  altitude: number;
  timestamp: string;
  flightMode: MissionPhaseType;
}

/**
 * Waypoint - Interface for a mission waypoint
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 * @property {number} index - Waypoint index in the mission
 */
export interface Waypoint {
  lat: number;
  lng: number;
  index: number;
}

/**
 * LocationPoint - Interface for a specific location point on the map
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 */
export interface LocationPoint {
  lat: number;
  lng: number;
}

/**
 * DronePosition - Interface for the current drone position on the map
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 * @property {number} altitude - Altitude in meters
 * @property {number} heading - Heading in degrees (0-360)
 */
export interface DronePosition {
  lat: number;
  lng: number;
  altitude: number;
  heading: number;
}

/**
 * FlightMapProps - Props for the FlightMap component
 * @property {string} flightId - ID of the flight being displayed
 * @property {FlightPathPoint[]} flightPath - Array of points defining the flight path
 * @property {LocationPoint} takeoffPoint - Takeoff location coordinates
 * @property {LocationPoint} landingPoint - Landing location coordinates
 * @property {LocationPoint} dockLocation - Drone dock location coordinates
 * @property {Waypoint[]} waypoints - Array of mission waypoints
 * @property {DronePosition} currentPosition - Current drone position
 * @property {string} currentFlightMode - Current flight mode
 * @property {boolean} isLoading - Whether map data is loading
 * @property {string | null} error - Error message if map failed to load
 * @property {() => void} onRetry - Handler for retry action when map has an error
 * @property {(timestamp: string) => void} onPathClick - Handler for when flight path is clicked
 * @property {TimelinePosition} timelinePosition - Current position in the timeline
 * @property {SystemEvent[]} systemEvents - System events to display on map
 * @property {WarningEvent[]} warningEvents - Warning events to display on map
 */
export interface FlightMapProps {
  flightId: string;
  flightPath: FlightPathPoint[];
  takeoffPoint: LocationPoint;
  landingPoint: LocationPoint;
  dockLocation: LocationPoint;
  waypoints: Waypoint[];
  currentPosition: DronePosition;
  currentFlightMode: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onPathClick: (timestamp: string) => void;
  timelinePosition: TimelinePosition;
  systemEvents?: SystemEvent[];
  warningEvents?: WarningEvent[];
}

/**
 * MapLayerVisibility - Interface for controlling map layer visibility
 * @property {boolean} flightPath - Whether flight path is visible
 * @property {boolean} waypoints - Whether waypoints are visible
 * @property {boolean} events - Whether events are visible
 * @property {boolean} terrain - Whether 3D terrain is visible
 * @property {boolean} buildings - Whether 3D buildings are visible
 */
export interface MapLayerVisibility {
  flightPath: boolean;
  waypoints: boolean;
  events: boolean;
  terrain: boolean;
  buildings: boolean;
}

/**
 * MapViewSettings - Interface for map view settings
 * @property {boolean} follow - Whether map should follow drone
 * @property {'2D' | '3D'} viewMode - 2D or 3D view mode
 * @property {number} pitch - Map pitch angle in degrees
 * @property {number} zoom - Map zoom level
 */
export interface MapViewSettings {
  follow: boolean;
  viewMode: '2D' | '3D';
  pitch: number;
  zoom: number;
}
