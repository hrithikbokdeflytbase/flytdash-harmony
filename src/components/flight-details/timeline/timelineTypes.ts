
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
