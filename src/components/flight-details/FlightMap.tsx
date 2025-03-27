
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2, Plus, Minus, Layers, Map as MapIcon, PlaneTakeoff, Anchor, Maximize, Compass, Info, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MapLegend from './MapLegend';
import { cn } from '@/lib/utils';

// Convert "HH:MM:SS" format to seconds for comparison
const timeToSeconds = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Flight path point interface
interface FlightPathPoint {
  lat: number;
  lng: number;
  altitude: number;
  timestamp: string;
  flightMode: 'mission' | 'gtl' | 'manual' | 'rtds';
}

// Map props interface
interface FlightMapProps {
  flightId: string;
  flightPath?: FlightPathPoint[];
  takeoffPoint?: {
    lat: number;
    lng: number;
  };
  landingPoint?: {
    lat: number;
    lng: number;
  };
  dockLocation?: {
    lat: number;
    lng: number;
  };
  waypoints?: Array<{
    lat: number;
    lng: number;
    index: number;
  }>;
  currentPosition?: {
    lat: number;
    lng: number;
    altitude?: number;
    heading?: number;
  };
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const FlightMap: React.FC<FlightMapProps> = ({
  flightId,
  flightPath = [],
  takeoffPoint,
  landingPoint,
  dockLocation,
  waypoints = [],
  currentPosition,
  isLoading = true,
  error = null,
  onRetry
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const [showCoordinates, setShowCoordinates] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [isFlightPathEmpty, setIsFlightPathEmpty] = useState(flightPath.length === 0);
  const [showAllMarkers, setShowAllMarkers] = useState(true);
  const [showPastPath, setShowPastPath] = useState(true);
  const [showFuturePath, setShowFuturePath] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || error) return;

    // Get token from window object or use fallback
    const token = (window as any).MAPBOX_TOKEN || 'pk.eyJ1IjoiZmx5dGJhc2UiLCJhIjoiY2tlZ2QwbmUzMGR0cjJ6cGRtY3RpbGpraiJ9.I0gYgVZQc2pVv9XXGnVu5w';
    
    // Set Mapbox token
    mapboxgl.accessToken = token;

    try {
      // Create the map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: takeoffPoint || [-74.5, 40], // Default to a location if takeoff point not provided
        zoom: 13,
        pitch: 45,
        bearing: 0,
        antialias: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl({
        visualizePitch: true,
        showCompass: true
      }), 'top-right');

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }), 'bottom-left');

      // Handle map load event
      map.current.on('load', () => {
        setMapLoaded(true);
        console.log(`Map for flight ${flightId} loaded successfully`);
      });

      // Track zoom level
      map.current.on('zoom', () => {
        if (map.current) {
          setZoomLevel(Math.floor(map.current.getZoom()));
        }
      });

      // Track mouse position for coordinates display
      map.current.on('mousemove', e => {
        setShowCoordinates({
          lng: parseFloat(e.lngLat.lng.toFixed(4)),
          lat: parseFloat(e.lngLat.lat.toFixed(4))
        });
      });
      
      map.current.on('mouseout', () => {
        setShowCoordinates(null);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [flightId, error, takeoffPoint]);

  // Handle map style change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    const styleUrl = mapStyle === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/satellite-streets-v12';
    map.current.setStyle(styleUrl);
  }, [mapStyle, mapLoaded]);

  // Add flight path when map is loaded and path data is available
  useEffect(() => {
    if (!mapLoaded || !map.current || flightPath.length === 0) {
      setIsFlightPathEmpty(flightPath.length === 0);
      return;
    }

    setIsFlightPathEmpty(false);

    // Check if source already exists and remove it
    if (map.current.getSource('flight-path')) {
      map.current.removeLayer('flight-path-mission');
      map.current.removeLayer('flight-path-gtl');
      map.current.removeLayer('flight-path-manual');
      map.current.removeLayer('flight-path-rtds');
      map.current.removeSource('flight-path');
    }

    // Create coordinate arrays for each flight mode
    const missionCoordinates: Array<[number, number]> = [];
    const gtlCoordinates: Array<[number, number]> = [];
    const manualCoordinates: Array<[number, number]> = [];
    const rtdsCoordinates: Array<[number, number]> = [];

    // Group coordinates by flight mode
    let prevMode: string | null = null;
    let currentArray: Array<[number, number]> = [];
    flightPath.forEach((point) => {
      const coord: [number, number] = [point.lng, point.lat];
      
      // Determine which array to add to based on flight mode
      if (point.flightMode === 'mission') {
        missionCoordinates.push(coord);
      } else if (point.flightMode === 'gtl') {
        gtlCoordinates.push(coord);
      } else if (point.flightMode === 'manual') {
        manualCoordinates.push(coord);
      } else if (point.flightMode === 'rtds') {
        rtdsCoordinates.push(coord);
      }
    });

    // Add the flight path source
    map.current.addSource('flight-path', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { mode: 'mission' },
            geometry: {
              type: 'LineString',
              coordinates: missionCoordinates
            }
          },
          {
            type: 'Feature',
            properties: { mode: 'gtl' },
            geometry: {
              type: 'LineString',
              coordinates: gtlCoordinates
            }
          },
          {
            type: 'Feature',
            properties: { mode: 'manual' },
            geometry: {
              type: 'LineString',
              coordinates: manualCoordinates
            }
          },
          {
            type: 'Feature',
            properties: { mode: 'rtds' },
            geometry: {
              type: 'LineString',
              coordinates: rtdsCoordinates
            }
          }
        ]
      }
    });

    // Add mission mode layer
    map.current.addLayer({
      id: 'flight-path-mission',
      type: 'line',
      source: 'flight-path',
      filter: ['==', ['get', 'mode'], 'mission'],
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#496DC8', // Mission: Blue
        'line-width': 3,
        'line-opacity': 0.8,
        'line-blur': 1
      }
    });

    // Add GTL mode layer
    map.current.addLayer({
      id: 'flight-path-gtl',
      type: 'line',
      source: 'flight-path',
      filter: ['==', ['get', 'mode'], 'gtl'],
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#8B5CF6', // Purple
        'line-width': 3,
        'line-opacity': 0.8,
        'line-blur': 1
      }
    });

    // Add manual mode layer
    map.current.addLayer({
      id: 'flight-path-manual',
      type: 'line',
      source: 'flight-path',
      filter: ['==', ['get', 'mode'], 'manual'],
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#F97316', // Orange
        'line-width': 3,
        'line-opacity': 0.8,
        'line-blur': 1
      }
    });

    // Add RTDS (Return to Dock) mode layer
    map.current.addLayer({
      id: 'flight-path-rtds',
      type: 'line',
      source: 'flight-path',
      filter: ['==', ['get', 'mode'], 'rtds'],
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#14B8A6', // Teal
        'line-width': 3,
        'line-opacity': 0.8,
        'line-blur': 1
      }
    });

    // Fit the map to the flight path bounds
    if (flightPath.length > 0) {
      // Create a proper LngLatBounds object first
      const bounds = new mapboxgl.LngLatBounds();

      // Extend the bounds with each coordinate point
      flightPath.forEach(point => {
        bounds.extend([point.lng, point.lat]);
      });

      // Now use the properly constructed bounds object
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 2000
      });
    }
  }, [mapLoaded, flightPath]);

  // Add markers when map is loaded and marker data is available
  useEffect(() => {
    if (!mapLoaded || !map.current || !showAllMarkers) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Add takeoff marker
    if (takeoffPoint) {
      const takeoffMarkerEl = document.createElement('div');
      takeoffMarkerEl.className = 'flex items-center justify-center w-8 h-8';
      takeoffMarkerEl.innerHTML = `
        <div class="absolute w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/30 z-10"></div>
        <div class="absolute w-6 h-6 bg-green-500/30 rounded-full animate-ping"></div>
      `;
      new mapboxgl.Marker(takeoffMarkerEl).setLngLat([takeoffPoint.lng, takeoffPoint.lat]).setPopup(new mapboxgl.Popup({
        offset: 25
      }).setText('Takeoff Location')).addTo(map.current);
    }

    // Add landing marker
    if (landingPoint) {
      const landingMarkerEl = document.createElement('div');
      landingMarkerEl.className = 'flex items-center justify-center w-8 h-8';
      landingMarkerEl.innerHTML = `
        <div class="absolute w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/30 z-10"></div>
        <div class="absolute w-6 h-6 bg-red-500/30 rounded-full"></div>
      `;
      new mapboxgl.Marker(landingMarkerEl).setLngLat([landingPoint.lng, landingPoint.lat]).setPopup(new mapboxgl.Popup({
        offset: 25
      }).setText('Landing Location')).addTo(map.current);
    }

    // Add dock marker
    if (dockLocation) {
      const dockMarkerEl = document.createElement('div');
      dockMarkerEl.className = 'flex items-center justify-center w-8 h-8';
      dockMarkerEl.innerHTML = `
        <div class="absolute w-4 h-4 bg-blue-400 rounded-full shadow-lg shadow-blue-400/30 z-10"></div>
        <div class="absolute w-6 h-6 bg-blue-400/30 rounded-full"></div>
      `;
      new mapboxgl.Marker(dockMarkerEl).setLngLat([dockLocation.lng, dockLocation.lat]).setPopup(new mapboxgl.Popup({
        offset: 25
      }).setText('Dock Location')).addTo(map.current);
    }

    // Add waypoint markers
    waypoints.forEach(waypoint => {
      const waypointMarkerEl = document.createElement('div');
      waypointMarkerEl.className = 'flex items-center justify-center w-8 h-8';
      waypointMarkerEl.innerHTML = `
        <div class="flex items-center justify-center absolute w-5 h-5 bg-white text-background-level-2 rounded-full shadow-lg shadow-white/30 z-10 text-xs font-medium">
          ${waypoint.index}
        </div>
      `;
      new mapboxgl.Marker(waypointMarkerEl).setLngLat([waypoint.lng, waypoint.lat]).setPopup(new mapboxgl.Popup({
        offset: 25
      }).setText(`Waypoint ${waypoint.index}`)).addTo(map.current);
    });

    // Add warning event markers (example)
    const warningMarkerEl = document.createElement('div');
    warningMarkerEl.className = 'flex items-center justify-center w-8 h-8';
    warningMarkerEl.innerHTML = `
      <div class="absolute w-5 h-5 bg-amber-500/80 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
      </div>
    `;
    if (flightPath.length > 2) {
      const warningPoint = flightPath[Math.floor(flightPath.length / 2)]; // Midpoint of flight
      new mapboxgl.Marker(warningMarkerEl)
        .setLngLat([warningPoint.lng, warningPoint.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Strong Wind Warning'))
        .addTo(map.current);
    }

    // Add error event marker (example)
    const errorMarkerEl = document.createElement('div');
    errorMarkerEl.className = 'flex items-center justify-center w-8 h-8';
    errorMarkerEl.innerHTML = `
      <div class="absolute w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      </div>
    `;
    if (flightPath.length > 3) {
      const errorPoint = flightPath[Math.floor(flightPath.length * 0.75)]; // 3/4 through the flight
      new mapboxgl.Marker(errorMarkerEl)
        .setLngLat([errorPoint.lng, errorPoint.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Sensor Error'))
        .addTo(map.current);
    }
  }, [mapLoaded, takeoffPoint, landingPoint, dockLocation, waypoints, showAllMarkers]);

  // Add current position marker if available
  useEffect(() => {
    if (!mapLoaded || !map.current || !currentPosition) return;

    // Remove existing current position marker
    const existingMarkers = document.querySelectorAll('.drone-position-marker');
    existingMarkers.forEach(marker => marker.remove());

    const heading = currentPosition.heading || 0;
    const altitude = currentPosition.altitude || 0;
    const currentPosMarkerEl = document.createElement('div');
    currentPosMarkerEl.className = 'flex items-center justify-center w-10 h-10 relative drone-position-marker';
    currentPosMarkerEl.innerHTML = `
      <div class="absolute w-15 h-15 bg-primary-200/10 rounded-full animate-ping"></div>
      <div class="absolute w-4 h-4 bg-primary-200 rounded-full shadow-lg shadow-primary-200/50 z-10"></div>
      <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-background-level-3 px-2 py-0.5 rounded text-xs whitespace-nowrap">
        ${altitude.toFixed(0)}m
      </div>
      <div class="absolute w-6 h-1 bg-white" style="transform: rotate(${heading}deg); transform-origin: center left;"></div>
    `;
    new mapboxgl.Marker({
      element: currentPosMarkerEl,
      rotation: heading,
      rotationAlignment: 'map'
    }).setLngLat([currentPosition.lng, currentPosition.lat]).addTo(map.current);
    
    // Don't automatically move the map to the current position to avoid jarring movements
    // Instead, let users control this with the focus button
  }, [mapLoaded, currentPosition]);

  // Focus map on drone
  const focusOnDrone = () => {
    if (!map.current || !currentPosition) return;
    map.current.flyTo({
      center: [currentPosition.lng, currentPosition.lat],
      zoom: 16,
      duration: 1000
    });
  };

  // Focus map on dock
  const focusOnDock = () => {
    if (!map.current || !dockLocation) return;
    map.current.flyTo({
      center: [dockLocation.lng, dockLocation.lat],
      zoom: 16,
      duration: 1000
    });
  };

  // Show entire flight path
  const showEntirePath = () => {
    if (!map.current || flightPath.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    flightPath.forEach(point => {
      bounds.extend([point.lng, point.lat]);
    });
    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15,
      duration: 1000
    });
  };

  // Change map style
  const toggleMapStyle = () => {
    setMapStyle(prev => prev === 'dark' ? 'satellite' : 'dark');
  };

  // Handle zoom in
  const zoomIn = () => {
    if (!map.current) return;
    map.current.zoomIn({
      duration: 500
    });
  };

  // Handle zoom out
  const zoomOut = () => {
    if (!map.current) return;
    map.current.zoomOut({
      duration: 500
    });
  };

  // Toggle markers visibility
  const toggleMarkers = () => {
    setShowAllMarkers(prev => !prev);
  };

  return (
    <div className="relative w-full h-full rounded-200 overflow-hidden border border-[rgba(255,255,255,0.08)]">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0 bg-background-level-2"></div>
      
      {/* Add the Map Legend component */}
      <MapLegend />
      
      {/* Focus controls (top-right) */}
      <div className="absolute top-2 right-12 flex flex-col items-end space-y-1 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={focusOnDrone} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90" 
                disabled={!currentPosition || isLoading || !!error}
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
                onClick={focusOnDock} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90" 
                disabled={!dockLocation || isLoading || !!error}
              >
                <Anchor className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Focus on dock</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={showEntirePath} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90" 
                disabled={flightPath.length === 0 || isLoading || !!error}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>View entire path</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Main controls (bottom-right) */}
      <div className="absolute bottom-2 right-2 flex flex-col items-end space-y-1 z-10">
        <div className="flex flex-col items-center bg-background-level-3/80 rounded-md overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-none p-0" 
            onClick={zoomIn}
            disabled={isLoading || !!error}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <div className="text-xs text-text-icon-02 py-0.5">
            {zoomLevel}x
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-none p-0" 
            onClick={zoomOut}
            disabled={isLoading || !!error}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={toggleMapStyle} 
                variant="outline" 
                size="icon" 
                className="h-7 w-7 rounded-md bg-background-level-3/80 p-0"
                disabled={isLoading || !!error}
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Toggle map style ({mapStyle === 'dark' ? 'Dark' : 'Satellite'} view)</p>
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
                    className="h-7 w-7 rounded-md bg-background-level-3/80 p-0"
                    disabled={isLoading || !!error}
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
            <DropdownMenuItem onSelect={() => setShowPastPath(!showPastPath)}>
              {showPastPath ? 'Hide completed path' : 'Show completed path'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowFuturePath(!showFuturePath)}>
              {showFuturePath ? 'Hide planned path' : 'Show planned path'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={toggleMapStyle}>
              Switch to {mapStyle === 'dark' ? 'satellite' : 'dark'} mode
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* North arrow (top-left) */}
      <div className="absolute top-2 left-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-6 w-6 flex items-center justify-center bg-background-level-3/70 backdrop-blur-sm rounded-md">
                <Compass className="h-4 w-4 text-text-icon-01" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>North</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Coordinates display (bottom) */}
      {showCoordinates && !isLoading && !error && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-background-level-3/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs text-text-icon-02 z-10">
          Lng: {showCoordinates.lng} | Lat: {showCoordinates.lat}
        </div>
      )}
      
      {/* Empty state */}
      {isFlightPathEmpty && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-level-2 bg-opacity-80 z-20">
          <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-background-level-3/90 max-w-md text-center">
            <MapIcon className="h-12 w-12 text-text-icon-02 mb-2" />
            <h3 className="text-lg font-medium text-text-icon-01">No Flight Path Available</h3>
            <p className="text-text-icon-02 text-sm">There is no flight path data available for this flight.</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-level-2 bg-opacity-80 z-20">
          <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-background-level-3/90 max-w-md text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <h3 className="text-lg font-medium text-text-icon-01">Map Error</h3>
            <p className="text-text-icon-02 text-sm mb-3">{error}</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-level-2 bg-opacity-80 z-20">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 text-primary-200 animate-spin" />
            <span className="text-text-icon-01">Loading flight path...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightMap;
