import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video, Map, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import VideoFeed from '@/components/flight-details/VideoFeed';
import SimulatedMap from '@/components/flight-details/SimulatedMap';
import FlightTimeline from '@/components/flight-details/FlightTimeline';
import FlightDetailsPanel from '@/components/flight-details/FlightDetailsPanel';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  TimelinePosition, 
  VideoSegment, 
  MissionPhase,
  SystemEvent,
  WarningEvent,
  MediaAction
} from '@/components/flight-details/timeline/timelineTypes';

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

  // Mock mission phases - Updated to use only the allowed phase types
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
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Current map position state
  const [currentMapPosition, setCurrentMapPosition] = useState({
    x: 70, 
    y: 50,
    altitude: 120,
    heading: 45
  });

  // Set up initial states
  useEffect(() => {
    console.log("Setting up initial states");
    
    // Notify user about demo mode
    toast({
      title: "Demo Mode Active",
      description: "This is a demonstration with sample data and simulated map.",
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
    
    // Simulate map loading
    setTimeout(() => {
      setMapLoading(false);
      
      // Randomly simulate map error (10% chance) for demo
      if (Math.random() < 0.1) {
        setMapError("Unable to load map data. Please try again.");
      }
    }, 3000);
  }, []);

  // Convert "HH:MM:SS" format to seconds for comparison
  const timeToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Simulate camera type switching for demo purposes
  useEffect(() => {
    const cameras: Array<'wide' | 'zoom' | 'thermal' | 'ogi'> = ['wide', 'zoom', 'thermal', 'ogi'];
    let currentIndex = 0;
    const cameraTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % cameras.length;
      setCameraType(cameras[currentIndex]);
    }, 15000);
    return () => clearInterval(cameraTimer);
  }, []);

  // Handle timeline position updates (would be triggered by timeline interactions)
  const handleVideoPositionUpdate = (position: string) => {
    // Update the timestamp but don't change the hasVideo property
    setTimelinePosition(prev => ({
      ...prev,
      timestamp: position
    }));
    setTimestamp(position);
  };

  // Enhanced version of handleTimelinePositionChange to update simulated map
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
    
    // Update map position based on timeline position
    // For the simulated map we'll use a simplified approach
    const timestampSeconds = timeToSeconds(newPosition);
    const totalDuration = timeToSeconds(flightDuration);
    
    // Calculate progress percentage (0-1)
    const progress = Math.min(1, Math.max(0, timestampSeconds / totalDuration));
    
    // Map to the simulated map coordinates (naive approach for demo)
    // This assumes our flight path starts at around x:20, y:20 and ends at x:90, y:30
    setCurrentMapPosition({
      x: 20 + progress * 70, // Map from 20 to 90 based on progress
      y: 20 + Math.sin(progress * Math.PI) * 35, // Create an arc
      altitude: 120 - Math.abs(progress - 0.5) * 240, // Peak altitude in the middle
      heading: 45 + progress * 180 // Gradually change heading
    });
    
    console.log(`Timeline position updated to ${newPosition}`);
  };

  // Fetch flight details (placeholder)
  useEffect(() => {
    console.log(`Fetching flight details for flight: ${flightId}`);
    // This would be replaced with actual API call
  }, [flightId]);

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
                />
              </div>
            </ScrollArea>
          </div>
          
          {/* 2. Map Panel - Now using SimulatedMap */}
          <div className={cn(
            "bg-background-level-2 rounded-lg p-4 flex flex-col overflow-hidden transition-all duration-300",
            viewMode === 'video' ? 'hidden' : 'col-span-9',
            viewMode === 'split' ? 'col-span-6' : ''
          )}>
            <ScrollArea className="h-full w-full" type="auto">
              <div className="flex-1 h-full">
                <SimulatedMap 
                  flightId={flightId || 'unknown'} 
                  currentPosition={currentMapPosition}
                  isLoading={mapLoading}
                  error={mapError}
                  onRetry={handleMapRetry}
                  onTimelinePositionChange={handleTimelinePositionChange}
                />
              </div>
            </ScrollArea>
          </div>
          
          {/* 3. Flight Details Panel */}
          <div className="col-span-3 overflow-hidden h-full">
            <FlightDetailsPanel 
              flightId={flightId || 'unknown'} 
              flightMode="MISSION"
              timestamp={timelinePosition.timestamp} 
              className="h-full"
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
        />
      </footer>
    </div>
  );
};

export default FlightDetails;
