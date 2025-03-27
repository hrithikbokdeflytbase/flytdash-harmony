
// Type definitions for timeline components

// Timeline position type
export interface TimelinePosition {
  timestamp: string; // Format: "HH:MM:SS"
  hasVideo: boolean;
}

// Video segment type
export type VideoSegment = {
  startTime: string; // Format: "HH:MM:SS"
  endTime: string;   // Format: "HH:MM:SS"
  url: string;
};

// Mission phase type
export type MissionPhase = {
  type: 'manual' | 'gtl' | 'mission' | 'rtds';
  startTime: string; // Format: "HH:MM:SS"
  endTime: string;   // Format: "HH:MM:SS"
  label: string;
};

// System event type
export type SystemEvent = {
  type: 'connection' | 'calibration' | 'modeChange' | 'command';
  timestamp: string; // Format: "HH:MM:SS"
  details: string;
};

// Warning event type
export type WarningEvent = {
  type: 'warning' | 'error';
  timestamp: string; // Format: "HH:MM:SS"
  details: string;
  severity: 'low' | 'medium' | 'high';
};

// Media action type
export type MediaAction = {
  type: 'photo' | 'videoStart' | 'videoEnd';
  timestamp: string; // Format: "HH:MM:SS"
  fileId?: string;
};

// Cluster type
export interface Cluster {
  isCluster: boolean;
  events: Array<SystemEvent | WarningEvent | MediaAction>;
  position: number;
}

// Camera type for video feed
export type CameraType = 'wide' | 'zoom' | 'thermal';

// Video state type
export type VideoState = 'loading' | 'error' | 'empty' | 'playing';

// Flight path point interface
export interface FlightPathPoint {
  lat: number;
  lng: number;
  altitude: number;
  timestamp: string;
  flightMode: 'mission' | 'gtl' | 'manual';
}

// Map marker interfaces
export interface MapMarker {
  lat: number;
  lng: number;
}

export interface WaypointMarker extends MapMarker {
  index: number;
}

export interface DronePositionMarker extends MapMarker {
  altitude?: number;
  heading?: number;
}
