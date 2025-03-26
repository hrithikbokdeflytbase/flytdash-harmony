import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video, Map, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import VideoFeed from '@/components/flight-details/VideoFeed';
import FlightMap from '@/components/flight-details/FlightMap';
import FlightTimeline from '@/components/flight-details/FlightTimeline';

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
  endTime: string;   // Format: "HH:MM:SS"
  url: string;
};

// Mock flight path data
const mockFlightPath = [
  { lat: 37.7856, lng: -122.4308, altitude: 120, timestamp: '00:05:00', flightMode: 'mission' as const },
  { lat: 37.7845, lng: -122.4318, altitude: 125, timestamp: '00:06:00', flightMode: 'mission' as const },
  { lat: 37.7834, lng: -122.4328, altitude: 130, timestamp: '00:07:00', flightMode: 'gtl' as const },
  { lat: 37.7823, lng: -122.4338, altitude: 135, timestamp: '00:08:00', flightMode: 'gtl' as const },
  { lat: 37.7812, lng: -122.4348, altitude: 140, timestamp: '00:09:00', flightMode: 'manual' as const },
  { lat: 37.7801, lng: -122.4358, altitude: 145, timestamp: '00:10:00', flightMode: 'mission' as const },
  { lat: 37.7790, lng: -122.4368, altitude: 150, timestamp: '00:11:00', flightMode: 'mission' as const },
];

// Mock waypoints
const mockWaypoints = [
  { lat: 37.7845, lng: -122.4318, index: 1 },
  { lat: 37.7823, lng: -122.4338, index: 2 },
  { lat: 37.7790, lng: -122.4368, index: 3 },
];

const FlightDetails = () => {
  const { flightId } = useParams();
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
  const [videoSegments, setVideoSegments] = useState<VideoSegment[]>([
    { startTime: '00:10:00', endTime: '00:12:30', url: '/videos/segment1.mp4' },
    { startTime: '00:15:00', endTime: '00:18:45', url: '/videos/segment2.mp4' },
    { startTime: '00:22:15', endTime: '00:25:00', url: '/videos/segment3.mp4' }
  ]);
  
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
  
  // Handle timeline position changes from the timeline component
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
    const pathIndex = Math.min(
      Math.floor(positionRatio * mockFlightPath.length),
      mockFlightPath.length - 1
    );
    
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
  
  return (
    <div className="flex flex-col h-screen bg-[#111113]">
      {/* Top Bar - Map/Video Controls */}
      <header className="bg-background-level-1 p-400 flex items-center justify-between z-10">
        <Button 
          variant="ghost" 
          className="flex items-center gap-200 text-text-icon-01"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Button>
        
        <h1 className="fb-title1-medium text-text-icon-01">
          Flight Details: {flightId}
        </h1>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
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
      
      {/* Main Content Area - Three Column Layout */}
      <main className="flex-1 p-400 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-200 h-full">
          {/* Video Panel */}
          <div className={`bg-background-level-2 rounded-200 p-400 flex flex-col ${viewMode === 'video' ? 'lg:col-span-12' : viewMode === 'split' ? 'lg:col-span-5' : 'hidden lg:block lg:col-span-5'}`}>
            <VideoFeed 
              cameraType={cameraType}
              videoState={videoState}
              timelinePosition={timelinePosition}
              videoSegments={videoSegments}
              onPositionUpdate={handleVideoPositionUpdate}
            />
          </div>
          
          {/* Map Panel */}
          <div className={`bg-background-level-2 rounded-200 p-400 flex flex-col ${viewMode === 'map' ? 'lg:col-span-12' : viewMode === 'split' ? 'lg:col-span-3' : 'hidden lg:block lg:col-span-7'}`}>
            <h2 className="fb-title1-medium text-text-icon-01 mb-300">Flight Map</h2>
            <div className="flex-1 bg-background-level-3 rounded-200">
              <FlightMap 
                flightId={flightId || 'unknown'}
                flightPath={mockFlightPath}
                takeoffPoint={{ lat: mockFlightPath[0].lat, lng: mockFlightPath[0].lng }}
                landingPoint={{ lat: mockFlightPath[mockFlightPath.length-1].lat, lng: mockFlightPath[mockFlightPath.length-1].lng }}
                dockLocation={{ lat: 37.7856, lng: -122.4308 }}
                waypoints={mockWaypoints}
                currentPosition={currentMapPosition}
                isLoading={mapLoading}
              />
            </div>
          </div>
          
          {/* Telemetry/Events Panel */}
          <div className={`bg-background-level-2 rounded-200 p-400 flex flex-col ${viewMode === 'video' || viewMode === 'map' ? 'hidden lg:block lg:col-span-4' : 'lg:col-span-4'}`}>
            <h2 className="fb-title1-medium text-text-icon-01 mb-300">Telemetry & Events</h2>
            <div className="flex-1 bg-background-level-3 rounded-200 p-300 overflow-y-auto">
              <div className="space-y-300">
                <div className="p-300 bg-background-level-4 rounded-200">
                  <h3 className="fb-body1-medium text-text-icon-01">Altitude</h3>
                  <p className="text-text-icon-02">120 meters</p>
                </div>
                <div className="p-300 bg-background-level-4 rounded-200">
                  <h3 className="fb-body1-medium text-text-icon-01">Speed</h3>
                  <p className="text-text-icon-02">15 m/s</p>
                </div>
                <div className="p-300 bg-background-level-4 rounded-200">
                  <h3 className="fb-body1-medium text-text-icon-01">Battery</h3>
                  <p className="text-text-icon-02">75%</p>
                </div>
                <div className="p-300 bg-background-level-4 rounded-200">
                  <h3 className="fb-body1-medium text-text-icon-01">Distance</h3>
                  <p className="text-text-icon-02">1.2 km</p>
                </div>
                <div className="p-300 bg-background-level-4 rounded-200">
                  <h3 className="fb-body1-medium text-text-icon-01">Flight Time</h3>
                  <p className="text-text-icon-02">{timelinePosition.timestamp}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom Section - Timeline */}
      <footer className="bg-background-level-1">
        <FlightTimeline 
          currentPosition={timelinePosition}
          videoSegments={videoSegments}
          flightDuration="05:30:00"
          onPositionChange={handleTimelinePositionChange}
        />
      </footer>
    </div>
  );
};

export default FlightDetails;
