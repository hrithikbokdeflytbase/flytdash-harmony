
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Legend item type
interface LegendItem {
  color: string;
  label: string;
}

const MapLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Flight path mode items - updated with new names
  const pathItems: LegendItem[] = [
    { color: '#496DC8', label: 'Mission' },
    { color: '#8B5CF6', label: 'GTL' },
    { color: '#F97316', label: 'Manual' },
    { color: '#EF4444', label: 'RTDS' }
  ];

  // Marker items
  const markerItems: LegendItem[] = [
    { color: '#10B981', label: 'Takeoff Location' },   // Green
    { color: '#EF4444', label: 'Landing Location' },   // Red
    { color: '#0EA5E9', label: 'Dock Location' },      // Blue
    { color: '#FFFFFF', label: 'Waypoint' },           // White
  ];

  return (
    <div className="absolute bottom-12 left-2 z-20">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-48 bg-background-level-2/80 backdrop-blur-sm rounded-md border border-white/10 shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-1.5">
            <Info className="h-4 w-4 text-text-icon-02" />
            <span className="text-sm font-medium text-text-icon-01">Map Legend</span>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 space-y-3">
            {/* Flight Path Modes */}
            <div>
              <h4 className="text-xs uppercase text-text-icon-02 mb-1.5">Flight Path</h4>
              <div className="space-y-1.5">
                {pathItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-text-icon-01">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Markers */}
            <div>
              <h4 className="text-xs uppercase text-text-icon-02 mb-1.5">Markers</h4>
              <div className="space-y-1.5">
                {markerItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-text-icon-01">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MapLegend;
