
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MapLegendItem {
  color: string;
  label: string;
  icon?: React.ReactNode;
}

interface MapLegendProps {
  className?: string;
  flightDistance?: number; // in meters
  flightDuration?: number; // in seconds
}

const MapLegend: React.FC<MapLegendProps> = ({ 
  className,
  flightDistance,
  flightDuration 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Define these constants outside of any conditional blocks
  const pathTypes: MapLegendItem[] = [
    { color: '#496DC8', label: 'Mission Mode' },
    { color: '#8B5CF6', label: 'GTL Mode' },
    { color: '#F97316', label: 'Manual Control' },
  ];

  const markerTypes: MapLegendItem[] = [
    { color: '#10B981', label: 'Takeoff Location' },
    { color: '#EF4444', label: 'Landing Location' },
    { color: '#3B82F6', label: 'Dock Location' },
    { color: '#FFFFFF', label: 'Waypoint' },
  ];

  const formatDistance = (meters?: number): string => {
    if (meters === undefined) return 'N/A';
    if (meters < 1000) return `${meters.toFixed(0)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatDuration = (seconds?: number): string => {
    if (seconds === undefined) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Render the collapsed view if not visible
  if (!isVisible) {
    return (
      <Button
        variant="outline" 
        size="sm"
        className="absolute bottom-2 left-2 h-7 w-7 p-0 bg-background-level-2/80 backdrop-blur-sm z-10"
        onClick={() => setIsVisible(true)}
      >
        <span className="sr-only">Show legend</span>
        L
      </Button>
    );
  }

  // Render the full legend component
  return (
    <div className={cn(
      "absolute bottom-2 left-2 z-10 w-48 bg-background-level-2/90 backdrop-blur-sm rounded-md shadow-md border border-[rgba(255,255,255,0.08)] text-text-icon-01 text-xs",
      className
    )}>
      <div className="flex items-center justify-between p-2">
        <h3 className="font-medium">Map Legend</h3>
        <div className="flex gap-1">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                <span className="sr-only">Toggle legend details</span>
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0" 
            onClick={() => setIsVisible(false)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Hide legend</span>
          </Button>
        </div>
      </div>

      <CollapsibleContent>
        <div className="p-2 pt-0 space-y-2">
          <div>
            <h4 className="text-text-icon-02 mb-1">Path Types</h4>
            <div className="space-y-1">
              {pathTypes.map((item, index) => (
                <div key={`path-${index}`} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-1.5 rounded-sm" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-text-icon-02 mb-1">Markers</h4>
            <div className="space-y-1">
              {markerTypes.map((item, index) => (
                <div key={`marker-${index}`} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {(flightDistance !== undefined || flightDuration !== undefined) && (
            <div>
              <h4 className="text-text-icon-02 mb-1">Flight Statistics</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Distance:</span>
                  <span className="font-medium">{formatDistance(flightDistance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{formatDuration(flightDuration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </div>
  );
};

export default MapLegend;
