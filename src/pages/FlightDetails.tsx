import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video, Map, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import VideoFeed from '@/components/flight-details/VideoFeed';
import FlightMap from '@/components/flight-details/FlightMap';
import FlightTimeline from '@/components/flight-details/FlightTimeline';
import FlightDetailsPanel from '@/components/flight-details/FlightDetailsPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  TimelinePosition, 
  VideoSegment, 
  MissionPhase,
  SystemEvent,
  WarningEvent,
  MediaAction
} from '@/components/flight-details/timeline/timelineTypes';
import { timeToSeconds } from '@/components/flight-details/timeline/timelineUtils';

// View mode type
type ViewMode = 'map' | 'video' | 'split';

// Video state type
type VideoState = 'loading' | 'error' | 'empty' | 'playing';

// Flight path point interface
interface FlightPathPoint {
  lat: number;
  lng: number;
  altitude: number;
  timestamp: string;
  flightMode: 'mission' | 'gtl' | 'manual' | 'rtds';
}

// Waypoint interface
interface Waypoint {
  lat: number;
  lng: number;
  index: number;
}

// Mock flight path data
const mockFlightPath: FlightPathPoint[] = [{
  lat: 37.7856,
  lng: -122.4308,
  altitude: 120,
  timestamp: '00:05:00',
  flightMode: 'mission'
}, {
  lat: 37.7845,
  lng: -122.4318,
  altitude: 125,
  timestamp: '00:06:00',
  flightMode: 'mission'
}, {
  lat: 37.7834,
  lng: -122.4328,
  altitude: 130,
  timestamp: '00:07:00',
  flightMode: 'gtl'
}, {
  lat: 37.7823,
  lng: -122.4338,
  altitude: 135,
  timestamp: '00:08:00',
  flightMode: 'gtl'
}, {
  lat: 37.7812,
  lng: -122.4348,
  altitude: 140,
  timestamp: '00:09:00',
  flightMode: 'manual'
}, {
  lat: 37.7801,
  lng: -122.4358,
  altitude: 145,
  timestamp: '00:10:00',
  flightMode: 'mission'
}, {
  lat: 37.7790,
  lng: -122.4368,
  altitude: 150,
  timestamp: '00:11:00',
  flightMode: 'mission'
}, {
  lat: 37.7780,
  lng: -122.4378,
  altitude: 140,
  timestamp: '00:15:00',
  flightMode: 'rtds'
}, {
  lat: 37.7770,
  lng: -122.4388,
  altitude: 130,
  timestamp: '00:20:00',
  flightMode: 'rtds'
}];

// Mock waypoints
const mockWaypoints: Waypoint[] = [{
  lat: 37.7845,
  lng: -122.4318,
  index: 1
}, {
  lat: 37.7823,
  lng: -122.4338,
  index: 2
}, {
  lat: 37.7790,
  lng: -122.4368,
  index: 3
}];

const FlightDetails = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Mock state for video feed props (would come from API in real app)
  const [videoState, setVideoState] = useState<VideoState>('loading');
  const [hasVideo, setHasVideo] = useState(false);
  const [timestamp, setTimestamp] = useState('00:15:32');
  const [cameraType, setCameraType] = useState<'wide' | 'zoom' | 'thermal' | 'ogi'>('wide');
  const [recordingDuration, setRecordingDuration] = useState('00:03:45');

  // Timeline synchronization state
  const [timelinePosition, setTimelinePosition] = useState<TimelinePosition>({
    timestamp: '00:15:32',
    hasVideo: false
  });

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Add state for flight path and waypoints
  const [flightPath, setFlightPath] = useState<FlightPathPoint[]>(mockFlightPath);
  const [waypoints, setWaypoints] = useState<Waypoint[]>(mockWaypoints);

  // Updated mock video segments with public URLs that actually exist
  const [videoSegments, setVideoSegments] = useState<VideoSegment[]>([
    {
      startTime: '00:10:00',
      endTime: '00:12:30',
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    }, 
    {
      startTime: '00:15:00',
      endTime: '00:18:45',
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    }, 
    {
      startTime: '00:22:15',
      endTime: '00:25:00',
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    }
  ]);

  // Mock mission phases
  const [missionPhases, setMissionPhases] = useState<MissionPhase[]>([{
    type: 'mission',
    startTime: '00:00:00',
    endTime: '00:08:30',
    label: 'Mission'
  }, {
    type: 'manual',
    startTime: '00:08:30',
    endTime: '00:15:00',
    label: 'Manual Control'
  }, {
    type: 'gtl',
    startTime: '00:15:00',
    endTime: '00:22:00',
    label: 'GTL'
  }, {
    type: 'rtds',
    startTime: '00:22:00',
    endTime: '00:25:30',
    label: 'Return to Docking Station'
  }]);

  // Mock system events
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([{
    type: 'connection',
    timestamp: '00:00:30',
    details: 'GPS Fixed'
  }, {
    type: 'calibration',
    timestamp: '00:01:15',
    details: 'IMU Calibrated'
  }, {
    type: 'modeChange',
    timestamp: '00:05:45',
    details: 'Mode: Autonomous'
  }, {
    type: 'command',
    timestamp: '00:12:20',
    details: 'Waypoint Reached'
  }, {
    type: 'modeChange',
    timestamp: '00:18:30',
    details: 'Mode: Manual'
  }, {
    type: 'command',
    timestamp: '00:22:00',
    details: 'RTL Activated'
  }]);

  // Mock warning events
  const [warningEvents, setWarningEvents] = useState<WarningEvent[]>([{
    type: 'warning',
    timestamp: '00:04:15',
    details: 'Low Battery',
    severity: 'medium'
  }, {
    type: 'warning',
    timestamp: '00:08:30',
    details: 'Strong Wind',
    severity: 'low'
  }, {
    type: 'error',
    timestamp: '00:17:45',
    details: 'Sensor Error',
    severity: 'high'
  }, {
    type: 'warning',
    timestamp: '00:21:10',
    details: 'Signal Interference',
    severity: 'medium'
  }]);

  // Mock media actions
  const [mediaActions, setMediaActions] = useState<MediaAction[]>([{
    type: 'photo',
    timestamp: '00:03:20',
    fileId: 'IMG001'
  }, {
    type: 'videoStart',
    timestamp: '00:10:00',
    fileId: 'VID001'
  }, {
    type: 'videoEnd',
    timestamp: '00:12:30',
    fileId: 'VID001'
  }, {
    type: 'photo',
    timestamp: '00:14:15',
    fileId: 'IMG002'
  }, {
    type: 'videoStart',
    timestamp: '00:15:00',
    fileId: 'VID002'
  }, {
    type: 'videoEnd',
    timestamp: '00:18:45',
    fileId: 'VID002'
  }, {
    type: 'photo',
    timestamp: '00:20:50',
    fileId: 'IMG003'
  }, {
    type: 'videoStart',
    timestamp: '00:22:15',
    fileId: 'VID003'
  }, {
    type: 'videoEnd',
    timestamp: '00:25:00',
    fileId: 'VID003'
  }]);

  // Map state
  const [mapLoading, setMapLoading] = useState(true);
  const [currentMapPosition, setCurrentMapPosition] = useState({
    lat: mockFlightPath[0]?.lat || 37.7790,
    lng: mockFlightPath[0]?.lng || -122.4368,
    altitude: mockFlightPath[0]?.altitude || 0,
    heading: 45 // Default heading in degrees
  });

  // Current flight mode from timeline
  const [currentFlightMode, setCurrentFlightMode] = useState<string>('mission');

  // Map error state
  const [mapError, setMapError] = useState<string | null>(null);

  // Function to find flight mode at timestamp
  const findFlightModeAtTimestamp = (timestamp: string): string => {
    // Find the active mission phase at this timestamp
    const timeInSeconds = timeToSeconds(timestamp);
    const activePhase = missionPhases.find(phase => {
      const startSeconds = timeToSeconds(phase.startTime);
      const endSeconds = timeToSeconds(phase.endTime);
      return timeInSeconds >= startSeconds && timeInSeconds <= endSeconds;
    });
    
    // Return the flight mode or default to 'mission'
    return activePhase?.type || 'mission';
  };

  // Public Mapbox token for demo purposes - in production, use environment variables
  useEffect(() => {
    console.log("Setting up Mapbox token and initial states");
    
    // Set a global Mapbox token for the map component to use
    (window as any).MAPBOX_TOKEN = 'pk.eyJ1IjoiZmx5dGJhc2UiLCJhIjoiY2tlZ2QwbmUzMDR0cjJ6cGRtY3RpbGpraiJ9.I0gYgVZQc2pVv9XXGnVu5w';
    
    // Force mapboxgl to use the token
    if (typeof mapboxgl !== 'undefined') {
      mapboxgl.accessToken = (window as any).MAPBOX_TOKEN;
    }
    
    // Notify user about demo mode
    toast({
      title: "Demo Mode Active",
      description: "This is a demonstration with sample data and videos.",
      duration: 5000,
    });
    
    // Initialize video state after a brief delay
    setTimeout(() => {
      setVideoState('playing');
      setHasVideo(true);
      setTimelinePosition(prev => ({
        ...prev,
        hasVideo: true
      }));
    }, 1500);
  }, []);

  // Simulate loading state and transitions for demo purposes
  useEffect(() => {
    // First show loading state
    setVideoState('loading');

    // Then transition to either empty or playing after 2 seconds
    const loadTimer = setTimeout(() => {
      // Check if current timeline position is within a video segment
      const currentPositionHasVideo = videoSegments.some(segment => {
        const timeInSeconds = timeToSeconds(timelinePosition.timestamp);
        const startInSeconds = timeToSeconds(segment.startTime);
        const endInSeconds = timeToSeconds(segment.endTime);
        return timeInSeconds >= startInSeconds && timeInSeconds <= endInSeconds;
      });
      
      setTimelinePosition(prev => ({
        ...prev,
        hasVideo: currentPositionHasVideo
      }));
      
      if (currentPositionHasVideo) {
        setVideoState('playing');
        setHasVideo(true);
      } else {
        setVideoState('empty');
        setHasVideo(false);
      }
    }, 2000);

    // Simulate map loading
    const mapTimer = setTimeout(() => {
      setMapLoading(false);
      
      // Randomly simulate map error (10% chance) for demo
      if (Math.random() < 0.1) {
        setMapError("Unable to load map data. Please try again.");
      }
    }, 3000);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(mapTimer);
    };
  }, []);

  // Determine flight mode whenever timestamp changes
  useEffect(() => {
    const flightMode = findFlightModeAtTimestamp(timelinePosition.timestamp);
    setCurrentFlightMode(flightMode);
    console.log(`Current flight mode: ${flightMode} at ${timelinePosition.timestamp}`);
  }, [timelinePosition.timestamp, missionPhases]);

  // Simulate camera type switching based on timeline position
  useEffect(() => {
    // Find appropriate camera type based on timestamp
    const timeInSeconds = timeToSeconds(timelinePosition.timestamp);
    
    // Simple logic to switch camera at specific times for demo
    if (timeInSeconds < 500) {
      setCameraType('wide');
    } else if (timeInSeconds < 900) {
      setCameraType('zoom');
    } else if (timeInSeconds < 1300) {
      setCameraType('thermal');
    } else {
      setCameraType('ogi');
    }
    
  }, [timelinePosition.timestamp]);

  // Convert "HH:MM:SS" format to seconds for comparison
  const timeToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Find the nearest flight path point at a given timestamp
  const findNearestFlightPathPoint = (timestamp: string): FlightPathPoint | null => {
    if (!flightPath.length) return null;
    
    const targetSeconds = timeToSeconds(timestamp);
    let nearestPoint = flightPath[0];
    let smallestDiff = Infinity;
    
    flightPath.forEach(point => {
      const pointSeconds = timeToSeconds(point.timestamp);
      const diff = Math.abs(pointSeconds - targetSeconds);
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        nearestPoint = point;
      }
    });
    
    return nearestPoint;
  };

  // Handle video feed position updates
  const handleVideoPositionUpdate = (position: string) => {
    // Update the timestamp but don't change the hasVideo property
    setTimelinePosition(prev => ({
      ...prev,
      timestamp: position
    }));
    setTimestamp(position);
  };

  // Enhanced version of handleTimelinePositionChange
  const handleTimelinePositionChange = (newPosition: string) => {
    // Check if the new position has video content
    const positionHasVideo = videoSegments.some(segment => {
      const timeInSeconds = timeToSeconds(newPosition);
      const startInSeconds = timeToSeconds(segment.startTime);
      const endInSeconds = timeToSeconds(segment.endTime);
      return timeInSeconds >= startInSeconds && timeInSeconds <= endInSeconds;
    });
    
    setTimelinePosition({
      timestamp: newPosition,
      hasVideo: positionHasVideo
    });

    // Update video state based on whether there's video content
    if (positionHasVideo) {
      setVideoState('playing');
      setHasVideo(true);
    } else {
      setVideoState('empty');
      setHasVideo(false);
    }

    // Find nearest flight path point to this timestamp
    const nearestPoint = findNearestFlightPathPoint(newPosition);
    
    // Update map position based on timeline position
    if (nearestPoint) {
      setCurrentMapPosition({
        lat: nearestPoint.lat,
        lng: nearestPoint.lng,
        altitude: nearestPoint.altitude,
        heading: calculateHeading(nearestPoint, newPosition)
      });
    }
    
    console.log(`Timeline position updated to ${newPosition} (has video: ${positionHasVideo})`);
  };

  // Calculate heading based on nearest points
  const calculateHeading = (point: FlightPathPoint, timestamp: string): number => {
    // Find next point in flight path to determine direction
    const currentIndex = flightPath.findIndex(p => p === point);
    if (currentIndex < 0 || currentIndex >= flightPath.length - 1) {
      return 45; // Default heading
    }
    
    const nextPoint = flightPath[currentIndex + 1];
    
    // Calculate heading
    const deltaLng = nextPoint.lng - point.lng;
    const deltaLat = nextPoint.lat - point.lat;
    const heading = (Math.atan2(deltaLng, deltaLat) * 180 / Math.PI);
    
    return heading;
  };

  // Handle playback toggle
  const handlePlaybackToggle = (playing: boolean) => {
    setIsPlaying(playing);
  };

  // Handle playback speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  // Handle event selection from timeline events panel
  const handleEventSelect = (eventId: string) => {
    // Find the event timestamp and update timeline position
    const event = [...systemEvents, ...warningEvents].find(e => e.timestamp === eventId);
    if (event) {
      handleTimelinePositionChange(event.timestamp);
    }
  };

  // Handle map click to update timeline position
  const handleMapPositionSelect = (timestamp: string) => {
    if (timestamp) {
      handleTimelinePositionChange(timestamp);
    }
  };

  // Handle view mode change with smooth transition
  const handleViewModeChange = (value: string) => {
    if (value && (value === 'map' || value === 'video' || value === 'split')) {
      // Add a slight transition delay for smoother UI
      setTimeout(() => {
        setViewMode(value as ViewMode);
      }, 50);
    }
  };

  // Try again function for map error
  const handleMapRetry = () => {
    setMapLoading(true);
    setMapError(null);
    
    // Simulate loading again
    setTimeout(() => {
      setMapLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#111113]">
      {/* Top Bar - Map/Video Controls */}
      <header className="bg-background-level-1 p-4 flex items-center justify-between z-10 shrink-0">
        <Button variant="ghost" className="flex items-center gap-2 text-text-icon-01" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Button>
        
        <h1 className="text-xl font-medium text-text-icon-01">
          Flight Details: {flightId}
        </h1>
        
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={handleViewModeChange}
          className="transition-all duration-300"
        >
          <ToggleGroupItem value="map" aria-label="Show map view">
            <Map className="w-5 h-5 mr-2" />
            Map
          </ToggleGroupItem>
          <ToggleGroupItem value="video" aria-label="Show video view">
            <Video className="w-5 h-5 mr-2" />
            Video
          </ToggleGroupItem>
          <ToggleGroupItem value="split" aria-label="Show split view">
            <Columns className="w-5 h-5 mr-2" />
            Split
          </ToggleGroupItem>
        </ToggleGroup>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-0 overflow-hidden flex">
        <div className="flex-1 grid grid-cols-12 gap-6 h-full">
          {/* 1. Video Panel */}
          <div className={cn(
            "bg-background-level-2 rounded-lg p-4 flex flex-col overflow-hidden transition-all duration-300",
            viewMode === 'map' ? 'hidden' : 'col-span-9',
            viewMode === 'split' ? 'col-span-6' : ''
          )}>
            <ScrollArea className="h-full w-full" type="auto">
              <div className="h-full">
                <VideoFeed 
                  cameraType={cameraType} 
                  videoState={videoState} 
                  timelinePosition={timelinePosition} 
                  videoSegments={videoSegments} 
                  onPositionUpdate={handleVideoPositionUpdate}
                  isPlaying={isPlaying}
                  playbackSpeed={playbackSpeed}
                />
              </div>
            </ScrollArea>
          </div>
          
          {/* 2. Map Panel */}
          <div className={cn(
            "bg-background-level-2 rounded-lg p-4 flex flex-col overflow-hidden transition-all duration-300",
            viewMode === 'video' ? 'hidden' : 'col-span-9',
            viewMode === 'split' ? 'col-span-3' : ''
          )}>
            <ScrollArea className="h-full w-full" type="auto">
              <div className="flex-1 h-full">
                <FlightMap 
                  flightId={flightId || 'unknown'} 
                  flightPath={flightPath} 
                  takeoffPoint={{
                    lat: flightPath[0].lat,
                    lng: flightPath[0].lng
                  }} 
                  landingPoint={{
                    lat: flightPath[flightPath.length - 1].lat,
                    lng: flightPath[flightPath.length - 1].lng
                  }} 
                  dockLocation={{
                    lat: 37.7856,
                    lng: -122.4308
                  }} 
                  waypoints={waypoints} 
                  currentPosition={currentMapPosition}
                  currentFlightMode={currentFlightMode}
                  isLoading={mapLoading}
                  error={mapError}
                  onRetry={handleMapRetry}
                  onPathClick={handleMapPositionSelect}
                  timelinePosition={timelinePosition}
                  systemEvents={systemEvents}
                  warningEvents={warningEvents}
                />
              </div>
            </ScrollArea>
          </div>
          
          {/* 3. Flight Details Panel - UPDATED: Single panel, no grid rows */}
          <div className="col-span-3 overflow-hidden h-full">
            <FlightDetailsPanel 
              flightId={flightId || 'unknown'} 
              flightMode={currentFlightMode}
              timestamp={timelinePosition.timestamp} 
              className="h-full"
              onEventSelect={handleEventSelect}
            />
          </div>
        </div>
      </main>
      
      {/* 4. Timeline Panel */}
      <footer className="bg-background-level-1 mt-3 shrink-0">
        <FlightTimeline 
          currentPosition={timelinePosition} 
          videoSegments={videoSegments} 
          flightDuration="00:25:30" 
          onPositionChange={handleTimelinePositionChange} 
          missionPhases={missionPhases} 
          systemEvents={systemEvents} 
          warningEvents={warningEvents} 
          mediaActions={mediaActions}
          isPlaying={isPlaying}
          onPlaybackToggle={handlePlaybackToggle}
          playbackSpeed={playbackSpeed}
          onSpeedChange={handleSpeedChange}
        />
      </footer>
    </div>
  );
};

export default FlightDetails;
