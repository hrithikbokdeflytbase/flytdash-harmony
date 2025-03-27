
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Settings, AlertCircle, Square, Camera, Video, Triangle, Octagon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  VideoSegment, 
  MissionPhase, 
  SystemEvent, 
  WarningEvent, 
  MediaAction 
} from './timelineTypes';
import { 
  getPositionPercentage, 
  getWidthPercentage, 
  getMissionPhaseColor, 
  getMarkerClusters 
} from './timelineUtils';

interface TrackSectionProps {
  title: string;
  children: React.ReactNode;
}

export const TrackSection: React.FC<TrackSectionProps> = ({ title, children }) => {
  return (
    <div className="track-section">
      <div className="bg-background-level-3 rounded-[4px] overflow-hidden">
        <div className="px-3 py-1 flex items-center justify-between">
          <span className="text-[11px] text-text-icon-01 font-medium">{title}</span>
        </div>
        
        <div className="px-3 py-1">
          {children}
        </div>
      </div>
    </div>
  );
};

interface MediaTrackProps {
  videoSegments: VideoSegment[];
  mediaActions: MediaAction[];
  flightDurationSeconds: number;
  setHoveredEvent: (event: any) => void;
  onPositionChange: (position: string) => void;
}

export const MediaTrack: React.FC<MediaTrackProps> = ({ 
  videoSegments, 
  mediaActions, 
  flightDurationSeconds,
  setHoveredEvent,
  onPositionChange 
}) => {
  // Group media events by clusters
  const mediaEventClusters = getMarkerClusters(
    mediaActions.filter(e => e.type === 'photo').map(e => ({
      timestamp: e.timestamp,
      details: e.fileId || '',
      type: e.type
    }))
  );

  const renderPhotoMarker = (event: MediaAction) => {
    const leftPos = getPositionPercentage(event.timestamp, flightDurationSeconds);
    
    return (
      <TooltipProvider key={`photo-${event.timestamp}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 cursor-pointer hover:scale-125 transition-transform z-20"
              style={{ left: `${leftPos}%` }}
            >
              <div className="flex items-center justify-center h-4 w-4 rounded-full bg-success-200/80 border border-success-200 shadow-[0_0_5px_rgba(30,174,109,0.7)]">
                <Camera className="h-2 w-2 text-white" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="p-2 bg-background-level-3 border-outline-primary text-xs">
            <p className="text-text-icon-01">Photo Captured</p>
            {event.fileId && <p className="text-text-icon-02">ID: {event.fileId}</p>}
            <p className="text-text-icon-02">{event.timestamp}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <TrackSection title="Media">
      <div className="h-[16px] bg-background-level-4 rounded-[2px] w-full relative">
        {/* Video Segments */}
        {videoSegments.map((segment, index) => {
          const leftPos = getPositionPercentage(segment.startTime, flightDurationSeconds);
          const width = getWidthPercentage(segment.startTime, segment.endTime, flightDurationSeconds);
          
          return (
            <TooltipProvider key={`video-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute h-[14px] top-[1px] bg-gradient-to-r from-primary-200/90 to-primary-300/90 rounded-full cursor-pointer border border-primary-400/40 hover:brightness-125 hover:h-[16px] hover:top-0 transition-all z-20"
                    style={{
                      left: `${leftPos}%`,
                      width: `${width}%`,
                      minWidth: '6px',
                      boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.2)'
                    }}
                    onClick={() => onPositionChange(segment.startTime)}
                  >
                    {width > 4 && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-info-200 flex items-center justify-center shadow-sm">
                        <Video className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-2 bg-background-level-3 border-outline-primary text-xs">
                  <p className="text-text-icon-01">Video Segment</p>
                  <p className="text-text-icon-02">{segment.startTime} - {segment.endTime}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        
        {/* Photo Markers */}
        {mediaEventClusters.map((cluster) => {
          return renderClusterOrMarker(
            cluster, 
            renderPhotoMarker, 
            "bg-success-200/80 border border-success-300 z-20",
            flightDurationSeconds,
            setHoveredEvent
          );
        })}
      </div>
    </TrackSection>
  );
};

interface MissionPhasesTrackProps {
  missionPhases: MissionPhase[];
  flightDurationSeconds: number;
  setHoveredEvent: (event: any) => void;
}

export const MissionPhasesTrack: React.FC<MissionPhasesTrackProps> = ({ 
  missionPhases, 
  flightDurationSeconds,
  setHoveredEvent 
}) => {
  return (
    <TrackSection title="Operation Phases">
      <div className="h-[20px] bg-background-level-4 rounded-[2px] w-full relative">
        {missionPhases.map((phase, index) => {
          const leftPos = getPositionPercentage(phase.startTime, flightDurationSeconds);
          const width = getWidthPercentage(phase.startTime, phase.endTime, flightDurationSeconds);
          return (
            <TooltipProvider key={`phase-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`absolute h-full bg-gradient-to-r ${getMissionPhaseColor(phase.type)} rounded-[2px] border transition-all hover:brightness-125 cursor-pointer z-20`}
                    style={{
                      left: `${leftPos}%`,
                      width: `${width}%`,
                      minWidth: '4px',
                      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseEnter={() => setHoveredEvent({
                      type: phase.type.toUpperCase(),
                      details: phase.label,
                      timestamp: `${phase.startTime} - ${phase.endTime}`
                    })}
                    onMouseLeave={() => setHoveredEvent(null)}
                  >
                    {/* Phase label - only show if there's enough width */}
                    {width > 8 && (
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        <span className="text-[8px] font-medium text-white/90 px-1 truncate text-center">
                          {phase.label}
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-2 bg-background-level-3 border-outline-primary text-xs">
                  <p className="text-text-icon-01 font-medium">{phase.label}</p>
                  <p className="text-text-icon-02">{phase.startTime} - {phase.endTime}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </TrackSection>
  );
};

interface SystemEventsTrackProps {
  systemEvents: SystemEvent[];
  flightDurationSeconds: number;
  setHoveredEvent: (event: any) => void;
}

export const SystemEventsTrack: React.FC<SystemEventsTrackProps> = ({ 
  systemEvents, 
  flightDurationSeconds,
  setHoveredEvent 
}) => {
  // Group system events by clusters
  const systemEventClusters = getMarkerClusters(
    systemEvents.map(e => ({
      timestamp: e.timestamp,
      details: e.details,
      type: e.type
    }))
  );

  // Get icon for system event
  const getSystemEventIcon = (type: SystemEvent['type']) => {
    switch (type) {
      case 'connection': return <Check className="h-3 w-3" />;
      case 'calibration': return <Settings className="h-3 w-3" />;
      case 'modeChange': return <AlertCircle className="h-3 w-3" />;
      case 'command': return <Square className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const renderSystemEventMarker = (event: SystemEvent) => {
    const leftPos = getPositionPercentage(event.timestamp, flightDurationSeconds);
    
    // Define colors based on event type for better visibility
    const getEventColor = (type: SystemEvent['type']) => {
      switch (type) {
        case 'connection': return 'bg-teal-500/80 border-teal-400 text-white shadow-[0_0_6px_rgba(20,184,166,0.8)]';
        case 'calibration': return 'bg-indigo-500/80 border-indigo-400 text-white shadow-[0_0_6px_rgba(99,102,241,0.8)]';
        case 'modeChange': return 'bg-purple-500/80 border-purple-400 text-white shadow-[0_0_6px_rgba(168,85,247,0.8)]';
        case 'command': return 'bg-blue-500/80 border-blue-400 text-white shadow-[0_0_6px_rgba(59,130,246,0.8)]';
        default: return 'bg-gray-500/80 border-gray-400 text-white shadow-[0_0_6px_rgba(156,163,175,0.8)]';
      }
    };
    
    return (
      <TooltipProvider key={`sysevent-${event.timestamp}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 cursor-pointer hover:scale-125 transition-transform z-20"
              style={{ left: `${leftPos}%` }}
              onMouseEnter={() => setHoveredEvent({
                type: event.type.toUpperCase(),
                details: event.details,
                timestamp: event.timestamp
              })}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <div className={`flex items-center justify-center h-4 w-4 rounded-full border ${getEventColor(event.type)}`}>
                {getSystemEventIcon(event.type)}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="p-2 bg-background-level-3 border-outline-primary text-xs">
            <p className="text-text-icon-01 capitalize">{event.type}</p>
            <p className="text-text-icon-02">{event.details}</p>
            <p className="text-text-icon-02">{event.timestamp}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <TrackSection title="System Events">
      <div className="h-[16px] w-full relative flex items-center">
        {systemEventClusters.map((cluster, index) => {
          return renderClusterOrMarker(
            cluster, 
            renderSystemEventMarker, 
            "bg-secondary-50/80 border border-secondary-50 shadow-[0_0_6px_rgba(148,163,184,0.7)] z-20",
            flightDurationSeconds,
            setHoveredEvent
          );
        })}
      </div>
    </TrackSection>
  );
};

interface WarningEventsTrackProps {
  warningEvents: WarningEvent[];
  flightDurationSeconds: number;
  setHoveredEvent: (event: any) => void;
}

export const WarningEventsTrack: React.FC<WarningEventsTrackProps> = ({ 
  warningEvents, 
  flightDurationSeconds,
  setHoveredEvent 
}) => {
  // Group warning events by clusters
  const warningEventClusters = getMarkerClusters(
    warningEvents.map(e => ({
      timestamp: e.timestamp,
      details: e.details || '',
      type: e.type || 'warning'
    }))
  );

  const renderWarningEventMarker = (event: WarningEvent) => {
    const leftPos = getPositionPercentage(event.timestamp, flightDurationSeconds);
    const eventType = event.type || 'warning';
    const eventSeverity = event.severity || 'medium';
    const isHighSeverity = eventSeverity === 'high';
    
    return (
      <TooltipProvider key={`warning-${event.timestamp}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 cursor-pointer hover:scale-125 transition-transform z-20 ${isHighSeverity ? 'animate-pulse' : ''}`}
              style={{ left: `${leftPos}%` }}
              onMouseEnter={() => setHoveredEvent({
                type: eventType.toUpperCase(),
                details: event.details || '',
                timestamp: event.timestamp
              })}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              {eventType === 'warning' ? (
                <div className="flex items-center justify-center h-4 w-4 shadow-[0_0_6px_rgba(234,179,8,0.7)]">
                  <Triangle 
                    className="h-full w-full text-yellow-500"
                    fill="rgba(234, 179, 8, 0.8)" 
                    strokeWidth={2}
                  />
                  <span className="absolute text-[7px] font-bold text-black">!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center h-4 w-4 shadow-[0_0_6px_rgba(220,38,38,0.7)]">
                  <Octagon 
                    className="h-full w-full text-red-500"
                    fill="rgba(220, 38, 38, 0.8)" 
                    strokeWidth={2} 
                  />
                  <span className="absolute text-[10px] font-bold text-white">×</span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="p-2 bg-background-level-3 border-outline-primary text-xs">
            <div className="flex items-center gap-2">
              <Badge variant={eventType === 'warning' ? "secondary" : "destructive"} className={`uppercase text-[8px] ${eventType === 'warning' ? 'bg-amber-600 text-white' : ''}`}>
                {eventSeverity} {eventType}
              </Badge>
            </div>
            <p className="text-text-icon-02 mt-1">{event.details || ''}</p>
            <p className="text-text-icon-02">{event.timestamp}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <TrackSection title="Warnings & Errors">
      <div className="h-[16px] w-full relative flex items-center">
        {warningEventClusters.map((cluster) => {
          return renderClusterOrMarker(
            cluster, 
            renderWarningEventMarker, 
            "bg-yellow-500/80 border border-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)] z-20",
            flightDurationSeconds,
            setHoveredEvent
          );
        })}
      </div>
    </TrackSection>
  );
};

// Helper function to render a cluster or an individual marker
export const renderClusterOrMarker = (
  cluster: any,
  renderMarker: (event: any) => JSX.Element,
  clusterClass: string,
  flightDurationSeconds: number,
  setHoveredEvent: (event: any) => void
) => {
  const leftPos = (cluster.position / flightDurationSeconds) * 100;
  
  if (cluster.isCluster) {
    return (
      <TooltipProvider key={`cluster-${cluster.position}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 cursor-pointer z-20 flex items-center justify-center ${clusterClass} rounded-full h-4 w-4 shadow-lg hover:scale-125 transition-transform`}
              style={{ left: `${leftPos}%` }}
              onMouseEnter={() => setHoveredEvent({
                type: 'cluster',
                details: `${cluster.events.length} events`,
                timestamp: cluster.events[0].timestamp
              })}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <span className="text-[8px] font-bold text-white">{cluster.events.length}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs bg-background-level-3 border-outline-primary p-2 text-xs">
            <div className="space-y-1">
              <p className="font-medium text-text-icon-01">Cluster: {cluster.events.length} events</p>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {cluster.events.map((event: any, idx: number) => (
                  <div key={idx} className="text-text-icon-02 flex items-center gap-1">
                    <span className="text-white/70">{event.timestamp}</span>
                    <span>{event.details}</span>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return renderMarker(cluster.events[0]);
};
