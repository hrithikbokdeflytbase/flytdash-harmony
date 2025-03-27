
import React from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Video, Map, SquareSplitHorizontal } from 'lucide-react';

export type ViewMode = 'map' | 'video' | 'split';

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({ 
  viewMode, 
  onViewModeChange 
}) => {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={value => value && onViewModeChange(value as ViewMode)}
      className="border rounded-md bg-background-level-2/50 p-1"
    >
      <ToggleGroupItem 
        value="map" 
        aria-label="Show map view"
        className="data-[state=on]:bg-background-level-3 rounded-sm text-xs"
      >
        <Map className="w-4 h-4 mr-1" />
        Map
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="video" 
        aria-label="Show video view"
        className="data-[state=on]:bg-background-level-3 rounded-sm text-xs"
      >
        <Video className="w-4 h-4 mr-1" />
        Video
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="split" 
        aria-label="Show split view"
        className="data-[state=on]:bg-background-level-3 rounded-sm text-xs"
      >
        <SquareSplitHorizontal className="w-4 h-4 mr-1" />
        Split
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewControls;
