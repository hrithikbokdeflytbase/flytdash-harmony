
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2, Plus, Minus, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import MapLegend from './MapLegend';
import { cn } from '@/lib/utils';
import { SystemEvent, WarningEvent, TimelinePosition } from './timeline/timelineTypes';
import { timeToSeconds } from './timeline/timelineUtils';

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
  currentFlightMode?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onPathClick?: (timestamp: string) => void;
  timelinePosition?: TimelinePosition;
  systemEvents?: SystemEvent[];
  warningEvents?: WarningEvent[];
}

const FlightMap: React.FC<FlightMapProps> = ({
  flightId,
  flightPath = [],
  takeoffPoint,
  landingPoint,
  dockLocation,
  waypoints = [],
  currentPosition,
  currentFlightMode = 'mission',
  isLoading = true,
  error = null,
  onRetry,
  onPathClick,
  timelinePosition,
  systemEvents = [],
  warningEvents = []
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
  const markerRefs = useRef<{[key: string]: mapboxgl.Marker}>({});
  const popupRefs = useRef<{[key: string]: mapboxgl.Popup}>({});
  const pathLayersAdded = useRef<boolean>(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || error) return;
    
    console.log("Initializing map...");

    // Get token from window object or use fallback
    const token = (window as any).MAPBOX_TOKEN || 'pk.eyJ1IjoiZmx5dGJhc2UiLCJhIjoiY2tlZ2QwbmUzMGR0cjJ6cGRtY3RpbGpraiJ9.I0gYgVZQc2pVv9XXGnVu5w';
    
    // Set Mapbox token
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = token;
    }

    try {
      // Create the map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: takeoffPoint ? [takeoffPoint.lng, takeoffPoint.lat] : [-74.5, 40], // Default to a location if takeoff point not provided
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
      if (pathLayersAdded.current) {
        // Remove all existing layers before re-adding
        map.current.removeLayer('flight-path-past-mission');
        map.current.removeLayer('flight-path-future-mission');
        map.current.removeLayer('flight-path-past-gtl');
        map.current.removeLayer('flight-path-future-gtl');
        map.current.removeLayer('flight-path-past-manual');
        map.current.removeLayer('flight-path-future-manual');
        map.current.removeLayer('flight-path-past-rtds');
        map.current.removeLayer('flight-path-future-rtds');
      }
      map.current.removeSource('flight-path');
      pathLayersAdded.current = false;
    }

    // Split flight path into past and future based on current timestamp
    const currentTime = timelinePosition?.timestamp || "00:00:00";
    const currentTimeSeconds = timeToSeconds(currentTime);
    
    // Prepare coordinates arrays for each mode and past/future
    const pastMissionCoords: Array<[number, number]> = [];
    const futureMissionCoords: Array<[number, number]> = [];
    const pastGtlCoords: Array<[number, number]> = [];
    const futureGtlCoords: Array<[number, number]> = [];
    const pastManualCoords: Array<[number, number]> = [];
    const futureManualCoords: Array<[number, number]> = [];
    const pastRtdsCoords: Array<[number, number]> = [];
    const futureRtdsCoords: Array<[number, number]> = [];
    
    // Sort flight path by timestamp before processing
    const sortedPath = [...flightPath].sort((a, b) => 
      timeToSeconds(a.timestamp) - timeToSeconds(b.timestamp)
    );
    
    // Process flight path points
    sortedPath.forEach(point => {
      const pointTime = timeToSeconds(point.timestamp);
      const isPast = pointTime <= currentTimeSeconds;
      const coord: [number, number] = [point.lng, point.lat];
      
      // Add to appropriate array based on mode and time
      if (point.flightMode === 'mission') {
        isPast ? pastMissionCoords.push(coord) : futureMissionCoords.push(coord);
      } else if (point.flightMode === 'gtl') {
        isPast ? pastGtlCoords.push(coord) : futureGtlCoords.push(coord);
      } else if (point.flightMode === 'manual') {
        isPast ? pastManualCoords.push(coord) : futureManualCoords.push(coord);
      } else if (point.flightMode === 'rtds') {
        isPast ? pastRtdsCoords.push(coord) : futureRtdsCoords.push(coord);
      }
    });

    // Add the flight path source
    map.current.addSource('flight-path', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          // Past paths
          {
            type: 'Feature',
            properties: { mode: 'mission', timing: 'past' },
            geometry: {
              type: 'LineString',
              coordinates: pastMissionCoords
            }
          },
          {
            type: 'Feature',
            properties: { mode: 'gtl', timing: 'past' },
            geometry: {
              type: 'LineString',
              coordinates: pastGtlCoords
            }
          },
          {
            type: 'Feature',
            properties: { mode: 'manual', timing: 'past' },
            geometry: {
              type: 'LineString',
              coordinates: pastManualCoords
            }
          },
          {
            type: 'Feature',
            properties: { mode: 'rtds', timing: 'past' },
            geometry: {
              type: 'LineString',
              coordinates: pastRtdsCoords
            }
          },
          // Future paths
          {
            type: 'Feature',
            properties: { mode: 'mission', timing: 'future' },
            geometry: {
              type: 'LineString',
              coordinates: futureMissionCoords
            }
          },
          {
            type: 'Feature',
            properties: { mode: 'gtl', timing: 'future' },
            geometry: {
              type: 'LineString',
              coordinates: futureGtlCoords
            }
          },
          {
            type: 'Feature',
            properties: { mode: 'manual', timing: 'future' },
            geometry: {
              type: 'LineString',
              coordinates: futureManualCoords
            }
          },
          {
            type: 'Feature',
            properties: { mode: 'rtds', timing: 'future' },
            geometry: {
              type: 'LineString',
              coordinates: futureRtdsCoords
            }
          }
        ]
      }
    });

    // Add path layers with click handlers for timeline sync
    // Past mission path
    map.current.addLayer({
      id: 'flight-path-past-mission',
      type: 'line',
      source: 'flight-path',
      filter: ['all', ['==', ['get', 'mode'], 'mission'], ['==', ['get', 'timing'], 'past']],
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#496DC8', // Mission: Blue 
        'line-width': 5,
        'line-opacity': 0.9
      }
    });

    // Future mission path
    map.current.addLayer({
      id: 'flight-path-future-mission',
      type: 'line',
      source: 'flight-path',
      filter: ['all', ['==', ['get', 'mode'], 'mission'], ['==', ['get', 'timing'], 'future']],
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
        'line-dasharray': [2, 2]
      },
      paint: {
        'line-color': '#496DC8', // Mission: Blue
        'line-width': 3,
        'line-opacity': 0.5
      }
    });

    // Past GTL path
    map.current.addLayer({
      id: 'flight-path-past-gtl',
      type: 'line',
      source: 'flight-path',
      filter: ['all', ['==', ['get', 'mode'], 'gtl'], ['==', ['get', 'timing'], 'past']],
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#8B5CF6', // GTL: Purple
        'line-width': 5,
        'line-opacity': 0.9
      }
    });

    // Future GTL path
    map.current.addLayer({
      id: 'flight-path-future-gtl',
      type: 'line',
      source: 'flight-path',
      filter: ['all', ['==', ['get', 'mode'], 'gtl'], ['==', ['get', 'timing'], 'future']],
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
        'line-dasharray': [2, 2]
      },
      paint: {
        'line-color': '#8B5CF6', // GTL: Purple
        'line-width': 3,
        'line-opacity': 0.5
      }
    });

    // Past manual path
    map.current.addLayer({
      id: 'flight-path-past-manual',
      type: 'line',
      source: 'flight-path',
      filter: ['all', ['==', ['get', 'mode'], 'manual'], ['==', ['get', 'timing'], 'past']],
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#F97316', // Manual: Orange
        'line-width': 5,
        'line-opacity': 0.9
      }
    });

    // Future manual path
    map.current.addLayer({
      id: 'flight-path-future-manual',
      type: 'line',
      source: 'flight-path',
      filter: ['all', ['==', ['get', 'mode'], 'manual'], ['==', ['get', 'timing'], 'future']],
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
        'line-dasharray': [2, 2]
      },
      paint: {
        'line-color': '#F97316', // Manual: Orange
        'line-width': 3,
        'line-opacity': 0.5
      }
    });

    // Past RTDS path
    map.current.addLayer({
      id: 'flight-path-past-rtds',
      type: 'line',
      source: 'flight-path',
      filter: ['all', ['==', ['get', 'mode'], 'rtds'], ['==', ['get', 'timing'], 'past']],
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#14B8A6', // RTDS: Teal
        'line-width': 5,
        'line-opacity': 0.9
      }
    });

    // Future RTDS path
    map.current.addLayer({
      id: 'flight-path-future-rtds',
      type: 'line',
      source: 'flight-path',
      filter: ['all', ['==', ['get', 'mode'], 'rtds'], ['==', ['get', 'timing'], 'future']],
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
        'line-dasharray': [2, 2]
      },
      paint: {
        'line-color': '#14B8A6', // RTDS: Teal
        'line-width': 3,
        'line-opacity': 0.5
      }
    });

    pathLayersAdded.current = true;

    // Add click handlers for timeline sync
    const handlePathClick = (e: mapboxgl.MapMouseEvent) => {
      if (!onPathClick || !map.current) return;
      
      // Find nearest flight path point
      const clickedLngLat = e.lngLat;
      let nearestPoint = null;
      let minDistance = Infinity;
      
      for (const point of flightPath) {
        const pointLngLat = new mapboxgl.LngLat(point.lng, point.lat);
        const distance = clickedLngLat.distanceTo(pointLngLat);
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = point;
        }
      }
      
      if (nearestPoint && minDistance < 500) { // 500m threshold
        onPathClick(nearestPoint.timestamp);
      }
    };
    
    // Add click handlers to all path layers
    ['flight-path-past-mission', 'flight-path-future-mission', 
     'flight-path-past-gtl', 'flight-path-future-gtl',
     'flight-path-past-manual', 'flight-path-future-manual',
     'flight-path-past-rtds', 'flight-path-future-rtds'].forEach(layerId => {
      map.current?.on('click', layerId, handlePathClick);
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
  }, [mapLoaded, flightPath, timelinePosition, onPathClick]);

  // Add event markers (warnings and system events)
  useEffect(() => {
    if (!mapLoaded || !map.current || !showAllMarkers || flightPath.length === 0) return;
    
    // Clear existing event markers
    Object.values(markerRefs.current).forEach(marker => marker.remove());
    markerRefs.current = {};
    
    // Create a mapping of timestamps to positions for placing event markers
    const timestampToPosition: {[key: string]: {lat: number, lng: number}} = {};
    flightPath.forEach(point => {
      timestampToPosition[point.timestamp] = { lat: point.lat, lng: point.lng };
    });
    
    // Add warning event markers
    warningEvents.forEach(event => {
      // Find position for this event (nearest flight path point)
      const nearestPoint = findNearestFlightPathPoint(event.timestamp, flightPath);
      if (!nearestPoint) return;
      
      // Create marker element based on warning severity and type
      const markerEl = document.createElement('div');
      markerEl.className = 'flex items-center justify-center w-8 h-8';
      
      if (event.type === 'error') {
        // Error marker (red octagon)
        markerEl.innerHTML = `
          <div class="absolute w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
        `;
      } else {
        // Warning marker (yellow triangle)
        markerEl.innerHTML = `
          <div class="absolute w-5 h-5 bg-amber-500/80 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
          </div>
        `;
      }
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <p class="font-semibold text-sm">${event.type === 'error' ? 'Error' : 'Warning'}: ${event.details}</p>
            <p class="text-xs text-gray-500">Time: ${event.timestamp}</p>
            <button 
              class="mt-2 text-xs bg-primary-200 text-white px-2 py-1 rounded hover:bg-primary-300 jump-button"
              data-timestamp="${event.timestamp}"
            >
              Jump to time
            </button>
          </div>
        `);
      
      // Create and add marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([nearestPoint.lng, nearestPoint.lat])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Store marker reference
      markerRefs.current[`event-${event.timestamp}`] = marker;
      popupRefs.current[`event-${event.timestamp}`] = popup;
    });
    
    // Add system event markers
    systemEvents.forEach(event => {
      // Find position for this event
      const nearestPoint = findNearestFlightPathPoint(event.timestamp, flightPath);
      if (!nearestPoint) return;
      
      // Only add markers for significant system events
      if (event.type === 'modeChange' || event.type === 'command') {
        const markerEl = document.createElement('div');
        markerEl.className = 'flex items-center justify-center w-8 h-8';
        
        markerEl.innerHTML = `
          <div class="absolute w-5 h-5 bg-blue-500/80 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          </div>
        `;
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <p class="font-semibold text-sm">System Event: ${event.details}</p>
              <p class="text-xs text-gray-500">Time: ${event.timestamp}</p>
              <button 
                class="mt-2 text-xs bg-primary-200 text-white px-2 py-1 rounded hover:bg-primary-300 jump-button"
                data-timestamp="${event.timestamp}"
              >
                Jump to time
              </button>
            </div>
          `);
        
        // Create and add marker
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([nearestPoint.lng, nearestPoint.lat])
          .setPopup(popup)
          .addTo(map.current!);
        
        // Store marker reference
        markerRefs.current[`system-${event.timestamp}`] = marker;
        popupRefs.current[`system-${event.timestamp}`] = popup;
      }
    });
    
    // Add popup click event listeners
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('jump-button') && onPathClick) {
        const timestamp = target.getAttribute('data-timestamp');
        if (timestamp) {
          onPathClick(timestamp);
        }
      }
    });
    
    return () => {
      // Remove event listeners
      document.removeEventListener('click', () => {});
    };
  }, [mapLoaded, showAllMarkers, flightPath, systemEvents, warningEvents, onPathClick]);

  // Add markers when map is loaded and marker data is available
  useEffect(() => {
    if (!mapLoaded || !map.current || !showAllMarkers) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => {
      // Only remove markers not related to events
      if (!marker.classList.contains('event-marker')) {
        marker.remove();
      }
    });

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
    
    // Adjust color based on current flight mode
    let modeColor = '#496DC8'; // Default blue (mission)
    if (currentFlightMode === 'gtl') modeColor = '#8B5CF6'; // Purple
    if (currentFlightMode === 'manual') modeColor = '#F97316'; // Orange
    if (currentFlightMode === 'rtds') modeColor = '#14B8A6'; // Teal
    
    currentPosMarkerEl.innerHTML = `
      <div class="absolute w-15 h-15 bg-${modeColor}/10 rounded-full animate-ping"></div>
      <div class="absolute w-4 h-4 bg-${modeColor} rounded-full shadow-lg shadow-${modeColor}/50 z-10"></div>
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
  }, [mapLoaded, currentPosition, currentFlightMode]);

  // Focus map on current drone position when timeline changes significantly
  useEffect(() => {
    if (!map.current || !currentPosition || !timelinePosition) return;
    
    // Focus on drone with a smooth transition
    map.current.flyTo({
      center: [currentPosition.lng, currentPosition.lat],
      zoom: 15, 
      duration: 1000,
      essential: true // Ensures animation is smooth
    });
  }, [timelinePosition?.timestamp]);

  // Helper function to find nearest flight path point for an event timestamp
  const findNearestFlightPathPoint = (timestamp: string, path: FlightPathPoint[]): FlightPathPoint | null => {
    if (!path.length) return null;
    
    const targetSeconds = timeToSeconds(timestamp);
    let nearestPoint = path[0];
    let smallestDiff = Infinity;
    
    path.forEach(point => {
      const pointSeconds = timeToSeconds(point.timestamp);
      const diff = Math.abs(pointSeconds - targetSeconds);
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        nearestPoint = point;
      }
    });
    
    return nearestPoint;
  };

  // Focus map on drone
  const focusOnDrone = () => {
    if (!map.current || !currentPosition) return;
    map.current.flyTo({
      center: [currentPosition.lng, currentPosition.lat],
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
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)]">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0 bg-background-level-3"></div>
      
      {/* Map Legend */}
      <MapLegend currentMode={currentFlightMode} />
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-level-3/80 backdrop-blur-sm z-50">
          <Loader2 className="h-12 w-12 text-primary-100 animate-spin mb-4" />
          <p className="text-text-icon-01 font-medium">Loading map data...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-level-3/80 backdrop-blur-sm z-50">
          <AlertCircle className="h-12 w-12 text-error-200 mb-4" />
          <p className="text-text-icon-01 font-medium mb-2">{error}</p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              className="mt-4 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && isFlightPathEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-level-3/80 backdrop-blur-sm z-50">
          <Map className="h-12 w-12 text-text-icon-02 mb-4" />
          <p className="text-text-icon-01 font-medium mb-2">No flight path data available</p>
        </div>
      )}
      
      {/* Map controls */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2 z-10">
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
            <TooltipContent side="right">
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
            <TooltipContent side="right">
              <p>Zoom out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Coordinate display */}
      {showCoordinates && (
        <div className="absolute bottom-4 right-4 bg-background-level-3/70 backdrop-blur-sm text-xs p-2 rounded-md text-text-icon-02 z-10">
          {showCoordinates.lat.toFixed(4)}, {showCoordinates.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default FlightMap;
