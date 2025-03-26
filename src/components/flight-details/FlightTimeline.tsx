import React, { useState, useEffect, useRef } from 'react';
import { Settings, Info, PlayCircle, SkipBack, SkipForward, Pause, Circle, Square, 
  Triangle, Octagon, Camera, Video, AlertTriangle, AlertOctagon, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type definitions
type VideoSegment = {
  startTime: string; // Format: "HH:MM:SS"
  endTime: string;   // Format: "HH:MM:SS"
  url: string;
};

interface TimelinePosition {
  timestamp: string; // Format: "HH:MM:SS"
  hasVideo: boolean;
}

type MissionPhase = {
  type: 'manual' | 'gtl' | 'mission' | 'rtds';
  startTime: string; // Format: "HH:MM:SS"
  endTime: string;   // Format: "HH:MM:SS"
  label: string;
};

type SystemEvent = {
  type: 'connection' | 'calibration' | 'modeChange' | 'command';
  timestamp: string; // Format: "HH:MM:SS"
  details: string;
};

type WarningEvent = {
  type: 'warning' | 'error';
  timestamp: string; // Format: "HH:MM:SS"
  details: string;
  severity: 'low' | 'medium' | 'high';
};

type MediaAction = {
  type: 'photo' | 'videoStart' | 'videoEnd';
  timestamp: string; // Format: "HH:MM:SS"
  fileId?: string;
};

interface FlightTimelineProps {
  currentPosition: TimelinePosition;
  videoSegments: VideoSegment[];
  flightDuration: string; // Format: "HH:MM:SS"
  onPositionChange: (position: string) => void;
  missionPhases?: MissionPhase[];
  systemEvents?: SystemEvent[];
  warningEvents?: WarningEvent[];
  mediaActions?: MediaAction[];
}

const FlightTimeline: React.FC<FlightTimelineProps> = ({
  currentPosition,
  videoSegments = [],
  flightDuration = "05:30:00",
  onPositionChange,
  missionPhases = [],
  systemEvents = [],
  warningEvents = [],
  mediaActions = [],
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState<null | {type: string, details: string, timestamp: string}>(null);
  const tracksContainerRef = useRef<HTMLDivElement>(null);
  
  // Convert HH:MM:SS to seconds
  const timeToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  // Convert seconds to HH:MM:SS
  const secondsToTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  const flightDurationSeconds = timeToSeconds(flightDuration);
  const currentSeconds = timeToSeconds(currentPosition.timestamp);
  const currentPercentage = (currentSeconds / flightDurationSeconds) * 100;
  
  // Playback simulation effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPlaying) {
      intervalId = setInterval(() => {
        const newSeconds = Math.min(currentSeconds + 0.5, flightDurationSeconds);
        if (newSeconds >= flightDurationSeconds) {
          setIsPlaying(false);
        } else {
          onPositionChange(secondsToTime(newSeconds));
        }
      }, 500);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, currentSeconds, flightDurationSeconds, onPositionChange]);
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newPosition = Math.floor((value[0] / 100) * flightDurationSeconds);
    setSliderValue(value[0]);
    onPositionChange(secondsToTime(newPosition));
  };
  
  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Skip forward/backward
  const skipForward = () => {
    const newPosition = Math.min(currentSeconds + 30, flightDurationSeconds);
    onPositionChange(secondsToTime(newPosition));
  };
  
  const skipBackward = () => {
    const newPosition = Math.max(currentSeconds - 30, 0);
    onPositionChange(secondsToTime(newPosition));
  };

  // Calculate position as percentage for timeline items
  const getPositionPercentage = (timeString: string) => {
    const seconds = timeToSeconds(timeString);
    return (seconds / flightDurationSeconds) * 100;
  };
  
  // Calculate width as percentage for duration-based timeline items
  const getWidthPercentage = (startTime: string, endTime: string) => {
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);
    return ((endSeconds - startSeconds) / flightDurationSeconds) * 100;
  };
  
  // Get color for mission phase - Updated for new phase types
  const getMissionPhaseColor = (phaseType: MissionPhase['type']) => {
    switch (phaseType) {
      case 'mission': return 'from-blue-500/80 to-blue-600/80 border-blue-700/40';
      case 'manual': return 'from-yellow-500/80 to-yellow-600/80 border-yellow-700/40';
      case 'gtl': return 'from-green-500/80 to-green-600/80 border-green-700/40';
      case 'rtds': return 'from-orange-500/80 to-orange-600/80 border-orange-700/40';
      default: return 'from-gray-500/80 to-gray-600/80 border-gray-700/40';
    }
  };
  
  // Get color for warning/error - Enhanced contrast
  const getWarningColor = (type: 'warning' | 'error', severity: 'low' | 'medium' | 'high') => {
    if (type === 'error') return 'text-error-200 shadow-sm shadow-error-200/30';
    
    switch (severity) {
      case 'low': return 'text-caution-200 shadow-sm shadow-caution-200/30';
      case 'medium': return 'text-warning-200 shadow-sm shadow-warning-200/30';
      case 'high': return 'text-error-100 shadow-sm shadow-error-100/30';
      default: return 'text-caution-100 shadow-sm shadow-caution-100/30';
    }
  };
  
  // Get icon for system event
  const getSystemEventIcon = (type: SystemEvent['type']) => {
    switch (type) {
      case 'connection': return <Check className="h-3 w-3" />;
      case 'calibration': return <Settings className="h-3 w-3" />;
      case 'modeChange': return <AlertCircle className="h-3 w-3" />;
      case 'command': return <Square className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  // Get marker groups based on clusters
  const getMarkerClusters = (events: Array<{timestamp: string, details?: string, type: string}>, threshold = 2) => {
    if (!events.length) return [];
    
    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) => 
      timeToSeconds(a.timestamp) - timeToSeconds(b.timestamp)
    );
    
    const clusters: Array<{
      isCluster: boolean, 
      events: typeof sortedEvents,
      position: number
    }> = [];
    
    let currentCluster: typeof sortedEvents = [];
    let prevTimestamp = -threshold;
    
    sortedEvents.forEach(event => {
      const eventTime = timeToSeconds(event.timestamp);
      
      if (eventTime - prevTimestamp <= threshold) {
        // Add to current cluster
        currentCluster.push(event);
      } else {
        // Start a new cluster if the previous one had items
        if (currentCluster.length > 0) {
          const clusterPosition = currentCluster.reduce((sum, e) => sum + timeToSeconds(e.timestamp), 0) / currentCluster.length;
          clusters.push({
            isCluster: currentCluster.length > 1,
            events: [...currentCluster],
            position: clusterPosition
          });
        }
        currentCluster = [event];
      }
      
      prevTimestamp = eventTime;
    });
    
    // Add the last cluster
    if (currentCluster.length > 0) {
      const clusterPosition = currentCluster.reduce((sum, e) => sum + timeToSeconds(e.timestamp), 0) / currentCluster.length;
      clusters.push({
        isCluster: currentCluster.length > 1,
        events: [...currentCluster],
        position: clusterPosition
      });
    }
    
    return clusters;
  };

  // Group system events by clusters
  const systemEventClusters = getMarkerClusters(systemEvents.map(e => ({
    timestamp: e.timestamp,
    details: e.details,
    type: e.type
  })));

  // Group warning events by clusters
  const warningEventClusters = getMarkerClusters(warningEvents.map(e => ({
    timestamp: e.timestamp,
    details: e.details || '',
    type: e.type || 'warning'
  })));

  // Group media events by clusters
  const mediaEventClusters = getMarkerClusters(mediaActions.filter(e => e.type === 'photo').map(e => ({
    timestamp: e.timestamp,
    details: e.fileId || '',
    type: e.type
  })));

  // Current time indicator (vertical line)
  const CurrentTimeIndicator = () => {
    return (
      <div 
        className="absolute top-0 h-full border-0 z-40 pointer-events-none"
        style={{ 
          left: `${currentPercentage}%`,
          height: 'calc(100% + 15px)',
          width: '2px',
          background: 'rgba(248, 71, 58, 0.8)',
          boxShadow: '0 0 4px rgba(248, 71, 58, 0.6)',
          transform: 'translateY(-15px)',
        }}
      />
    );
  };
  
  // Combined Media Track (Video Segments + Photo captures)
  const renderMediaTrack = () => {
    return (
      <div className="track-section">
        <div className="bg-background-level-3 rounded-[4px] overflow-hidden">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[11px] text-text-icon-01 font-medium">Media</span>
          </div>
          
          <div className="px-3 py-1">
            <div className="h-[16px] bg-background-level-4 rounded-[2px] w-full relative">
              {/* Video Segments */}
              {videoSegments.map((segment, index) => {
                const leftPos = getPositionPercentage(segment.startTime);
                const width = getWidthPercentage(segment.startTime, segment.endTime);
                
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
              {mediaEventClusters.map((cluster, index) => {
                const renderPhotoMarker = (event: MediaAction) => {
                  const leftPos = getPositionPercentage(event.timestamp);
                  
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
                
                // Render cluster or single marker
                return renderClusterOrMarker(
                  cluster, 
                  renderPhotoMarker, 
                  "bg-success-200/80 border border-success-300 z-20"
                );
              })}
              
              {/* Remove the track name overlay that was here */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render cluster or individual marker with higher z-index
  const renderClusterOrMarker = (
    cluster: {isCluster: boolean, events: any[], position: number},
    renderMarker: (event: any) => JSX.Element,
    clusterClass: string
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
                  timestamp: secondsToTime(cluster.position)
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
                  {cluster.events.map((event, idx) => (
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
  
  // Operation Phases Track (renamed from Mission Phases)
  const renderMissionPhasesTrack = () => {
    return (
      <div className="track-section">
        <div className="bg-background-level-3 rounded-[4px] overflow-hidden">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[11px] text-text-icon-01 font-medium">Operation Phases</span>
          </div>
          
          <div className="px-3 py-1">
            <div className="h-[20px] bg-background-level-4 rounded-[2px] w-full relative">
              {missionPhases.map((phase, index) => {
                const leftPos = getPositionPercentage(phase.startTime);
                const width = getWidthPercentage(phase.startTime, phase.endTime);
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
              
              {/* Remove the track name overlay that was here */}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // System Events Track with higher z-index markers
  const renderSystemEventsTrack = () => {
    return (
      <div className="track-section">
        <div className="bg-background-level-3 rounded-[4px] overflow-hidden">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[11px] text-text-icon-01 font-medium">System Events</span>
          </div>
          
          <div className="px-3 py-1">
            <div className="h-[16px] w-full relative flex items-center">
              {systemEventClusters.map((cluster, index) => {
                const renderSystemEventMarker = (event: SystemEvent) => {
                  const leftPos = getPositionPercentage(event.timestamp);
                  
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
                
                return renderClusterOrMarker(
                  cluster, 
                  renderSystemEventMarker, 
                  "bg-secondary-50/80 border border-secondary-50 shadow-[0_0_6px_rgba(148,163,184,0.7)] z-20"
                );
              })}
              
              {/* Remove the track name overlay that was here */}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Warnings Track with more prominent markers
  const renderWarningEventsTrack = () => {
    return (
      <div className="track-section">
        <div className="bg-background-level-3 rounded-[4px] overflow-hidden">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[11px] text-text-icon-01 font-medium">Warnings & Errors</span>
          </div>
          
          <div className="px-3 py-1">
            <div className="h-[16px] w-full relative flex items-center">
              {warningEventClusters.map((cluster, index) => {
                const renderWarningEventMarker = (event: WarningEvent) => {
                  const leftPos = getPositionPercentage(event.timestamp);
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
                                <X className="absolute h-2 w-2 text-white" />
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
                
                return renderClusterOrMarker(
                  cluster, 
                  renderWarningEventMarker, 
                  "bg-yellow-500/80 border border-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)] z-20"
                );
              })}
              
              {/* Remove the track name overlay that was here */}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Enhanced Playback controls
  const PlaybackControls = () => {
    return (
      <div className="flex items-center space-x-2 h-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={skipBackward}
          aria-label="Skip backward 30 seconds"
          className="h-8 w-8"
        >
          <SkipBack className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause playback" : "Start playback"}
          className="h-8 w-8"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={skipForward}
          aria-label="Skip forward 30 seconds"
          className="h-8 w-8"
        >
          <SkipForward className="h-3 w-3" />
        </Button>
        <div className="text-xs text-text-icon-02 ml-1 w-16 text-right">
          {currentPosition.timestamp}
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-[240px] w-full bg-background-level-2 border-t border-t-white/[0.08]" aria-label="Flight timeline">
      {/* Main timeline container */}
      <div className="flex flex-col h-full">
        {/* Top section - tracks */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2" ref={tracksContainerRef}>
          {renderMissionPhasesTrack()}
          {renderMediaTrack()}
          {renderSystemEventsTrack()}
          {renderWarningEventsTrack()}
          
          {/* Event hover info display - KEEP ONLY THIS TOOLTIP, removed the one at the right side */}
          {hoveredEvent && (
            <div className="absolute bottom-20 left-4 bg-background-level-3/90 backdrop-blur-sm p-2 rounded-md border border-outline-primary text-xs z-50 max-w-xs">
              <p className="text-text-icon-01 font-medium">{hoveredEvent.type}</p>
              <p className="text-text-icon-02">{hoveredEvent.details}</p>
              <p className="text-text-icon-02 text-primary-100">{hoveredEvent.timestamp}</p>
            </div>
          )}
        </div>
        
        {/* Bottom section - slider and controls */}
        <div className="p-4 pt-0 relative">
          {/* Current time indicator line - for precise visual alignment */}
          <CurrentTimeIndicator />
          
          <div className="flex items-center mb-1">
            <PlaybackControls />
            <div className="flex-1 mx-2">
              <Slider
                value={[sliderValue]}
                max={100}
                step={0.1}
                onValueChange={handleSliderChange}
                aria-label="Timeline position"
              />
            </div>
            <div className="text-xs text-text-icon-02 w-20">
              {flightDuration}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTimeline;
