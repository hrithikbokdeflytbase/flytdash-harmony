
import React, { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Map, Video, Layers, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

// View mode types
type ViewMode = 'map' | 'video' | 'split';

const FlightDetails = () => {
  // Get the flight ID from URL parameters
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  
  // State to track the current view mode
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isLoading, setIsLoading] = useState(true);
  const [flightDetails, setFlightDetails] = useState<any>(null);

  // Fetch flight details based on ID
  useEffect(() => {
    // Simulate API call to fetch flight details
    setIsLoading(true);
    
    // Timeout to simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to fetch flight details
      // For now, we'll just set some mock data based on the flight ID
      if (flightId) {
        setFlightDetails({
          id: flightId,
          missionName: `Mission ${flightId}`,
          status: 'completed',
          timestamp: new Date().toISOString(),
        });
        toast.success(`Flight details loaded for flight ${flightId}`);
      } else {
        toast.error("No flight ID provided");
      }
      
      setIsLoading(false);
    }, 1000);
  }, [flightId]);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-background-bg flex flex-col">
      {/* Top section - View mode controls */}
      <div className="w-full bg-background-level-1 border-b border-outline-primary h-[50px] p-400 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-4" 
            onClick={handleBackClick}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
            className="bg-background-level-3/80 border border-outline-primary rounded-md p-0.5"
          >
            <ToggleGroupItem value="map" aria-label="Map view">
              <Map className="w-4 h-4 mr-2" />
              <span>Map</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="video" aria-label="Video view">
              <Video className="w-4 h-4 mr-2" />
              <span>Video</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="split" aria-label="Split view">
              <Layers className="w-4 h-4 mr-2" />
              <span>Split</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {/* Flight ID indicator */}
        {flightDetails && (
          <div className="text-text-icon-01 fb-body3-medium">
            Flight ID: {flightDetails.id} - {flightDetails.missionName}
          </div>
        )}
      </div>

      {/* Main content area - Three column layout */}
      <div className="flex-1 p-400 grid grid-cols-12 gap-200 min-h-0">
        {/* Video panel */}
        <div 
          className={`bg-background-level-2 rounded-200 border border-outline-primary flex items-center justify-center 
          ${viewMode === 'video' ? 'col-span-9' : viewMode === 'map' ? 'hidden' : 'col-span-4'}`}
        >
          <div className="text-text-icon-01 fb-title1-medium">Video Panel</div>
        </div>

        {/* Map panel */}
        <div 
          className={`bg-background-level-2 rounded-200 border border-outline-primary flex items-center justify-center 
          ${viewMode === 'map' ? 'col-span-9' : viewMode === 'video' ? 'hidden' : 'col-span-4'}`}
        >
          <div className="text-text-icon-01 fb-title1-medium">Map Panel</div>
        </div>

        {/* Telemetry/Events panel */}
        <div className="col-span-4 bg-background-level-2 rounded-200 border border-outline-primary flex items-center justify-center">
          <div className="text-text-icon-01 fb-title1-medium">Telemetry/Events Panel</div>
        </div>
      </div>

      {/* Bottom section - Timeline */}
      <div className="w-full bg-background-level-1 border-t border-outline-primary h-[320px] p-400 flex items-center justify-center">
        <div className="text-text-icon-01 fb-title1-medium">Timeline</div>
      </div>
    </div>
  );
};

export default FlightDetails;
