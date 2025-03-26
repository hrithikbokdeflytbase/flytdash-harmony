import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video, Map, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import VideoFeed from '@/components/flight-details/VideoFeed';
import FlightMap from '@/components/flight-details/FlightMap';
import FlightTimeline from '@/components/flight-details/FlightTimeline';
import FlightDetailsPanel from '@/components/flight-details/FlightDetailsPanel';

// View mode type
type ViewMode = 'map' | 'video' | 'split';

// Video state type
type VideoState = 'loading' | 'error' | 'empty' | 'playing';

// Timeline position type
interface TimelinePosition {
  timestamp: string; // Format: "HH:MM:SS"
  hasVideo: boolean;
}

// Video segment type
type VideoSegment = {
  startTime: string; // Format: "HH:MM:SS"
  endTime: string; // Format: "HH:MM:SS"
  url: string;
};

// Mission phase type
type MissionPhase = {
  type: 'manual' | 'gtl' | 'mission' | 'rtds';
  startTime: string; // Format: "HH:MM:SS"
  endTime: string; // Format: "HH:MM:SS"
  label: string;
};

// System event type
type SystemEvent = {
  type: 'connection' | 'calibration' | 'modeChange' | 'command';
  timestamp: string; // Format: "HH:MM:SS"
  details: string;
};

// Warning event type
type WarningEvent = {
  type: 'warning' | 'error';
  timestamp: string; // Format: "HH:MM:SS"
  details: string;
  severity: 'low' | 'medium' | 'high';
};

// Media action type
type MediaAction = {
  type: 'photo' | 'videoStart' | 'videoEnd';
  timestamp: string; // Format: "HH:MM:SS"
  fileId?: string;
};

// Mock flight path data
const mockFlightPath = [{
  lat: 37.7856,
  lng: -122.4308,
  altitude: 120,
  timestamp: '00:05:00',
  flightMode: 'mission' as const
}, {
  lat: 37.7845,
  lng: -122.4318,
  altitude: 125,
  timestamp: '00:06:00',
  flightMode: 'mission' as const
}, {
  lat: 37.7834,
  lng: -122.4328,
  altitude: 130,
  timestamp: '00:07:00',
  flightMode: 'gtl' as const
}, {
  lat: 37.7823,
  lng: -122.4338,
  altitude: 135,
  timestamp: '00:08:00',
  flightMode: 'gtl' as const
}, {
  lat: 37.7812,
  lng: -122.4348,
  altitude: 140,
  timestamp: '00:09:00',
  flightMode: 'manual' as const
}, {
  lat: 37.7801,
  lng: -122.4358,
  altitude: 145,
  timestamp: '00:10:00',
  flightMode: 'mission' as const
}, {
  lat: 37.7790,
  lng: -122.4368,
  altitude: 150,
  timestamp: '00:11:00',
  flightMode: 'mission' as const
}];

// Mock waypoints
const mockWaypoints = [{
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
  const {
    flightId
  } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Mock state for video feed props (would come from API in real app)
  const [videoState, setVideoState] = useState<VideoState>('loading');
  const [hasVideo, setHasVideo] = useState(false);
  const [timestamp, setTimestamp] = useState('00:15:32');
  const [cameraType, setCameraType] = useState<'wide' | 'zoom' | 'thermal'>('wide');
  const [recordingDuration, setRecordingDuration] = useState('00:03:45');

  // Timeline synchronization state
  const [timelinePosition, setTimelinePosition] = useState<TimelinePosition>({
    timestamp: '00:15:32',
    hasVideo: false
  });

  // Mock video segments (would come from API in real app)
  const [videoSegments, setVideoSegments] = useState<VideoSegment[]>([{
    startTime: '00:10:00',
    endTime: '00:12:30',
    url: '/videos/segment1.mp4'
  }, {
    startTime: '00:15:00',
    endTime: '00:18:45',
    url: '/videos/segment2.mp4'
  }, {
    startTime: '00:22:15',
    endTime: '00:25:00',
    url: '/videos/segment3.mp4'
  }]);

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
  const [currentMapPosition, setCurrentMapPosition] = useState({
    lat: mockFlightPath[0]?.lat || 37.7790,
    lng: mockFlightPath[0]?.lng || -122.4368
  });

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
    }, 3000);
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(mapTimer);
    };
  }, []);

  // Convert "HH:MM:SS" format to seconds for comparison
  const timeToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Simulate camera type switching for demo purposes
  useEffect(() => {
    const cameras: Array<'wide' | 'zoom' | 'thermal'> = ['wide', 'zoom', 'thermal'];
    let currentIndex = 0;
    const cameraTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % cameras.length;
      setCameraType(cameras[currentIndex]);
    }, 10000);
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

    // Update map position based on timeline position
    // This is a simplified approach - in a real app, you'd interpolate position based on timestamps
    const timestampSeconds = timeToSeconds(newPosition);
    const totalFlightSeconds = timeToSeconds('00:25:00'); // End of flight time
    const positionRatio = Math.min(timestampSeconds / totalFlightSeconds, 1);
    const pathIndex = Math.min(Math.floor(positionRatio * mockFlightPath.length), mockFlightPath.length - 1);
    if (mockFlightPath[pathIndex]) {
      setCurrentMapPosition({
        lat: mockFlightPath[pathIndex].lat,
        lng: mockFlightPath[pathIndex].lng
      });
    }
    console.log(`Timeline position updated to ${newPosition} (has video: ${positionHasVideo})`);
  };

  // Fetch flight details (placeholder)
  useEffect(() => {
    console.log(`Fetching flight details for flight: ${flightId}`);
    // This would be replaced with actual API call
  }, [flightId]);

  return <div className="flex flex-col h-screen bg-[#111113]">
      {/* Top Bar - Map/Video Controls */}
      <header className="bg-background-level-1 p-400 flex items-center justify-between z-10">
        <Button variant="ghost" className="flex items-center gap-200 text-text-icon-01" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Button>
        
        <h1 className="fb-title1-medium text-text-icon-01">
          Flight Details: {flightId}
        </h1>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={value => value && setViewMode(value as ViewMode)}>
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
      
      {/* Main Content Area - Adjusted to ensure proper layout with panel */}
      <main className="flex-1 p-400 pb-0 overflow-hidden flex" style={{ maxHeight: 'calc(100vh - 230px)' }}>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-400 h-full">
          {/* Video Panel */}
          <div className={`bg-background-level-2 rounded-200 p-400 flex flex-col ${viewMode === 'video' ? 'lg:col-span-12' : viewMode === 'split' ? 'lg:col-span-6' : 'hidden lg:block lg:col-span-6'}`}>
            <VideoFeed cameraType={cameraType} videoState={videoState} timelinePosition={timelinePosition} videoSegments={videoSegments} onPositionUpdate={handleVideoPositionUpdate} />
          </div>
          
          {/* Map Panel */}
          <div className={`bg-background-level-2 rounded-200 p-400 flex flex-col ${viewMode === 'map' ? 'lg:col-span-12' : viewMode === 'split' ? 'lg:col-span-3' : 'hidden lg:block lg:col-span-6'}`}>
            
            <div className="flex-1 bg-background-level-3 rounded-200">
              <FlightMap flightId={flightId || 'unknown'} flightPath={mockFlightPath} takeoffPoint={{
              lat: mockFlightPath[0].lat,
              lng: mockFlightPath[0].lng
            }} landingPoint={{
              lat: mockFlightPath[mockFlightPath.length - 1].lat,
              lng: mockFlightPath[mockFlightPath.length - 1].lng
            }} dockLocation={{
              lat: 37.7856,
              lng: -122.4308
            }} waypoints={mockWaypoints} currentPosition={currentMapPosition} isLoading={mapLoading} />
            </div>
          </div>
          
          {/* Flight Details Panel */}
          <div className={`lg:col-span-3 h-full`}>
            <FlightDetailsPanel 
              flightId={flightId || 'unknown'} 
              flightMode="MISSION"
              timestamp={timelinePosition.timestamp} 
            />
          </div>
        </div>
      </main>
      
      {/* Bottom Section - Timeline */}
      <footer className="bg-background-level-1" style={{ height: '200px' }}>
        <FlightTimeline currentPosition={timelinePosition} videoSegments={videoSegments} flightDuration="00:25:30" onPositionChange={handleTimelinePositionChange} missionPhases={missionPhases} systemEvents={systemEvents} warningEvents={warningEvents} mediaActions={mediaActions} />
      </footer>
    </div>;
};
export default FlightDetails;
