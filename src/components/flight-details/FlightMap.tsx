
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Loader2, Plus, Minus, Target, SquareStack, SquareStack as SquareStackIcon } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { MapLegend } from './MapLegend';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import {
  WarningEvent,
  SystemEvent,
  TimelinePosition
} from './timeline/timelineTypes';
import { timeToSeconds } from './timeline/timelineUtils';
import 'mapbox-gl/dist/mapbox-gl.css';

// For TypeScript to recognize Mapbox
declare global {
  interface Window {
    MAPBOX_TOKEN: string;
  }
}

// Interface for coordinates
interface Coordinate {
  lat: number;
  lng: number;
}

// Interface for waypoints
interface Waypoint {
  lat: number;
  lng: number;
  index: number;
}

// Interface for flight path points
interface FlightPathPoint {
  lat: number;
  lng: number;
  altitude: number;
  timestamp: string;
  flightMode: 'mission' | 'gtl' | 'manual' | 'rtds';
}

// Interface for current position
interface CurrentPosition {
  lat: number;
  lng: number;
  altitude: number;
  heading: number;
}

// Props interface
interface FlightMapProps {
  flightId: string;
  flightPath: FlightPathPoint[];
  takeoffPoint: Coordinate;
  landingPoint: Coordinate;
  dockLocation: Coordinate;
  waypoints: Waypoint[];
  currentPosition: CurrentPosition;
  currentFlightMode: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onPathClick?: (timestamp: string) => void;
  timelinePosition?: TimelinePosition;
  systemEvents?: SystemEvent[];
  warningEvents?: WarningEvent[];
}

// Flight mode color mapping
const flightModeColors: Record<string, string> = {
  mission: '#3B82F6', // Blue
  manual: '#F97316', // Orange
  gtl: '#14B8A6',    // Teal
  rtds: '#F6603B'    // Red-orange
};

export const FlightMap: React.FC<FlightMapProps> = ({
  flightId,
  flightPath,
  takeoffPoint,
  landingPoint,
  dockLocation,
  waypoints,
  currentPosition,
  currentFlightMode,
  isLoading = false,
  error = null,
  onRetry,
  onPathClick,
  timelinePosition,
  systemEvents = [],
  warningEvents = []
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const eventsLayer = useRef<{ [key: string]: mapboxgl.Marker }>({}); // Ref to store event markers

  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(15);
  
  // Convert flightPath to GeoJSON for mapping
  const flightPathToGeoJSON = () => {
    const coordinates = flightPath.map(point => [point.lng, point.lat]);
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates
      }
    };
  };
  
  // Segment flight path by mode
  const getFlightPathSegments = () => {
    let currentMode = flightPath[0]?.flightMode || 'mission';
    let currentSegment: number[][] = [];
    const segments: { mode: string; coordinates: number[][] }[] = [];
    
    flightPath.forEach(point => {
      if (point.flightMode !== currentMode) {
        if (currentSegment.length > 0) {
          segments.push({
            mode: currentMode,
            coordinates: [...currentSegment]
          });
          currentSegment = [[point.lng, point.lat]];
          currentMode = point.flightMode;
        }
      } else {
        currentSegment.push([point.lng, point.lat]);
      }
    });
    
    // Add the last segment
    if (currentSegment.length > 0) {
      segments.push({
        mode: currentMode,
        coordinates: [...currentSegment]
      });
    }
    
    return segments;
  };

  // Add flight path segments to the map
  const addFlightPathSegments = () => {
    if (!map.current || !isMapReady) return;
    
    // Clear existing path layers
    if (map.current.getLayer('flight-path-mission')) map.current.removeLayer('flight-path-mission');
    if (map.current.getLayer('flight-path-manual')) map.current.removeLayer('flight-path-manual');
    if (map.current.getLayer('flight-path-gtl')) map.current.removeLayer('flight-path-gtl');
    if (map.current.getLayer('flight-path-rtds')) map.current.removeLayer('flight-path-rtds');
    
    if (map.current.getSource('flight-path-mission')) map.current.removeSource('flight-path-mission');
    if (map.current.getSource('flight-path-manual')) map.current.removeSource('flight-path-manual');
    if (map.current.getSource('flight-path-gtl')) map.current.removeSource('flight-path-gtl');
    if (map.current.getSource('flight-path-rtds')) map.current.removeSource('flight-path-rtds');
    
    // Group coordinates by mode
    const segments = getFlightPathSegments();
    
    // Add each segment as a separate layer
    segments.forEach((segment, index) => {
      const segmentId = `flight-path-${segment.mode}`;
      
      if (!map.current) return;
      
      // Add source
      map.current.addSource(segmentId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: segment.coordinates
          }
        }
      });
      
      // Add layer with mode-specific styling
      map.current.addLayer({
        id: segmentId,
        type: 'line',
        source: segmentId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: 'visible'
        },
        paint: {
          'line-color': flightModeColors[segment.mode] || '#888888',
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [1, 0]  // Fix: Use correct property name 'line-dasharray'
        }
      });
      
      // Make the line clickable
      map.current.on('click', segmentId, (e) => {
        if (e.features && e.features[0] && onPathClick) {
          // Find nearest point to clicked location
          const clickedPoint = e.lngLat;
          let minDistance = Infinity;
          let nearestPointIndex = 0;
          
          flightPath.forEach((point, idx) => {
            const distance = Math.sqrt(
              Math.pow(point.lng - clickedPoint.lng, 2) + 
              Math.pow(point.lat - clickedPoint.lat, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestPointIndex = idx;
            }
          });
          
          // Call the click handler with the timestamp of the nearest point
          onPathClick(flightPath[nearestPointIndex].timestamp);
        }
      });
      
      // Change cursor on hover
      map.current.on('mouseenter', segmentId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', segmentId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });
  };
  
  // Add completed and upcoming path segments based on timeline position
  const updatePathSegments = () => {
    if (!map.current || !isMapReady || !timelinePosition) return;
    
    // Determine which part of the path has been "completed" based on current timeline position
    const currentTimeSeconds = timeToSeconds(timelinePosition.timestamp);
    
    // Find all points before the current time (completed) and after (upcoming)
    const completedPoints: FlightPathPoint[] = [];
    const upcomingPoints: FlightPathPoint[] = [];
    
    flightPath.forEach(point => {
      const pointTimeSeconds = timeToSeconds(point.timestamp);
      if (pointTimeSeconds <= currentTimeSeconds) {
        completedPoints.push(point);
      } else {
        upcomingPoints.push(point);
      }
    });
    
    // If there's a completed point, add the next point to ensure a smooth transition
    if (completedPoints.length > 0 && upcomingPoints.length > 0) {
      completedPoints.push(upcomingPoints[0]);
    }
    
    // Convert to GeoJSON segments by mode
    const getSegmentsByMode = (points: FlightPathPoint[]) => {
      if (points.length === 0) return [];
      
      let currentMode = points[0].flightMode;
      let currentSegment: number[][] = [];
      const segments: { mode: string; coordinates: number[][] }[] = [];
      
      points.forEach(point => {
        if (point.flightMode !== currentMode) {
          if (currentSegment.length > 0) {
            segments.push({
              mode: currentMode,
              coordinates: [...currentSegment]
            });
            currentSegment = [[point.lng, point.lat]];
            currentMode = point.flightMode;
          }
        } else {
          currentSegment.push([point.lng, point.lat]);
        }
      });
      
      // Add the last segment
      if (currentSegment.length > 0) {
        segments.push({
          mode: currentMode,
          coordinates: [...currentSegment]
        });
      }
      
      return segments;
    };
    
    // Add completed path segments
    const completedSegments = getSegmentsByMode(completedPoints);
    completedSegments.forEach((segment, index) => {
      const segmentId = `completed-path-${segment.mode}`;
      
      // Remove existing layer and source if they exist
      if (map.current?.getLayer(segmentId)) map.current.removeLayer(segmentId);
      if (map.current?.getSource(segmentId)) map.current.removeSource(segmentId);
      
      if (!map.current) return;
      
      // Add source
      map.current.addSource(segmentId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: segment.coordinates
          }
        }
      });
      
      // Add layer with mode-specific styling
      map.current.addLayer({
        id: segmentId,
        type: 'line',
        source: segmentId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: 'visible'
        },
        paint: {
          'line-color': flightModeColors[segment.mode] || '#888888',
          'line-width': 4,
          'line-opacity': 0.9,
          'line-dasharray': [1, 0]  // Fix: Solid line for completed path
        }
      });
    });
    
    // Add upcoming path segments with dotted style
    const upcomingSegments = getSegmentsByMode(upcomingPoints);
    upcomingSegments.forEach((segment, index) => {
      const segmentId = `upcoming-path-${segment.mode}`;
      
      // Remove existing layer and source if they exist
      if (map.current?.getLayer(segmentId)) map.current.removeLayer(segmentId);
      if (map.current?.getSource(segmentId)) map.current.removeSource(segmentId);
      
      if (!map.current || segment.coordinates.length < 2) return;
      
      // Add source
      map.current.addSource(segmentId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: segment.coordinates
          }
        }
      });
      
      // Add layer with dotted line for upcoming path
      map.current.addLayer({
        id: segmentId,
        type: 'line',
        source: segmentId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: 'visible'
        },
        paint: {
          'line-color': flightModeColors[segment.mode] || '#888888',
          'line-width': 3,
          'line-opacity': 0.6,
          'line-dasharray': [2, 2]  // Fix: Dotted line for upcoming path
        }
      });
    });
  };

  // Add event markers to the map
  const addEventMarkers = () => {
    if (!map.current || !isMapReady) return;
    
    // Clear existing event markers
    Object.values(eventsLayer.current).forEach(marker => marker.remove());
    eventsLayer.current = {};
    
    // Add system event markers
    systemEvents.forEach(event => {
      // Find a point in the flight path that corresponds to this event's timestamp
      const eventTimeSeconds = timeToSeconds(event.timestamp);
      let closestPoint = flightPath[0];
      let smallestDiff = Infinity;
      
      flightPath.forEach(point => {
        const pointTimeSeconds = timeToSeconds(point.timestamp);
        const diff = Math.abs(pointTimeSeconds - eventTimeSeconds);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestPoint = point;
        }
      });
      
      if (!map.current) return;
      
      // Create a marker element
      const el = document.createElement('div');
      el.className = 'system-event-marker';
      el.innerHTML = `
        <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
      `;
      
      // Add marker to map
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([closestPoint.lng, closestPoint.lat])
        .addTo(map.current);
      
      // Add click handler to jump to this event
      el.addEventListener('click', () => {
        if (onPathClick) {
          onPathClick(event.timestamp);
        }
      });
      
      // Add popup with event details
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
        className: 'event-popup'
      }).setHTML(`
        <div class="p-2 bg-gray-800 text-white rounded shadow-lg">
          <p class="font-medium">${event.type}</p>
          <p class="text-xs">${event.details}</p>
          <p class="text-xs text-blue-300">${event.timestamp}</p>
        </div>
      `);
      
      el.addEventListener('mouseenter', () => {
        marker.setPopup(popup);
        popup.addTo(map.current!);
      });
      
      el.addEventListener('mouseleave', () => {
        popup.remove();
      });
      
      // Store marker for later cleanup
      eventsLayer.current[`system-${event.timestamp}`] = marker;
    });
    
    // Add warning event markers
    warningEvents.forEach(event => {
      // Find a point in the flight path that corresponds to this event's timestamp
      const eventTimeSeconds = timeToSeconds(event.timestamp);
      let closestPoint = flightPath[0];
      let smallestDiff = Infinity;
      
      flightPath.forEach(point => {
        const pointTimeSeconds = timeToSeconds(point.timestamp);
        const diff = Math.abs(pointTimeSeconds - eventTimeSeconds);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestPoint = point;
        }
      });
      
      if (!map.current) return;
      
      // Create a marker element
      const el = document.createElement('div');
      el.className = 'warning-event-marker';
      
      const isWarning = event.type === 'warning';
      const color = isWarning ? 'bg-yellow-500' : 'bg-red-500';
      
      el.innerHTML = `
        <div class="w-5 h-5 ${color} flex items-center justify-center text-white text-xs font-bold border-2 border-white transform rotate-0 ${isWarning ? 'triangle' : 'rounded'}">
          ${isWarning ? '!' : 'X'}
        </div>
      `;
      
      // Add marker to map
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([closestPoint.lng, closestPoint.lat])
        .addTo(map.current);
      
      // Add click handler to jump to this event
      el.addEventListener('click', () => {
        if (onPathClick) {
          onPathClick(event.timestamp);
        }
      });
      
      // Add popup with event details
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
        className: 'event-popup'
      }).setHTML(`
        <div class="p-2 bg-gray-800 text-white rounded shadow-lg">
          <div class="flex items-center gap-2 mb-1">
            <span class="px-1.5 py-0.5 ${isWarning ? 'bg-yellow-600' : 'bg-red-600'} text-white text-xs rounded uppercase">
              ${event.severity} ${event.type}
            </span>
          </div>
          <p class="text-xs">${event.details || ''}</p>
          <p class="text-xs text-blue-300">${event.timestamp}</p>
        </div>
      `);
      
      el.addEventListener('mouseenter', () => {
        marker.setPopup(popup);
        popup.addTo(map.current!);
      });
      
      el.addEventListener('mouseleave', () => {
        popup.remove();
      });
      
      // Store marker for later cleanup
      eventsLayer.current[`warning-${event.timestamp}`] = marker;
    });
  };

  // Initialize map
  useEffect(() => {
    if (isLoading || error || !mapContainer.current || map.current) return;
    
    try {
      // Initialize Mapbox map
      mapboxgl.accessToken = window.MAPBOX_TOKEN || 'pk.eyJ1IjoiZmx5dGJhc2UiLCJhIjoiY2tlZ2QwbmUzMDR0cjJ6cGRtY3RpbGpraiJ9.I0gYgVZQc2pVv9XXGnVu5w';
      
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [dockLocation.lng, dockLocation.lat],
        zoom: currentZoom,
        attributionControl: false
      });
      
      // Add navigation controls
      mapInstance.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: false,
          visualizePitch: true
        }),
        'top-right'
      );
      
      mapInstance.on('load', () => {
        setIsMapReady(true);
        
        // Add the drone marker
        const droneEl = document.createElement('div');
        droneEl.className = 'drone-marker';
        droneEl.innerHTML = `<div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"></div>`;
        
        const newMarker = new mapboxgl.Marker({
          element: droneEl,
          anchor: 'center',
          rotation: currentPosition.heading
        })
          .setLngLat([currentPosition.lng, currentPosition.lat])
          .addTo(mapInstance);
        
        marker.current = newMarker;
        
        // Add takeoff marker
        const takeoffEl = document.createElement('div');
        takeoffEl.className = 'takeoff-marker';
        takeoffEl.innerHTML = `
          <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
            T
          </div>
        `;
        
        new mapboxgl.Marker({
          element: takeoffEl,
          anchor: 'center'
        })
          .setLngLat([takeoffPoint.lng, takeoffPoint.lat])
          .addTo(mapInstance);
        
        // Add landing marker
        const landingEl = document.createElement('div');
        landingEl.className = 'landing-marker';
        landingEl.innerHTML = `
          <div class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
            L
          </div>
        `;
        
        new mapboxgl.Marker({
          element: landingEl,
          anchor: 'center'
        })
          .setLngLat([landingPoint.lng, landingPoint.lat])
          .addTo(mapInstance);
        
        // Add dock location marker
        const dockEl = document.createElement('div');
        dockEl.className = 'dock-marker';
        dockEl.innerHTML = `
          <div class="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
            D
          </div>
        `;
        
        new mapboxgl.Marker({
          element: dockEl,
          anchor: 'center'
        })
          .setLngLat([dockLocation.lng, dockLocation.lat])
          .addTo(mapInstance);
        
        // Add waypoint markers
        waypoints.forEach(waypoint => {
          const waypointEl = document.createElement('div');
          waypointEl.className = 'waypoint-marker';
          waypointEl.innerHTML = `
            <div class="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
              ${waypoint.index}
            </div>
          `;
          
          new mapboxgl.Marker({
            element: waypointEl,
            anchor: 'center'
          })
            .setLngLat([waypoint.lng, waypoint.lat])
            .addTo(mapInstance);
        });
        
        map.current = mapInstance;
        
        // Add flight path segments
        addFlightPathSegments();
        
        // Add event markers
        addEventMarkers();
        
        // Update path segments based on timeline position
        updatePathSegments();
      });
      
      // Update zoom state when user zooms
      mapInstance.on('zoom', () => {
        setCurrentZoom(mapInstance.getZoom());
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      toast({
        title: 'Map Error',
        description: 'Failed to initialize the map. Please try again.',
        variant: 'destructive'
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isLoading, error, mapStyle]);
  
  // Update marker position when currentPosition changes
  useEffect(() => {
    if (!map.current || !marker.current || !isMapReady) return;
    
    // Update drone marker position and rotation
    marker.current
      .setLngLat([currentPosition.lng, currentPosition.lat])
      .setRotation(currentPosition.heading);
    
  }, [currentPosition, isMapReady]);
  
  // Handle timeline position changes
  useEffect(() => {
    if (!map.current || !isMapReady || !timelinePosition) return;
    
    // Update path segments based on timeline position
    updatePathSegments();
    
  }, [timelinePosition, isMapReady]);
  
  // Handle map style toggle
  const toggleMapStyle = () => {
    const newStyle = mapStyle === 'dark' ? 'satellite' : 'dark';
    setMapStyle(newStyle);
    
    if (map.current) {
      map.current.setStyle(
        newStyle === 'dark' 
          ? 'mapbox://styles/mapbox/dark-v11' 
          : 'mapbox://styles/mapbox/satellite-streets-v12'
      );
    }
  };
  
  // Zoom controls
  const zoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };
  
  const zoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };
  
  // Focus on drone position
  const focusOnDrone = () => {
    if (map.current && marker.current) {
      map.current.flyTo({
        center: [currentPosition.lng, currentPosition.lat],
        zoom: 15,
        speed: 1.2,
        curve: 1
      });
    }
  };
  
  // If loading, show loading spinner
  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary-200" />
          <p className="text-text-icon-01 text-lg font-medium">Loading Map</p>
          <p className="text-text-icon-02 text-sm">Please wait while we prepare the flight path</p>
        </div>
      </Card>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
          <p className="text-text-icon-01 text-lg font-medium mb-2">Map Error</p>
          <p className="text-text-icon-02 text-sm mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} className="mx-auto">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </Card>
    );
  }
  
  return (
    <div className="h-full w-full relative">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0 rounded-md overflow-hidden" />
      
      {/* Controls overlay */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        <Button variant="outline" size="icon" onClick={zoomIn} className="bg-background-level-3/80 backdrop-blur-sm border-outline-primary">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={zoomOut} className="bg-background-level-3/80 backdrop-blur-sm border-outline-primary">
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={focusOnDrone} className="bg-background-level-3/80 backdrop-blur-sm border-outline-primary">
          <Target className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={toggleMapStyle} className="bg-background-level-3/80 backdrop-blur-sm border-outline-primary">
          <SquareStackIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Map legend */}
      <div className="absolute bottom-2 left-2 z-10">
        <MapLegend currentMode={currentFlightMode} />
      </div>
    </div>
  );
};

export default FlightMap;
