
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video, Map, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import VideoFeed from '@/components/flight-details/VideoFeed';

// View mode type
type ViewMode = 'map' | 'video' | 'split';

// Camera type
type CameraType = 'wide' | 'zoom' | 'thermal';

// Video segment interface
interface VideoSegment {
  id: string;
  startTime: string;
  endTime: string;
  timestamp: number;
  cameraType: CameraType;
  url: string | null;
}

const FlightDetails = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(1654320000); // Example timestamp
  
  // Mock video segments data
  const mockVideoSegments: VideoSegment[] = [
    {
      id: '1',
      startTime: '10:00:00',
      endTime: '10:01:00',
      timestamp: 1654320000,
      cameraType: 'wide',
      url: null
    },
    {
      id: '2',
      startTime: '10:02:00',
      endTime: '10:03:00',
      timestamp: 1654320120,
      cameraType: 'zoom',
      url: null
    },
    {
      id: '3',
      startTime: '10:05:00',
      endTime: '10:06:00',
      timestamp: 1654320300,
      cameraType: 'thermal',
      url: null
    }
  ];
  
  // Fetch flight details (placeholder)
  useEffect(() => {
    console.log(`Fetching flight details for flight: ${flightId}`);
    // This would be replaced with actual API call
  }, [flightId]);
  
  return (
    <div className="flex flex-col h-screen bg-[#111113]">
      {/* Top Bar - Map/Video Controls */}
      <header className="bg-background-level-1 p-4 flex items-center justify-between z-10">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-text-icon-01"
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
      <main className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 h-full">
          {/* Video Panel */}
          <div className={`${viewMode === 'video' ? 'lg:col-span-12' : viewMode === 'split' ? 'lg:col-span-5' : 'hidden lg:block lg:col-span-5'}`}>
            <VideoFeed 
              currentTimestamp={currentTimestamp}
              videoSegments={mockVideoSegments}
            />
          </div>
          
          {/* Map Panel */}
          <div className={`bg-background-level-2 rounded-md p-4 flex flex-col ${viewMode === 'map' ? 'lg:col-span-12' : viewMode === 'split' ? 'lg:col-span-3' : 'hidden lg:block lg:col-span-7'}`}>
            <h2 className="fb-title1-medium text-text-icon-01 mb-3">Flight Map</h2>
            <div className="flex-1 bg-background-level-3 rounded-md flex items-center justify-center">
              <p className="text-text-icon-02">Flight path map will be displayed here</p>
            </div>
          </div>
          
          {/* Telemetry/Events Panel */}
          <div className={`bg-background-level-2 rounded-md p-4 flex flex-col ${viewMode === 'video' || viewMode === 'map' ? 'hidden lg:block lg:col-span-4' : 'lg:col-span-4'}`}>
            <h2 className="fb-title1-medium text-text-icon-01 mb-3">Telemetry & Events</h2>
            <div className="flex-1 bg-background-level-3 rounded-md p-3 overflow-y-auto">
              <div className="space-y-3">
                <div className="p-3 bg-background-level-4 rounded-md">
                  <h3 className="fb-body1-medium text-text-icon-01">Altitude</h3>
                  <p className="text-text-icon-02">120 meters</p>
                </div>
                <div className="p-3 bg-background-level-4 rounded-md">
                  <h3 className="fb-body1-medium text-text-icon-01">Speed</h3>
                  <p className="text-text-icon-02">15 m/s</p>
                </div>
                <div className="p-3 bg-background-level-4 rounded-md">
                  <h3 className="fb-body1-medium text-text-icon-01">Battery</h3>
                  <p className="text-text-icon-02">75%</p>
                </div>
                <div className="p-3 bg-background-level-4 rounded-md">
                  <h3 className="fb-body1-medium text-text-icon-01">Distance</h3>
                  <p className="text-text-icon-02">1.2 km</p>
                </div>
                <div className="p-3 bg-background-level-4 rounded-md">
                  <h3 className="fb-body1-medium text-text-icon-01">Flight Time</h3>
                  <p className="text-text-icon-02">00:15:32</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom Section - Timeline */}
      <footer className="bg-background-level-1 h-[240px] p-4">
        <div className="bg-background-level-2 h-full rounded-md p-4">
          <h2 className="fb-title1-medium text-text-icon-01 mb-3">Flight Timeline</h2>
          <div className="bg-background-level-3 h-[160px] rounded-md flex items-center justify-center">
            <p className="text-text-icon-02">Timeline data will be displayed here</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlightDetails;
