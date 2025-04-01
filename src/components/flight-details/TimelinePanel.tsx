
import React, { useState, useEffect } from 'react';
import { ArrowRight, Square, AlertTriangle, AlertOctagon, Camera, Video, Diamond, Circle, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Updated event types - removed unsupported event types
type EventSeverity = 'critical' | 'warning' | 'normal';
type EventType = 'mode_change' | 'waypoint' | 'warning' | 'error' | 'photo' | 'video';

interface TimelineEvent {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  severity: EventSeverity;
  type: EventType;
}

interface TimelinePanelProps {
  timelinePosition?: string;
  onEventSelect?: (eventId: string) => void;
}

const TimelinePanel: React.FC<TimelinePanelProps> = ({ 
  timelinePosition,
  onEventSelect 
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentlyViewingMessage, setCurrentlyViewingMessage] = useState<string | null>(null);
  
  // Updated sample events data - removed unsupported event types
  const events: TimelineEvent[] = [
    {
      id: 'event-1',
      name: 'Takeoff',
      description: 'Normal takeoff sequence completed',
      timestamp: '00:00:15',
      severity: 'normal',
      type: 'mode_change'
    },
    {
      id: 'event-2',
      name: 'Compass Interference',
      description: 'Magnetic interference detected',
      timestamp: '00:03:18',
      severity: 'warning',
      type: 'warning'
    },
    {
      id: 'event-4',
      name: 'Waypoint Reached',
      description: 'Waypoint 3 of 8 completed',
      timestamp: '00:05:30',
      severity: 'normal',
      type: 'waypoint'
    },
    {
      id: 'event-5',
      name: 'Low Battery Warning',
      description: 'Battery at 25%',
      timestamp: '00:06:12',
      severity: 'warning',
      type: 'warning'
    },
    {
      id: 'event-7',
      name: 'Photo Captured',
      description: 'Image stored as DJI_0042.jpg',
      timestamp: '00:08:45',
      severity: 'normal',
      type: 'photo'
    },
    {
      id: 'event-8',
      name: 'Video Recording Started',
      description: 'Video recording initiated',
      timestamp: '00:08:50',
      severity: 'normal',
      type: 'video'
    },
    {
      id: 'event-10',
      name: 'Critical Battery Level',
      description: 'Battery at 15%, RTH initiated',
      timestamp: '00:12:15',
      severity: 'critical',
      type: 'error'
    },
    {
      id: 'event-11',
      name: 'Return to Home',
      description: 'RTH sequence initiated',
      timestamp: '00:12:18',
      severity: 'normal',
      type: 'mode_change'
    },
    {
      id: 'event-12',
      name: 'Landing',
      description: 'Landing sequence completed',
      timestamp: '00:14:22',
      severity: 'normal',
      type: 'mode_change'
    },
  ];

  // Effect to sync selection with timeline position
  useEffect(() => {
    if (timelinePosition) {
      // Find events that match or are close to the current timeline position
      const closestEvent = findClosestEvent(timelinePosition);
      if (closestEvent && Math.abs(timeToSeconds(closestEvent.timestamp) - timeToSeconds(timelinePosition)) < 3) {
        setSelectedEventId(closestEvent.id);
        setCurrentlyViewingMessage(`Currently showing: ${closestEvent.name}`);
      } else {
        setCurrentlyViewingMessage(null);
      }
    }
  }, [timelinePosition]);

  // Get severity color
  const getSeverityColor = (severity: EventSeverity): string => {
    switch (severity) {
      case 'critical':
        return '#F8473A'; // Error base red
      case 'warning':
        return '#FDB022'; // Caution base yellow/orange
      case 'normal':
        return '#10B981'; // Green
      default:
        return '#496DC8'; // Default blue
    }
  };

  // Convert time string to seconds for comparison
  const timeToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Find event closest to the given timestamp
  const findClosestEvent = (timestamp: string): TimelineEvent | null => {
    const targetSeconds = timeToSeconds(timestamp);
    let closestEvent: TimelineEvent | null = null;
    let smallestDiff = Infinity;

    events.forEach(event => {
      const eventSeconds = timeToSeconds(event.timestamp);
      const diff = Math.abs(eventSeconds - targetSeconds);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestEvent = event;
      }
    });

    return closestEvent;
  };

  // Group events by proximity (for clustering) - updated for reduced set of events
  const getEventClusters = () => {
    const sortedEvents = [...events].sort((a, b) => 
      timeToSeconds(a.timestamp) - timeToSeconds(b.timestamp)
    );
    
    const clusters: { events: TimelineEvent[], timestamp: string }[] = [];
    let currentCluster: TimelineEvent[] = [];
    let prevTimestamp: number | null = null;
    
    sortedEvents.forEach(event => {
      const eventTime = timeToSeconds(event.timestamp);
      
      if (prevTimestamp === null || eventTime - prevTimestamp <= 3) {
        // Add to current cluster if within 3 seconds
        currentCluster.push(event);
      } else {
        // Start a new cluster
        if (currentCluster.length > 0) {
          clusters.push({
            events: [...currentCluster],
            timestamp: currentCluster[0].timestamp
          });
        }
        currentCluster = [event];
      }
      
      prevTimestamp = eventTime;
    });
    
    // Add the last cluster
    if (currentCluster.length > 0) {
      clusters.push({
        events: [...currentCluster],
        timestamp: currentCluster[0].timestamp
      });
    }
    
    return clusters;
  };

  // Get the appropriate icon for an event type - updated for the reduced set of event types
  const getEventIcon = (event: TimelineEvent) => {
    const size = 14;
    const strokeWidth = 1.5;
    const color = getSeverityColor(event.severity);
    
    switch (event.type) {
      case 'mode_change':
        return <Square size={size} strokeWidth={strokeWidth} color={color} />;
      case 'waypoint':
        return <Diamond size={size} strokeWidth={strokeWidth} color={color} />;
      case 'warning':
        return <AlertTriangle size={size} strokeWidth={strokeWidth} color={color} />;
      case 'error':
        return <AlertOctagon size={size} strokeWidth={strokeWidth} color={color} />;
      case 'photo':
        return <Camera size={size} strokeWidth={strokeWidth} color={color} />;
      case 'video':
        return <Video size={size} strokeWidth={strokeWidth} color={color} />;
      default:
        return <Circle size={size} strokeWidth={strokeWidth} color={color} />;
    }
  };

  const handleJumpToEvent = (eventId: string) => {
    console.log('Jumping to event:', eventId);
    // Call parent component's handler if provided
    if (onEventSelect) {
      onEventSelect(eventId);
    }
  };

  const handleEventClick = (eventId: string) => {
    const newSelectedId = eventId === selectedEventId ? null : eventId;
    setSelectedEventId(newSelectedId);
    
    if (newSelectedId) {
      const selectedEvent = events.find(e => e.id === newSelectedId);
      if (selectedEvent) {
        setCurrentlyViewingMessage(`Currently showing: ${selectedEvent.name}`);
        
        // Call parent component's handler if provided
        if (onEventSelect) {
          onEventSelect(newSelectedId);
        }
      }
    } else {
      setCurrentlyViewingMessage(null);
    }
  };

  // Get event clusters for rendering
  const eventClusters = getEventClusters();

  return (
    <div className="flex flex-col h-full">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-primary">
        <span className="text-sm font-medium text-text-icon-01">Flight Events</span>
        <span className="text-xs text-text-icon-02">{events.length} events</span>
      </div>
      
      {/* Currently Viewing Message */}
      {currentlyViewingMessage && (
        <div className="bg-background-level-3 px-4 py-2 border-b border-outline-primary">
          <span className="text-xs text-primary-100">{currentlyViewingMessage}</span>
        </div>
      )}
      
      {/* Event List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {eventClusters.map((cluster, clusterIndex) => {
            const isCluster = cluster.events.length > 1;
            
            if (isCluster) {
              // Render cluster
              const primaryEvent = cluster.events[0];
              const clusterSelectedClass = cluster.events.some(e => e.id === selectedEventId) 
                ? 'bg-background-level-3' 
                : '';
              
              return (
                <TooltipProvider key={`cluster-${clusterIndex}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex items-center px-4 py-2 cursor-pointer hover:bg-background-level-3 border-b border-outline-primary ${clusterSelectedClass}`}
                        onClick={() => handleEventClick(primaryEvent.id)}
                      >
                        {/* Event Icon with Count */}
                        <div className="relative mr-3">
                          {getEventIcon(primaryEvent)}
                          <div className="absolute -right-2 -top-1 bg-primary-200 text-text-icon-01 rounded-full text-[9px] h-4 w-4 flex items-center justify-center">
                            +{cluster.events.length}
                          </div>
                        </div>
                        
                        {/* Event Details */}
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-text-icon-01">{primaryEvent.name}</div>
                          <div className="text-[11px] text-text-icon-02">{primaryEvent.description}</div>
                        </div>
                        
                        {/* Timestamp */}
                        <div className="text-[11px] text-text-icon-02 ml-2 flex-shrink-0">
                          {primaryEvent.timestamp}
                        </div>
                        
                        {/* Jump to Event button (only shown when selected) */}
                        {selectedEventId === primaryEvent.id && (
                          <button 
                            className="ml-3 flex items-center text-[11px] bg-primary-200 text-text-icon-01 px-2 py-0.5 rounded-sm flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJumpToEvent(primaryEvent.id);
                            }}
                          >
                            <span className="mr-1">Jump</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-2 bg-background-level-3 border border-outline-primary rounded-md">
                      <p className="text-xs font-semibold mb-1 text-text-icon-01">{cluster.events.length} events at {primaryEvent.timestamp}</p>
                      <div className="space-y-1">
                        {cluster.events.map(event => (
                          <div 
                            key={event.id}
                            className={cn(
                              "flex items-center p-1 hover:bg-background-level-4 rounded cursor-pointer",
                              event.id === selectedEventId ? "bg-background-level-4" : ""
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event.id);
                            }}
                          >
                            <div className="mr-2">{getEventIcon(event)}</div>
                            <span className="text-[11px] text-text-icon-01">{event.name}</span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            } else {
              // Render single event
              const event = cluster.events[0];
              return (
                <div
                  key={event.id}
                  className={`flex items-center px-4 py-2 cursor-pointer hover:bg-background-level-3 border-b border-outline-primary ${
                    selectedEventId === event.id ? 'bg-background-level-3' : ''
                  }`}
                  onClick={() => handleEventClick(event.id)}
                >
                  {/* Event Icon */}
                  <div className="mr-3 flex-shrink-0">
                    {getEventIcon(event)}
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-text-icon-01">{event.name}</div>
                    <div className="text-[11px] text-text-icon-02">{event.description}</div>
                  </div>
                  
                  {/* Timestamp */}
                  <div className="text-[11px] text-text-icon-02 ml-2 flex-shrink-0">
                    {event.timestamp}
                  </div>
                  
                  {/* Jump to Event button (only shown when selected) */}
                  {selectedEventId === event.id && (
                    <button 
                      className="ml-3 flex items-center text-[11px] bg-primary-200 text-text-icon-01 px-2 py-0.5 rounded-sm flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJumpToEvent(event.id);
                      }}
                    >
                      <span className="mr-1">Jump</span>
                      <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              );
            }
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TimelinePanel;
