
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Event types
type EventSeverity = 'critical' | 'warning' | 'normal';

interface TimelineEvent {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  severity: EventSeverity;
}

const TimelinePanel: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Sample events data
  const events: TimelineEvent[] = [
    {
      id: 'event-1',
      name: 'Takeoff',
      description: 'Normal takeoff sequence completed',
      timestamp: '00:00:15',
      severity: 'normal'
    },
    {
      id: 'event-2',
      name: 'Compass Interference',
      description: 'Magnetic interference detected',
      timestamp: '00:03:18',
      severity: 'warning'
    },
    {
      id: 'event-3',
      name: 'NFZ Breach',
      description: 'Entered No-Fly Zone: Airport Perimeter',
      timestamp: '00:04:28',
      severity: 'critical'
    },
    {
      id: 'event-4',
      name: 'Waypoint Reached',
      description: 'Waypoint 3 of 8 completed',
      timestamp: '00:05:30',
      severity: 'normal'
    },
    {
      id: 'event-5',
      name: 'High Wind Speed',
      description: 'Wind speed 11.2 m/s',
      timestamp: '00:06:12',
      severity: 'warning'
    },
    {
      id: 'event-6',
      name: 'Aircraft Detected',
      description: 'Commercial aircraft 2.1km NE, 400ft above',
      timestamp: '00:08:42',
      severity: 'critical'
    },
    {
      id: 'event-7',
      name: 'Geofence Breach',
      description: 'Approaching east border',
      timestamp: '00:09:45',
      severity: 'warning'
    },
    {
      id: 'event-8',
      name: 'Critical Battery Level',
      description: 'Battery at 15%, RTH initiated',
      timestamp: '00:12:15',
      severity: 'critical'
    },
    {
      id: 'event-9',
      name: 'Landing',
      description: 'Landing sequence completed',
      timestamp: '00:14:22',
      severity: 'normal'
    },
  ];

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

  const handleJumpToEvent = (eventId: string) => {
    console.log('Jumping to event:', eventId);
    // In a real implementation, this would sync with the main timeline
    // by updating the timelinePosition in the parent component
  };

  return (
    <div className="flex flex-col h-full">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-primary">
        <span className="text-sm font-medium text-text-icon-01">Flight Events</span>
        <span className="text-xs text-text-icon-02">{events.length} events</span>
      </div>
      
      {/* Event List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {events.map((event) => (
            <div
              key={event.id}
              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-background-level-3 border-b border-outline-primary ${
                selectedEventId === event.id ? 'bg-background-level-3' : ''
              }`}
              onClick={() => setSelectedEventId(event.id === selectedEventId ? null : event.id)}
            >
              {/* Severity Indicator */}
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0 mr-3" 
                style={{ backgroundColor: getSeverityColor(event.severity) }}
              />
              
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TimelinePanel;
