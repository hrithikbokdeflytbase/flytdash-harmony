
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, PlaneTakeoff, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle, Triangle, Square, AlertTriangle, CircleAlert, CircleX, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import MapLegend from './MapLegend';

// Flight path point interface
interface FlightPathPoint {
  x: number; // SVG x coordinate (0-100)
  y: number; // SVG y coordinate (0-100)
  altitude: number;
  timestamp: string;
  flightMode: 'mission' | 'gtl' | 'manual' | 'rtds';
}

// Waypoint interface
interface Waypoint {
  x: number;
  y: number;
  index: number;
}

// Event interface
interface Event {
  x: number;
  y: number;
  type: 'warning' | 'error';
  message: string;
}

// Map props interface
interface SimulatedMapProps {
  flightId: string;
  isLoading?: boolean;
  error?: string | null;
  currentPosition?: {
    x: number;
    y: number;
    altitude?: number;
    heading?: number;
  };
  onRetry?: () => void;
  onTimelinePositionChange?: (timestamp: string) => void;
}

const SimulatedMap: React.FC<SimulatedMapProps> = ({
  flightId,
  isLoading = false,
  error = null,
  currentPosition = { x: 70, y: 50, altitude: 120, heading: 45 },
  onRetry,
  onTimelinePositionChange
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [showCoordinates, setShowCoordinates] = useState<{x: number, y: number} | null>(null);
  const [showMarkerInfo, setShowMarkerInfo] = useState<{x: number, y: number, info: string} | null>(null);
  const [showAllMarkers, setShowAllMarkers] = useState(true);
  const [showPath, setShowPath] = useState(true);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock flight path data as SVG coordinates (0-100 range)
  const flightPath: FlightPathPoint[] = [
    { x: 20, y: 20, altitude: 0, timestamp: '00:00:00', flightMode: 'mission' },
    { x: 25, y: 25, altitude: 50, timestamp: '00:01:00', flightMode: 'mission' },
    { x: 30, y: 30, altitude: 100, timestamp: '00:02:00', flightMode: 'mission' },
    { x: 35, y: 25, altitude: 120, timestamp: '00:03:00', flightMode: 'mission' },
    { x: 40, y: 30, altitude: 120, timestamp: '00:04:00', flightMode: 'mission' },
    { x: 45, y: 35, altitude: 130, timestamp: '00:05:00', flightMode: 'gtl' },
    { x: 50, y: 40, altitude: 140, timestamp: '00:06:00', flightMode: 'gtl' },
    { x: 55, y: 45, altitude: 130, timestamp: '00:07:00', flightMode: 'manual' },
    { x: 60, y: 50, altitude: 120, timestamp: '00:08:00', flightMode: 'manual' },
    { x: 65, y: 55, altitude: 130, timestamp: '00:09:00', flightMode: 'manual' },
    { x: 70, y: 50, altitude: 120, timestamp: '00:10:00', flightMode: 'mission' },
    { x: 75, y: 45, altitude: 110, timestamp: '00:11:00', flightMode: 'rtds' },
    { x: 80, y: 40, altitude: 100, timestamp: '00:12:00', flightMode: 'rtds' },
    { x: 85, y: 35, altitude: 50, timestamp: '00:13:00', flightMode: 'rtds' },
    { x: 90, y: 30, altitude: 0, timestamp: '00:14:00', flightMode: 'rtds' },
  ];

  // Mock waypoints
  const waypoints: Waypoint[] = [
    { x: 35, y: 25, index: 1 },
    { x: 55, y: 45, index: 2 },
    { x: 75, y: 45, index: 3 },
  ];

  // Mock events
  const events: Event[] = [
    { x: 45, y: 35, type: 'warning', message: 'Strong wind detected' },
    { x: 65, y: 55, type: 'error', message: 'Sensor malfunction' },
  ];

  // Handle zoom in
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };

  // Handle zoom out
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  // Handle pan
  const handlePan = (dx: number, dy: number) => {
    setPanOffset(prev => ({ 
      x: prev.x + dx, 
      y: prev.y + dy 
    }));
  };

  // Toggle map style
  const toggleMapStyle = () => {
    setMapStyle(prev => prev === 'dark' ? 'satellite' : 'dark');
  };

  // Focus on drone
  const focusOnDrone = () => {
    if (currentPosition) {
      setPanOffset({ 
        x: -(currentPosition.x * zoomLevel - 50), 
        y: -(currentPosition.y * zoomLevel - 50) 
      });
    }
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      const dx = (e.clientX - dragStart.x) / zoomLevel;
      const dy = (e.clientY - dragStart.y) / zoomLevel;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    // Calculate relative position in SVG
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setShowCoordinates({ x, y });
    }
  };

  // Handle mouse up for dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Handle mouse leave for dragging
  const handleMouseLeave = () => {
    setIsDragging(false);
    setDragStart(null);
    setShowCoordinates(null);
  };

  // Handle clicking on a point in the path
  const handlePathClick = (point: FlightPathPoint) => {
    if (onTimelinePositionChange) {
      onTimelinePositionChange(point.timestamp);
    }
  };

  // Handle clicking on a marker
  const handleMarkerClick = (x: number, y: number, info: string) => {
    setShowMarkerInfo({ x, y, info });
    setTimeout(() => setShowMarkerInfo(null), 3000);
  };

  // Generate path strings for each flight mode
  const generatePathStrings = () => {
    const paths: Record<string, string> = {
      mission: '',
      gtl: '',
      manual: '',
      rtds: ''
    };
    
    let prevMode: string | null = null;
    
    flightPath.forEach((point, index) => {
      if (index === 0) {
        // Start all paths with this point
        Object.keys(paths).forEach(mode => {
          paths[mode] = `M ${point.x} ${point.y}`;
        });
        prevMode = point.flightMode;
      } else {
        // Continue only the current mode's path
        paths[point.flightMode] += ` L ${point.x} ${point.y}`;
        prevMode = point.flightMode;
      }
    });
    
    return paths;
  };

  // Get flight mode color
  const getFlightModeColor = (mode: string): string => {
    switch (mode) {
      case 'mission': return '#3B82F6'; // Blue
      case 'gtl': return '#14B8A6';     // Green
      case 'manual': return '#F97316';  // Orange
      case 'rtds': return '#F6603B';    // Red-orange
      default: return '#888888';
    }
  };

  // Generate grid lines for map background
  const generateGrid = () => {
    const gridLines: JSX.Element[] = [];
    const spacing = 10; // Grid spacing
    
    // Vertical lines
    for (let i = 0; i <= 100; i += spacing) {
      gridLines.push(
        <line 
          key={`v-${i}`} 
          x1={i} 
          y1="0" 
          x2={i} 
          y2="100" 
          stroke={mapStyle === 'dark' ? '#333333' : '#666666'} 
          strokeWidth="0.2" 
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i <= 100; i += spacing) {
      gridLines.push(
        <line 
          key={`h-${i}`} 
          x1="0" 
          y1={i} 
          x2="100" 
          y2={i} 
          stroke={mapStyle === 'dark' ? '#333333' : '#666666'} 
          strokeWidth="0.2" 
        />
      );
    }
    
    return gridLines;
  };

  // Find closest point on path to current time
  const findClosestPoint = (timestamp: string): FlightPathPoint | null => {
    const targetTime = timestamp.split(':').map(Number);
    const targetSeconds = targetTime[0] * 3600 + targetTime[1] * 60 + (targetTime[2] || 0);
    
    let closestPoint = null;
    let minDiff = Infinity;
    
    flightPath.forEach(point => {
      const pointTime = point.timestamp.split(':').map(Number);
      const pointSeconds = pointTime[0] * 3600 + pointTime[1] * 60 + (pointTime[2] || 0);
      const diff = Math.abs(pointSeconds - targetSeconds);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestPoint = point;
      }
    });
    
    return closestPoint;
  };

  // Calculate transform for the SVG viewBox
  const getViewBoxTransform = () => {
    const centerX = 50;
    const centerY = 50;
    const viewWidth = 100 / zoomLevel;
    const viewHeight = 100 / zoomLevel;
    const offsetX = centerX - viewWidth / 2 - panOffset.x;
    const offsetY = centerY - viewHeight / 2 - panOffset.y;
    
    return `${offsetX} ${offsetY} ${viewWidth} ${viewHeight}`;
  };

  // Toggle markers visibility
  const toggleMarkers = () => {
    setShowAllMarkers(prev => !prev);
  };

  // Toggle path visibility
  const togglePath = () => {
    setShowPath(prev => !prev);
  };

  const pathStrings = generatePathStrings();

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)]",
        mapStyle === 'dark' ? 'bg-[#111318]' : 'bg-[#2A3A4A]',
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
    >
      {/* SVG Map */}
      <svg 
        ref={svgRef}
        className="w-full h-full"
        viewBox={getViewBoxTransform()}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Map Background */}
        <rect 
          x="0" 
          y="0" 
          width="100" 
          height="100" 
          fill={mapStyle === 'dark' ? '#111318' : '#2A3A4A'} 
        />
        
        {/* Grid Lines */}
        {generateGrid()}
        
        {/* Flight Paths */}
        {showPath && Object.keys(pathStrings).map(mode => (
          <path
            key={mode}
            d={pathStrings[mode]}
            stroke={getFlightModeColor(mode)}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
            className="transition-colors duration-300"
          />
        ))}
        
        {/* Takeoff Point */}
        {showAllMarkers && flightPath.length > 0 && (
          <g 
            transform={`translate(${flightPath[0].x}, ${flightPath[0].y})`}
            onClick={() => handleMarkerClick(flightPath[0].x, flightPath[0].y, "Takeoff Point")}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <circle r="3" fill="#10B981" opacity="0.7" />
            <circle r="2" fill="#10B981" />
            <text 
              x="0" 
              y="0.5" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="white" 
              fontSize="2.5"
              fontWeight="bold"
            >T</text>
          </g>
        )}
        
        {/* Landing Point */}
        {showAllMarkers && flightPath.length > 0 && (
          <g 
            transform={`translate(${flightPath[flightPath.length - 1].x}, ${flightPath[flightPath.length - 1].y})`}
            onClick={() => handleMarkerClick(
              flightPath[flightPath.length - 1].x, 
              flightPath[flightPath.length - 1].y, 
              "Landing Point"
            )}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <circle r="3" fill="#EF4444" opacity="0.7" />
            <circle r="2" fill="#EF4444" />
            <text 
              x="0" 
              y="0.5" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="white" 
              fontSize="2.5"
              fontWeight="bold"
            >L</text>
          </g>
        )}
        
        {/* Waypoints */}
        {showAllMarkers && waypoints.map((wp) => (
          <g 
            key={`waypoint-${wp.index}`}
            transform={`translate(${wp.x}, ${wp.y})`}
            onClick={() => handleMarkerClick(wp.x, wp.y, `Waypoint ${wp.index}`)}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <circle r="2.5" fill="#FFFFFF" opacity="0.7" />
            <text 
              x="0" 
              y="0.7" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="#000000" 
              fontSize="2.5"
              fontWeight="bold"
            >{wp.index}</text>
          </g>
        ))}
        
        {/* Events */}
        {showAllMarkers && events.map((event, index) => (
          <g 
            key={`event-${index}`}
            transform={`translate(${event.x}, ${event.y})`}
            onClick={() => handleMarkerClick(event.x, event.y, event.message)}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            {event.type === 'warning' ? (
              <polygon 
                points="0,-3 2.6,1.5 -2.6,1.5" 
                fill="#F59E0B" 
                stroke="#FCD34D" 
                strokeWidth="0.5"
              />
            ) : (
              <rect 
                x="-2.5" 
                y="-2.5" 
                width="5" 
                height="5" 
                fill="#EF4444" 
                stroke="#FCA5A5" 
                strokeWidth="0.5"
                transform="rotate(45)"
              />
            )}
          </g>
        ))}
        
        {/* Current Position Marker */}
        {currentPosition && (
          <g 
            transform={`translate(${currentPosition.x}, ${currentPosition.y}) rotate(${currentPosition.heading || 0})`}
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={() => handleMarkerClick(
              currentPosition.x, 
              currentPosition.y, 
              `Current Position\nAltitude: ${currentPosition.altitude || 0}m`
            )}
          >
            <circle r="1.5" fill="#60A5FA" opacity="0.5" />
            <polygon 
              points="0,-3 2,2 0,1 -2,2" 
              fill="#3B82F6" 
              stroke="#93C5FD" 
              strokeWidth="0.3"
            />
          </g>
        )}
        
        {/* Marker Info Popup */}
        {showMarkerInfo && (
          <g transform={`translate(${showMarkerInfo.x}, ${showMarkerInfo.y - 8})`}>
            <rect 
              x="-20" 
              y="-12" 
              width="40" 
              height="10" 
              rx="2" 
              ry="2" 
              fill="rgba(0,0,0,0.7)" 
              stroke="#555" 
              strokeWidth="0.3"
            />
            <text 
              x="0" 
              y="-6" 
              textAnchor="middle" 
              fill="white" 
              fontSize="3"
            >{showMarkerInfo.info}</text>
            <polygon 
              points="0,0 -5,-2 5,-2" 
              fill="rgba(0,0,0,0.7)" 
            />
          </g>
        )}
        
        {/* Interactive Path Points - invisible but clickable */}
        {flightPath.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="transparent"
            stroke="transparent"
            className="cursor-pointer"
            onClick={() => handlePathClick(point)}
            onMouseOver={() => setShowMarkerInfo({ 
              x: point.x, 
              y: point.y, 
              info: `Time: ${point.timestamp}\nAlt: ${point.altitude}m` 
            })}
            onMouseOut={() => setShowMarkerInfo(null)}
          />
        ))}
      </svg>
      
      {/* Map Legend */}
      <MapLegend />
      
      {/* Map Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={zoomIn} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom in</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={zoomOut} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={focusOnDrone} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90"
              >
                <PlaneTakeoff className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Focus on drone</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={toggleMapStyle} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90"
              >
                <Circle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Toggle map style</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90"
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Map layers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={toggleMarkers}>
              {showAllMarkers ? 'Hide all markers' : 'Show all markers'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={togglePath}>
              {showPath ? 'Hide flight path' : 'Show flight path'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={toggleMapStyle}>
              Switch to {mapStyle === 'dark' ? 'satellite' : 'dark'} mode
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Pan Controls */}
      <div className="absolute bottom-12 left-4 grid grid-cols-3 gap-1 z-10">
        <div />
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90"
          onClick={() => handlePan(0, 5)}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div />
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90"
          onClick={() => handlePan(5, 0)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div />
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90"
          onClick={() => handlePan(-5, 0)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div />
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90"
          onClick={() => handlePan(0, -5)}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <div />
      </div>
      
      {/* Coordinates Display */}
      {showCoordinates && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-background-level-3/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs text-text-icon-02 z-10">
          X: {showCoordinates.x.toFixed(1)} | Y: {showCoordinates.y.toFixed(1)}
        </div>
      )}
      
      {/* Zoom Level Display */}
      <div className="absolute bottom-2 right-2 bg-background-level-3/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs text-text-icon-02 z-10">
        Zoom: {(zoomLevel * 100).toFixed(0)}%
      </div>
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-level-2 bg-opacity-80 z-20">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
            <span className="text-text-icon-01">Loading map data...</span>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-level-2 bg-opacity-80 z-20">
          <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-background-level-3/90 max-w-md text-center">
            <CircleX className="h-12 w-12 text-red-500 mb-2" />
            <h3 className="text-lg font-medium text-text-icon-01">Map Error</h3>
            <p className="text-text-icon-02 text-sm mb-3">{error}</p>
            {onRetry && (
              <Button onClick={onRetry}>Retry</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatedMap;
