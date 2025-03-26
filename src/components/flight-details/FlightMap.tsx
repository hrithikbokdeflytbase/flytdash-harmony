
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';

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
  takeoffPoint?: { lat: number; lng: number };
  landingPoint?: { lat: number; lng: number };
  dockLocation?: { lat: number; lng: number };
  waypoints?: Array<{ lat: number; lng: number; index: number }>;
  currentPosition?: { lat: number; lng: number };
  isLoading?: boolean;
}

// Temporary Mapbox token - in production, this should be managed through environment variables
// This is just for demonstration purposes
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmx5dGJhc2UiLCJhIjoiY2tlZ2QwbmUzMGR0cjJ6cGRtY3RpbGpraiJ9.I0gYgVZQc2pVv9XXGnVu5w';

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Set Mapbox token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
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
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
      }),
      'top-right'
    );
    
    // Handle map load event
    map.current.on('load', () => {
      setMapLoaded(true);
      console.log(`Map for flight ${flightId} loaded successfully`);
    });
    
    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [flightId]);
  
  // Add flight path when map is loaded and path data is available
  useEffect(() => {
    if (!mapLoaded || !map.current || flightPath.length === 0) return;
    
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
    let prevMode: string | null = null;
    let currentArray: Array<[number, number]> = [];
    
    flightPath.forEach((point, index) => {
      const coord: [number, number] = [point.lng, point.lat];
      
      if (prevMode !== point.flightMode) {
        prevMode = point.flightMode;
        currentArray = [];
        
        if (point.flightMode === 'mission') {
          missionCoordinates.push(coord);
          currentArray = missionCoordinates;
        } else if (point.flightMode === 'gtl') {
          gtlCoordinates.push(coord);
          currentArray = gtlCoordinates;
        } else if (point.flightMode === 'manual') {
          manualCoordinates.push(coord);
          currentArray = manualCoordinates;
        }
      } else {
        currentArray.push(coord);
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
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: missionCoordinates
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: gtlCoordinates
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: manualCoordinates
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
      filter: ['==', '$type', 'LineString'],
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
    
    // Add GTL mode layer
    map.current.addLayer({
      id: 'flight-path-gtl',
      type: 'line',
      source: 'flight-path',
      filter: ['==', '$type', 'LineString'],
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
      filter: ['==', '$type', 'LineString'],
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
    
    // Fit the map to the flight path bounds
    if (flightPath.length > 0) {
      // Create a proper LngLatBounds object first
      const bounds = new mapboxgl.LngLatBounds();
      
      // Extend the bounds with each coordinate point
      flightPath.forEach(point => {
        bounds.extend([point.lng, point.lat] as mapboxgl.LngLatLike);
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
    if (!mapLoaded || !map.current) return;
    
    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // Add takeoff marker
    if (takeoffPoint) {
      const takeoffMarkerEl = document.createElement('div');
      takeoffMarkerEl.className = 'flex items-center justify-center w-8 h-8';
      takeoffMarkerEl.innerHTML = `
        <div class="absolute w-4 h-4 bg-success-200 rounded-full shadow-lg shadow-success-200/30 z-10"></div>
        <div class="absolute w-6 h-6 bg-success-200/30 rounded-full animate-ping"></div>
      `;
      
      new mapboxgl.Marker(takeoffMarkerEl)
        .setLngLat([takeoffPoint.lng, takeoffPoint.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Takeoff Location'))
        .addTo(map.current);
    }
    
    // Add landing marker
    if (landingPoint) {
      const landingMarkerEl = document.createElement('div');
      landingMarkerEl.className = 'flex items-center justify-center w-8 h-8';
      landingMarkerEl.innerHTML = `
        <div class="absolute w-4 h-4 bg-error-200 rounded-full shadow-lg shadow-error-200/30 z-10"></div>
        <div class="absolute w-6 h-6 bg-error-200/30 rounded-full"></div>
      `;
      
      new mapboxgl.Marker(landingMarkerEl)
        .setLngLat([landingPoint.lng, landingPoint.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Landing Location'))
        .addTo(map.current);
    }
    
    // Add dock marker
    if (dockLocation) {
      const dockMarkerEl = document.createElement('div');
      dockMarkerEl.className = 'flex items-center justify-center w-8 h-8';
      dockMarkerEl.innerHTML = `
        <div class="absolute w-4 h-4 bg-info-200 rounded-full shadow-lg shadow-info-200/30 z-10"></div>
        <div class="absolute w-6 h-6 bg-info-200/30 rounded-full"></div>
      `;
      
      new mapboxgl.Marker(dockMarkerEl)
        .setLngLat([dockLocation.lng, dockLocation.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Dock Location'))
        .addTo(map.current);
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
      
      new mapboxgl.Marker(waypointMarkerEl)
        .setLngLat([waypoint.lng, waypoint.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Waypoint ${waypoint.index}`))
        .addTo(map.current);
    });
    
    // Add current position marker if available
    if (currentPosition) {
      const currentPosMarkerEl = document.createElement('div');
      currentPosMarkerEl.className = 'flex items-center justify-center w-10 h-10';
      currentPosMarkerEl.innerHTML = `
        <div class="absolute w-4 h-4 bg-primary-200 rounded-full shadow-lg shadow-primary-200/50 z-10"></div>
        <div class="absolute w-8 h-8 bg-primary-200/20 rounded-full animate-ping"></div>
      `;
      
      new mapboxgl.Marker(currentPosMarkerEl)
        .setLngLat([currentPosition.lng, currentPosition.lat])
        .addTo(map.current);
        
      // Smoothly move map to current position
      map.current.easeTo({
        center: [currentPosition.lng, currentPosition.lat],
        duration: 1000
      });
    }
    
  }, [mapLoaded, takeoffPoint, landingPoint, dockLocation, waypoints, currentPosition]);
  
  return (
    <div className="relative w-full h-full rounded-200 overflow-hidden border border-[rgba(255,255,255,0.08)]">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0 bg-background-level-2"></div>
      
      {/* Controls overlay container */}
      <div className="absolute top-0 right-0 p-400 z-10">
        {/* Additional custom controls can be added here */}
      </div>
      
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
