import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2, Plus, Minus, Layers, Map as MapIcon, PlaneTakeoff, Anchor, Maximize, Compass, Info, Download, Share2, Ruler } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MapLegend from './MapLegend';

// Flight path point interface
interface FlightPathPoint {
  lat: number;
  lng: number;
  altitude: number;
  timestamp: string;
  flightMode: 'mission' | 'gtl' | 'manual';
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
}

// Temporary Mapbox token - in production, this should be managed through environment variables
// This is just for demonstration purposes
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmx5dGJhc2UiLCJhIjoiY2tlZ2QwbmUzMGR0cjJ6cGRtY3RpbGpraiJ9.I0gYgVZQc2pVv9XXGnVu5w';

// Simplify path if it has more than this number of points
const PATH_SIMPLIFICATION_THRESHOLD = 200;

const FlightMap: React.FC<FlightMapProps> = ({
  flightId,
  flightPath = [],
  takeoffPoint,
  landingPoint,
  dockLocation,
  waypoints = [],
  currentPosition,
  isLoading = true
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

  // Memoize and simplify flight path for better performance
  const optimizedFlightPath = useMemo(() => {
    // If flight path is short enough, return as is
    if (flightPath.length <= PATH_SIMPLIFICATION_THRESHOLD) {
      return flightPath;
    }
    
    // Simple path simplification - keep every nth point
    const simplificationFactor = Math.ceil(flightPath.length / PATH_SIMPLIFICATION_THRESHOLD);
    const simplifiedPath: FlightPathPoint[] = [];
    
    // Always keep first and last points
    if (flightPath.length > 0) simplifiedPath.push(flightPath[0]);
    
    // Add points based on simplification factor
    for (let i = 1; i < flightPath.length - 1; i++) {
      // Keep points that are at mode boundaries or every nth point
      const prevMode = flightPath[i-1].flightMode;
      const currentMode = flightPath[i].flightMode;
      
      if (prevMode !== currentMode || i % simplificationFactor === 0) {
        simplifiedPath.push(flightPath[i]);
      }
    }
    
    // Add last point
    if (flightPath.length > 1) {
      simplifiedPath.push(flightPath[flightPath.length - 1]);
    }
    
    console.log(`Path simplified: ${flightPath.length} → ${simplifiedPath.length} points`);
    return simplifiedPath;
  }, [flightPath]);
  
  // Calculate flight statistics
  const flightStats = useMemo(() => {
    if (flightPath.length < 2) return { distance: 0, duration: 0 };
    
    let totalDistance = 0;
    
    // Calculate total distance using Haversine formula
    for (let i = 1; i < flightPath.length; i++) {
      const p1 = flightPath[i-1];
      const p2 = flightPath[i];
      
      // Haversine formula for distance between points on a sphere
      const R = 6371000; // Earth radius in meters
      const dLat = (p2.lat - p1.lat) * Math.PI / 180;
      const dLon = (p2.lng - p1.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      totalDistance += distance;
    }
    
    // Calculate duration if there are timestamps
    let durationSeconds = 0;
    if (flightPath.length >= 2) {
      const startTime = timeToSeconds(flightPath[0].timestamp);
      const endTime = timeToSeconds(flightPath[flightPath.length - 1].timestamp);
      durationSeconds = endTime - startTime;
    }
    
    return { 
      distance: totalDistance,
      duration: durationSeconds
    };
  }, [flightPath]);
  
  // Convert "HH:MM:SS" format to seconds for comparison
  const timeToSeconds = useCallback((timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }, []);
  
  // Performance optimized markers rendering
  const renderMarkers = useCallback(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Add takeoff marker
    if (takeoffPoint) {
      const takeoffMarkerEl = document.createElement('div');
      takeoffMarkerEl.className = 'flex items-center justify-center w-6 h-6';
      takeoffMarkerEl.innerHTML = `
        <div class="absolute w-3 h-3 bg-success-200 rounded-full shadow-lg shadow-success-200/30 z-10"></div>
        <div class="absolute w-5 h-5 bg-success-200/30 rounded-full animate-ping"></div>
      `;
      new mapboxgl.Marker(takeoffMarkerEl).setLngLat([takeoffPoint.lng, takeoffPoint.lat]).setPopup(new mapboxgl.Popup({
        offset: 25
      }).setText('Takeoff Location')).addTo(map.current);
    }

    // Add landing marker
    if (landingPoint) {
      const landingMarkerEl = document.createElement('div');
      landingMarkerEl.className = 'flex items-center justify-center w-6 h-6';
      landingMarkerEl.innerHTML = `
        <div class="absolute w-3 h-3 bg-error-200 rounded-full shadow-lg shadow-error-200/30 z-10"></div>
        <div class="absolute w-5 h-5 bg-error-200/30 rounded-full"></div>
      `;
      new mapboxgl.Marker(landingMarkerEl).setLngLat([landingPoint.lng, landingPoint.lat]).setPopup(new mapboxgl.Popup({
        offset: 25
      }).setText('Landing Location')).addTo(map.current);
    }

    // Add dock marker
    if (dockLocation) {
      const dockMarkerEl = document.createElement('div');
      dockMarkerEl.className = 'flex items-center justify-center w-6 h-6';
      dockMarkerEl.innerHTML = `
        <div class="absolute w-3 h-3 bg-info-200 rounded-full shadow-lg shadow-info-200/30 z-10"></div>
        <div class="absolute w-5 h-5 bg-info-200/30 rounded-full"></div>
      `;
      new mapboxgl.Marker(dockMarkerEl).setLngLat([dockLocation.lng, dockLocation.lat]).setPopup(new mapboxgl.Popup({
        offset: 25
      }).setText('Dock Location')).addTo(map.current);
    }

    // Add waypoint markers
    waypoints.forEach(waypoint => {
      const waypointMarkerEl = document.createElement('div');
      waypointMarkerEl.className = 'flex items-center justify-center w-6 h-6';
      waypointMarkerEl.innerHTML = `
        <div class="flex items-center justify-center absolute w-4 h-4 bg-white text-background-level-2 rounded-full shadow-lg shadow-white/30 z-10 text-xs font-medium">
          ${waypoint.index}
        </div>
      `;
      new mapboxgl.Marker(waypointMarkerEl).setLngLat([waypoint.lng, waypoint.lat]).setPopup(new mapboxgl.Popup({
        offset: 25
      }).setText(`Waypoint ${waypoint.index}`)).addTo(map.current);
    });

    // Add current position marker if available
    if (currentPosition) {
      const heading = currentPosition.heading || 0;
      const altitude = currentPosition.altitude || 0;
      const currentPosMarkerEl = document.createElement('div');
      currentPosMarkerEl.className = 'flex items-center justify-center w-8 h-8 relative';
      currentPosMarkerEl.innerHTML = `
        <div class="absolute w-12 h-12 bg-primary-200/10 rounded-full animate-ping"></div>
        <div class="absolute w-3 h-3 bg-primary-200 rounded-full shadow-lg shadow-primary-200/50 z-10"></div>
        <div class="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-background-level-3 px-1.5 py-0.5 rounded text-xs whitespace-nowrap">
          ${altitude.toFixed(0)}m
        </div>
        <div class="absolute w-5 h-0.5 bg-white" style="transform: rotate(${heading}deg); transform-origin: center left;"></div>
      `;
      new mapboxgl.Marker({
        element: currentPosMarkerEl,
        rotation: heading,
        rotationAlignment: 'map'
      }).setLngLat([currentPosition.lng, currentPosition.lat]).addTo(map.current);

      // Smoothly move map to current position
      map.current.easeTo({
        center: [currentPosition.lng, currentPosition.lat],
        duration: 1000
      });
    }
  }, [mapLoaded, takeoffPoint, landingPoint, dockLocation, waypoints, currentPosition]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Create the map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: takeoffPoint || [-74.5, 40],
      // Default to a location if takeoff point not provided
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

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [flightId]);

  // Handle map style change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    const styleUrl = mapStyle === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/satellite-streets-v12';
    map.current.setStyle(styleUrl);
  }, [mapStyle, mapLoaded]);

  // Add flight path when map is loaded and path data is available - optimized version
  useEffect(() => {
    if (!mapLoaded || !map.current || optimizedFlightPath.length === 0) return;

    // Check if source already exists and remove it
    if (map.current.getSource('flight-path')) {
      map.current.removeLayer('flight-path-mission');
      map.current.removeLayer('flight-path-gtl');
      map.current.removeLayer('flight-path-manual');
      map.current.removeSource('flight-path');
    }

    // Create coordinate arrays for each flight mode
    const missionCoordinates: Array<[number, number]> = [];
    const gtlCoordinates: Array<[number, number]> = [];
    const manualCoordinates: Array<[number, number]> = [];

    // Group coordinates by flight mode
    optimizedFlightPath.forEach((point) => {
      const coord: [number, number] = [point.lng, point.lat];
      
      if (point.flightMode === 'mission') {
        missionCoordinates.push(coord);
      } else if (point.flightMode === 'gtl') {
        gtlCoordinates.push(coord);
      } else if (point.flightMode === 'manual') {
        manualCoordinates.push(coord);
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
          }
        ]
      }
    });

    // Add layers for each flight mode
    if (missionCoordinates.length > 0) {
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
          'line-color': '#496DC8', // Primary 200
          'line-width': 3,
          'line-opacity': 0.8,
          'line-blur': 1
        }
      });
    }

    if (gtlCoordinates.length > 0) {
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
    }

    if (manualCoordinates.length > 0) {
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
    }

    // Fit the map to the flight path bounds
    if (optimizedFlightPath.length > 0) {
      // Create a proper LngLatBounds object first
      const bounds = new mapboxgl.LngLatBounds();

      // Extend the bounds with each coordinate point
      optimizedFlightPath.forEach(point => {
        bounds.extend([point.lng, point.lat]);
      });

      // Now use the properly constructed bounds object
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 2000
      });
    }
  }, [mapLoaded, optimizedFlightPath]);

  // Add markers with optimized rendering
  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

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

  // Download map as image functionality
  const downloadMapAsImage = () => {
    if (!map.current) return;

    // Get map canvas
    const canvas = map.current.getCanvas();
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `flight-map-${flightId}.png`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Share map view functionality
  const shareMapView = () => {
    if (!map.current) return;
    
    // Get current map center and zoom
    const center = map.current.getCenter();
    const zoom = map.current.getZoom();
    const bearing = map.current.getBearing();
    const pitch = map.current.getPitch();
    
    // Create shareable URL with map state
    const mapState = {
      lat: center.lat.toFixed(6),
      lng: center.lng.toFixed(6),
      zoom: zoom.toFixed(2),
      bearing: bearing.toFixed(2),
      pitch: pitch.toFixed(2)
    };
    
    // Create URL with map state parameters
    const shareUrl = new URL(window.location.href);
    Object.entries(mapState).forEach(([key, value]) => {
      shareUrl.searchParams.set(key, value);
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl.toString())
      .then(() => {
        alert('Map view URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy URL: ', err);
      });
  };

  return (
    <div className="relative w-full h-full rounded-200 overflow-hidden border border-[rgba(255,255,255,0.08)]">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0 bg-background-level-2"></div>
      
      {/* Focus controls (top-right) */}
      <div className="absolute top-2 right-12 flex flex-col items-end space-y-1 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={focusOnDrone} variant="outline" size="icon" className="h-6 w-6 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90" disabled={!currentPosition}>
                <PlaneTakeoff className="h-3 w-3" />
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
              <Button onClick={focusOnDock} variant="outline" size="icon" className="h-6 w-6 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90" disabled={!dockLocation}>
                <Anchor className="h-3 w-3" />
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
              <Button onClick={showEntirePath} variant="outline" size="icon" className="h-6 w-6 rounded-md bg-background-level-3/70 backdrop-blur-sm hover:bg-background-level-3/90" disabled={flightPath.length === 0}>
                <Maximize className="h-3 w-3" />
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
        <div className="flex flex-col items-center bg-background-level-3/70 rounded-md overflow-hidden">
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-none p-0" onClick={zoomIn}>
            <Plus className="h-3 w-3" />
          </Button>
          <div className="text-xs text-text-icon-02 py-0.5">
            {zoomLevel}x
          </div>
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-none p-0" onClick={zoomOut}>
            <Minus className="h-3 w-3" />
          </Button>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={toggleMapStyle} variant="outline" size="icon" className="h-6 w-6 rounded-md bg-background-level-3/70 p-0">
                <MapIcon className="h-3 w-3" />
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
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-md bg-background-level-3/70 p-0">
                    <Layers className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Map layers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={() => console.log('Toggle flight path')}>
              Show flight path
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => console.log('Toggle markers')}>
              Show markers
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => console.log('Toggle terrain')}>
              Show terrain
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Additional tool buttons */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={downloadMapAsImage} 
                variant="outline" 
                size="icon" 
                className="h-6 w-6 rounded-md bg-background-level-3/70 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Download map as image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={shareMapView} 
                variant="outline" 
                size="icon" 
                className="h-6 w-6 rounded-md bg-background-level-3/70 p-0"
              >
                <Share2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Share map view</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* North arrow (top-left) */}
      <div className="absolute top-2 left-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-5 w-5 flex items-center justify-center bg-background-level-3/70 backdrop-blur-sm rounded-md">
                <Compass className="h-3 w-3 text-text-icon-01" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>North</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Map Legend */}
      <MapLegend 
        flightDistance={flightStats.distance} 
        flightDuration={flightStats.duration}
      />
      
      {/* Coordinates display (bottom) */}
      {showCoordinates && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-background-level-3/70 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs text-text-icon-02 z-10">
          Lng: {showCoordinates.lng} | Lat: {showCoordinates.lat}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-level-2 bg-opacity-80 z-20">
          <div className="flex flex-col items-center space-y-300">
            <Loader2 className="h-8 w-8 text-primary-200 animate-spin" />
            <span className="text-text-icon-01 fb-body1-medium">Loading flight path...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightMap;
