
// Fix the import for MapLegend
import MapLegend from './MapLegend';
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemEvent, WarningEvent, TimelinePosition } from './timeline/timelineTypes';

// Define the props interface
interface FlightMapProps {
  flightId: string;
  flightPath: {
    lat: number;
    lng: number;
    altitude: number;
    timestamp: string;
    flightMode: 'mission' | 'gtl' | 'manual' | 'rtds';
  }[];
  takeoffPoint: {
    lat: number;
    lng: number;
  };
  landingPoint: {
    lat: number;
    lng: number;
  };
  dockLocation: {
    lat: number;
    lng: number;
  };
  waypoints: {
    lat: number;
    lng: number;
    index: number;
  }[];
  currentPosition: {
    lat: number;
    lng: number;
    altitude: number;
    heading: number;
  };
  currentFlightMode: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onPathClick: (timestamp: string) => void;
  timelinePosition: TimelinePosition;
  systemEvents?: SystemEvent[];
  warningEvents?: WarningEvent[];
}

const FlightMap: React.FC<FlightMapProps> = ({
  flightId,
  flightPath,
  takeoffPoint,
  landingPoint,
  dockLocation,
  waypoints,
  currentPosition,
  currentFlightMode,
  isLoading,
  error,
  onRetry,
  onPathClick,
  timelinePosition,
  systemEvents = [],
  warningEvents = []
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const droneMarker = useRef<mapboxgl.Marker | null>(null);
  const pathLines = useRef<{ [key: string]: mapboxgl.GeoJSONSource }>({}); // Changed from LineSource to GeoJSONSource
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Get flight mode color for path lines
  const getFlightModeColor = (mode: string) => {
    switch (mode) {
      case 'mission':
        return '#496DC8'; // Blue
      case 'gtl':
        return '#8B5CF6'; // Purple
      case 'manual':
        return '#F97316'; // Orange
      case 'rtds':
        return '#DC2626'; // Red
      default:
        return '#496DC8'; // Default blue
    }
  };
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || isLoading || error || mapInitialized) return;
    
    // Set Mapbox access token
    mapboxgl.accessToken = (window as any).MAPBOX_TOKEN || 'pk.eyJ1IjoiZmx5dGJhc2UiLCJhIjoiY2tlZ2QwbmUzMDR0cjJ6cGRtY3RpbGpraiJ9.I0gYgVZQc2pVv9XXGnVu5w';
    
    console.log('Initializing map...');
    
    // Create the map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [dockLocation.lng, dockLocation.lat],
      zoom: 15,
      pitch: 45,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showCompass: true
      }),
      'top-right'
    );
    
    // Wait for map to load before adding elements
    map.current.on('load', () => {
      console.log('Map loaded');
      
      if (!map.current) return;
      
      // Add sources and layers for flight paths, markers, etc.
      addFlightPathToMap();
      addMarkersToMap();
      
      setMapInitialized(true);
    });
    
    // Clean up on unmount
    return () => {
      map.current?.remove();
      map.current = null;
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [isLoading, error, mapInitialized]);
  
  // Update drone position when currentPosition changes
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    
    // Update drone marker position
    updateDroneMarker();
    
    // Center map on drone if following is enabled
    // (This could be toggled by a button in the UI)
    // map.current.easeTo({
    //   center: [currentPosition.lng, currentPosition.lat],
    //   duration: 1000
    // });
    
  }, [currentPosition, mapInitialized]);
  
  // Add flight path to map
  const addFlightPathToMap = () => {
    if (!map.current) return;
    
    // Group path points by flight mode to create separate line segments
    const pathSegments: { [key: string]: typeof flightPath } = {};
    let currentMode = flightPath[0]?.flightMode || 'mission';
    let currentSegment: typeof flightPath = [];
    
    flightPath.forEach((point, index) => {
      if (point.flightMode !== currentMode || index === flightPath.length - 1) {
        // Save the current segment
        if (!pathSegments[currentMode]) {
          pathSegments[currentMode] = [];
        }
        
        // Add the current point to complete the segment if it's the last point
        if (index === flightPath.length - 1) {
          currentSegment.push(point);
        }
        
        pathSegments[currentMode] = [...pathSegments[currentMode], ...currentSegment];
        
        // Start a new segment
        currentMode = point.flightMode;
        currentSegment = [point];
      } else {
        currentSegment.push(point);
      }
    });
    
    // Add each path segment as a separate line with its own color
    Object.keys(pathSegments).forEach(mode => {
      const points = pathSegments[mode];
      if (points.length === 0) return;
      
      const coordinates = points.map(point => [point.lng, point.lat]);
      const sourceId = `path-${mode}`;
      const layerId = `path-layer-${mode}`;
      
      // Add source for this path segment
      map.current?.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        }
      });
      
      // Add line layer for this path segment
      map.current?.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': getFlightModeColor(mode),
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
      
      // Store reference to update later if needed
      pathLines.current[mode] = map.current?.getSource(sourceId) as mapboxgl.GeoJSONSource; // Changed from LineSource to GeoJSONSource
    });
  };
  
  // Add markers to map (takeoff, landing, dock, waypoints)
  const addMarkersToMap = () => {
    if (!map.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add takeoff marker (green)
    const takeoffMarkerEl = document.createElement('div');
    takeoffMarkerEl.className = 'w-4 h-4 rounded-full bg-emerald-500 border-2 border-white';
    
    const takeoffMarker = new mapboxgl.Marker(takeoffMarkerEl)
      .setLngLat([takeoffPoint.lng, takeoffPoint.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Takeoff Location'))
      .addTo(map.current);
    
    markersRef.current.push(takeoffMarker);
    
    // Add landing marker (red)
    const landingMarkerEl = document.createElement('div');
    landingMarkerEl.className = 'w-4 h-4 rounded-full bg-red-500 border-2 border-white';
    
    const landingMarker = new mapboxgl.Marker(landingMarkerEl)
      .setLngLat([landingPoint.lng, landingPoint.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Landing Location'))
      .addTo(map.current);
    
    markersRef.current.push(landingMarker);
    
    // Add dock marker (blue)
    const dockMarkerEl = document.createElement('div');
    dockMarkerEl.className = 'w-5 h-5 rounded-full bg-sky-500 border-2 border-white';
    
    const dockMarker = new mapboxgl.Marker(dockMarkerEl)
      .setLngLat([dockLocation.lng, dockLocation.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Dock Location'))
      .addTo(map.current);
    
    markersRef.current.push(dockMarker);
    
    // Add waypoint markers (white circles with numbers)
    waypoints.forEach(waypoint => {
      const waypointMarkerEl = document.createElement('div');
      waypointMarkerEl.className = 'w-4 h-4 rounded-full bg-white border-2 border-gray-900 flex items-center justify-center text-xs font-bold';
      waypointMarkerEl.textContent = waypoint.index.toString();
      
      const waypointMarker = new mapboxgl.Marker(waypointMarkerEl)
        .setLngLat([waypoint.lng, waypoint.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Waypoint ${waypoint.index}`))
        .addTo(map.current);
      
      markersRef.current.push(waypointMarker);
    });
    
    // Add drone marker (with rotation based on heading)
    updateDroneMarker();
  };
  
  // Update drone marker position and rotation
  const updateDroneMarker = () => {
    if (!map.current) return;
    
    if (!droneMarker.current) {
      // Create drone marker if it doesn't exist
      const droneEl = document.createElement('div');
      droneEl.className = 'w-6 h-6 rounded-full flex items-center justify-center bg-primary/80 border-2 border-white';
      
      // Create inner drone icon (could be replaced with an SVG)
      const droneIcon = document.createElement('div');
      droneIcon.className = 'w-4 h-4 bg-primary-foreground';
      droneIcon.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
      droneEl.appendChild(droneIcon);
      
      droneMarker.current = new mapboxgl.Marker({
        element: droneEl,
        rotationAlignment: 'map'
      })
        .setLngLat([currentPosition.lng, currentPosition.lat])
        .addTo(map.current);
    } else {
      // Update position and rotation
      droneMarker.current
        .setLngLat([currentPosition.lng, currentPosition.lat])
        .setRotation(currentPosition.heading);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-background-level-3 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="text-text-icon-02 text-sm">Loading map data...</span>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-background-level-3 rounded-lg">
        <div className="flex flex-col items-center gap-4 p-6 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-destructive-500" />
          <h3 className="text-lg font-medium text-text-icon-01">Map Error</h3>
          <p className="text-text-icon-02 text-sm mb-2">{error}</p>
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <div ref={mapContainer} className="absolute top-0 left-0 right-0 bottom-0" />
      
      {/* Map overlay with flight info */}
      <div className="absolute top-2 left-2 bg-background-level-2/80 backdrop-blur-sm p-2 rounded text-xs text-text-icon-01 border border-white/10">
        <div className="flex flex-col gap-1">
          <div>Flight ID: <span className="font-medium">{flightId}</span></div>
          <div>Flight Mode: <span className="font-medium">{currentFlightMode}</span></div>
          <div>Altitude: <span className="font-medium">{currentPosition.altitude}m</span></div>
        </div>
      </div>
      
      {/* Map Legend */}
      <MapLegend />
    </div>
  );
};

// Add the default export
export default FlightMap;
