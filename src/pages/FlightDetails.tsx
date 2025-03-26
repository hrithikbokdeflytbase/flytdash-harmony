
import React, { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Map, Video, Layers } from 'lucide-react';

// View mode types
type ViewMode = 'map' | 'video' | 'split';

const FlightDetails = () => {
  // State to track the current view mode
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  return (
    <div className="min-h-screen bg-background-bg flex flex-col">
      {/* Top section - View mode controls */}
      <div className="w-full bg-background-level-1 border-b border-outline-primary h-[50px] p-400 flex items-center">
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
