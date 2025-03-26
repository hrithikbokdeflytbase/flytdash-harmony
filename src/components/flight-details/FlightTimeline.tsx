import React, { useState, useEffect, useRef } from 'react';
import { Settings, Info, PlayCircle, SkipBack, SkipForward, Pause, ChevronDown, ChevronUp, Circle, Square, Triangle, Octagon, Camera, Video, AlertTriangle, AlertOctagon, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  type: 'takeoff' | 'mission' | 'rtl' | 'landing' | 'hover' | 'manual';
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
  const [expandedTracks, setExpandedTracks] = useState({
    missionPhases: true,
    videoSegments: true,
    systemEvents: true,
    warnings: true,
    media: true,
  });
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

  // Toggle track expansion
  const toggleTrackExpansion = (trackName: keyof typeof expandedTracks) => {
    setExpandedTracks(prev => ({
      ...prev,
      [trackName]: !prev[trackName]
    }));
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

  // Get color for mission phase
  const getMissionPhaseColor = (phaseType: MissionPhase['type']) => {
    switch (phaseType) {
      case 'takeoff': return 'from-green-500/80 to-green-600/80 border-green-600/30';
      case 'mission': return 'from-blue-500/80 to-blue-600/80 border-blue-600/30';
      case 'hover': return 'from-purple-500/80 to-purple-600/80 border-purple-600/30';
      case 'manual': return 'from-yellow-500/80 to-yellow-600/80 border-yellow-600/30';
      case 'rtl': return 'from-orange-500/80 to-orange-600/80 border-orange-600/30';
      case 'landing': return 'from-red-500/80 to-red-600/80 border-red-600/30';
      default: return 'from-gray-500/80 to-gray-600/80 border-gray-600/30';
    }
  };
  
  // Get color for warning/error
  const getWarningColor = (type: 'warning' | 'error', severity: 'low' | 'medium' | 'high') => {
    if (type === 'error') return 'text-error-200';
    
    switch (severity) {
      case 'low': return 'text-caution-200';
      case 'medium': return 'text-warning-200';
      case 'high': return 'text-error-100';
      default: return 'text-caution-100';
    }
  };
  
  // Get color for media action
  const getMediaColor = (type: MediaAction['type']) => {
    switch (type) {
      case 'photo': return 'text-success-200';
      case 'videoStart': return 'text-info-200';
      case 'videoEnd': return 'text-info-100';
      default: return 'text-info-300';
    }
  };

  // Get icon for system event
  const getSystemEventIcon = (type: SystemEvent['type']) => {
    switch (type) {
      case 'connection': return <Check className="h-4 w-4" />;
      case 'calibration': return <Settings className="h-4 w-4" />;
      case 'modeChange': return <AlertCircle className="h-4 w-4" />;
      case 'command': return <Square className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
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
    details: e.details,
    type: e.type
  })));

  // Group media events by clusters
  const mediaEventClusters = getMarkerClusters(mediaActions.map(e => ({
    timestamp: e.timestamp,
    details: e.fileId || '',
    type: e.type
  })));

  // Render cluster or individual marker
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
                className={`absolute top-0 transform -translate-x-1/2 cursor-pointer z-10 flex items-center justify-center ${clusterClass} rounded-full h-6 w-6 border border-white/20 shadow-lg transition-transform hover:scale-110`}
                style={{ left: `${leftPos}%` }}
                onMouseEnter={() => setHoveredEvent({
                  type: 'cluster',
                  details: `${cluster.events.length} events`,
                  timestamp: secondsToTime(cluster.position)
                })}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                <span className="text-[10px] font-bold text-white">{cluster.events.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs bg-background-level-3 border-outline-primary p-300">
              <div className="space-y-200">
                <p className="fb-body2-medium text-text-icon-01">Cluster: {cluster.events.length} events</p>
                <div className="space-y-100 max-h-[200px] overflow-y-auto">
                  {cluster.events.map((event, idx) => (
                    <div key={idx} className="text-xs text-text-icon-02 flex items-center gap-200">
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
  
  // Current time indicator (vertical line)
  const CurrentTimeIndicator = () => {
    return (
      <div 
        className="absolute top-0 h-full border-l-2 border-dashed border-error-200/80 z-20"
        style={{ 
          left: `${currentPercentage}%`,
          height: '100%'
        }}
      >
        <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-error-200 animate-pulse"></div>
      </div>
    );
  };
  
  // Render media actions track
  const renderMediaActionsTrack = () => {
    return (
      <Collapsible
        open={expandedTracks.media}
        onOpenChange={() => toggleTrackExpansion('media')}
        className="track-container"
      >
        <div className="h-[40px] bg-background-level-3 rounded-[8px] overflow-hidden">
          <CollapsibleTrigger asChild>
            <div className="px-[12px] py-[4px] flex items-center justify-between cursor-pointer hover:bg-background-level-4/50">
              <span className="text-[12px] text-text-icon-01">Media Actions</span>
              {expandedTracks.media ? 
                <ChevronUp className="h-[14px] w-[14px] text-text-icon-02" /> : 
                <ChevronDown className="h-[14px] w-[14px] text-text-icon-02" />
              }
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-[12px]">
            <div className="h-[20px] w-full relative flex items-center">
              {mediaEventClusters.map((cluster, index) => {
                const renderMediaEventMarker = (event: MediaAction) => {
                  const leftPos = getPositionPercentage(event.timestamp);
                  const colorClass = getMediaColor(event.type);
                  
                  return (
                    <TooltipProvider key={`media-${index}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 cursor-pointer transition-transform hover:scale-110"
                            style={{ left: `${leftPos}%` }}
                            onMouseEnter={() => setHoveredEvent({
                              type: event.type.toUpperCase(),
                              details: event.fileId || '',
                              timestamp: event.timestamp
                            })}
                            onMouseLeave={() => setHoveredEvent(null)}
                          >
                            {event.type === 'photo' ? (
                              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-success-200/20 border border-success-200/50">
                                <Camera className="h-3 w-3 text-success-200" />
                              </div>
                            ) : event.type === 'videoStart' ? (
                              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-info-200/20 border border-info-200/50">
                                <Video className="h-3 w-3 text-info-200" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-info-100/20 border border-info-100/50">
                                <Square className="h-3 w-3 text-info-100" fill="currentColor" />
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="p-200 bg-background-level-3 border-outline-primary">
                          <p className="text-xs text-text-icon-01">{event.type === 'photo' ? 'Photo Taken' : event.type === 'videoStart' ? 'Video Started' : 'Video Ended'}</p>
                          {event.fileId && <p className="text-xs text-text-icon-02">ID: {event.fileId}</p>}
                          <p className="text-xs text-text-icon-02">{event.timestamp}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                };
                
                return renderClusterOrMarker(
                  cluster, 
                  renderMediaEventMarker, 
                  "bg-info-100/30"
                );
              })}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };
  
  // Playback controls component
  const PlaybackControls = () => {
    return (
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={skipBackward}
          aria-label="Skip backward 30 seconds"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause playback" : "Start playback"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <PlayCircle className="h-5 w-5" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={skipForward}
          aria-label="Skip forward 30 seconds"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <div className="text-xs text-text-icon-02 ml-2 w-16 text-right">
          {currentPosition.timestamp}
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-[320px] w-full bg-background-level-2 border-t border-t-white/[0.08]" aria-label="Flight timeline">
      {/* Header Bar - 40px height */}
      <div className="h-[40px] px-[16px] flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-text-icon-01">Flight Timeline</h2>
        <div className="flex gap-[8px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Show timeline legend">
                  <Info className="h-[18px] w-[18px] text-text-icon-02" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs bg-background-level-3 border-outline-primary p-300">
                <div className="space-y-200">
                  <p className="fb-body2-medium text-text-icon-01">Timeline Legend</p>
                  <div className="grid grid-cols-2 gap-200">
                    <div className="flex items-center gap-100">
                      <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                      <span className="text-xs text-text-icon-02">Takeoff</span>
                    </div>
                    <div className="flex items-center gap-100">
                      <div className="h-3 w-3 rounded-sm bg-blue-500"></div>
                      <span className="text-xs text-text-icon-02">Mission</span>
                    </div>
                    <div className="flex items-center gap-100">
                      <div className="h-3 w-3 rounded-sm bg-purple-500"></div>
                      <span className="text-xs text-text-icon-02">Hover</span>
                    </div>
                    <div className="flex items-center gap-100">
                      <div className="h-3 w-3 rounded-sm bg-yellow-500"></div>
                      <span className="text-xs text-text-icon-02">Manual</span>
                    </div>
                    <div className="flex items-center gap-100">
                      <div className="h-3 w-3 rounded-sm bg-orange-500"></div>
                      <span className="text-xs text-text-icon-02">RTL</span>
                    </div>
                    <div className="flex items-center gap-100">
                      <div className="h-3 w-3 rounded-sm bg-red-500"></div>
                      <span className="text-xs text-text-icon-02">Landing</span>
                    </div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="grid grid-cols-2 gap-200">
                    <div className="flex items-center gap-100">
                      <Square className="h-3 w-3 text-secondary-50" />
                      <span className="text-xs text-text-icon-02">System Event</span>
                    </div>
                    <div className="flex items-center gap-100">
                      <Triangle className="h-3 w-3 text-caution-200" />
                      <span className="text-xs text-text-icon-02">Warning</span>
                    </div>
                    <div className="flex items-center gap-100">
                      <Octagon className="h-3 w-3 text-error-200" />
                      <span className="text-xs text-text-icon-02">Error</span>
                    </div>
                    <div className="flex items-center gap-100">
                      <Circle className="h-3 w-3 text-success-200" fill="currentColor" />
                      <span className="text-xs text-text-icon-02">Photo</span>
                    </div>
                    <div className="flex items-center gap-100">
                      <Circle className="h-3 w-3 text-info-200" />
                      <span className="text-xs text-text-icon-02">Video</span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="icon" aria-label="Timeline settings">
            <Settings className="h-[18px] w-[18px] text-text-icon-02" />
          </Button>
        </div>
      </div>
      
      {/* Tracks Container - Variable height based on tracks */}
      <div 
        ref={tracksContainerRef}
        className="px-[16px] py-[8px] max-h-[180px] overflow-y-auto flex flex-col gap-[8px] relative"
      >
        {/* Current time indicator (vertical line across all tracks) */}
        <CurrentTimeIndicator />
        
        {/* Display event info on hover */}
        {hoveredEvent && (
          <div 
            className="absolute top-2 right-2 z-50 bg-background-level-4/90 backdrop-blur-sm p-200 rounded-md border border-outline-primary shadow-lg"
            style={{ maxWidth: '250px' }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-text-icon-01">{hoveredEvent.type}</span>
                <span className="text-xs text-text-icon-02">{hoveredEvent.timestamp}</span>
              </div>
              <p className="text-xs text-text-icon-02 truncate">{hoveredEvent.details}</p>
            </div>
          </div>
        )}
        
        {/* Mission Phases Track - Phase Track */}
        <Collapsible
          open={expandedTracks.missionPhases}
          onOpenChange={() => toggleTrackExpansion('missionPhases')}
          className="track-container"
        >
          <div className="h-[60px] bg-background-level-3 rounded-[8px] overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="px-[12px] py-[4px] flex items-center justify-between cursor-pointer hover:bg-background-level-4/50">
                <span className="text-[12px] text-text-icon-01">Mission Phases</span>
                {expandedTracks.missionPhases ? 
                  <ChevronUp className="h-[14px] w-[14px] text-text-icon-02" /> : 
                  <ChevronDown className="h-[14px] w-[14px] text-text-icon-02" />
                }
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="p-[12px]">
              <div className="h-[24px] bg-background-level-4 rounded-[4px] w-full relative">
                {missionPhases.map((phase, index) => {
                  const leftPos = getPositionPercentage(phase.startTime);
                  const width = getWidthPercentage(phase.startTime, phase.endTime);
                  return (
                    <div
                      key={`phase-${index}`}
                      className={`absolute h-full bg-gradient-to-r ${getMissionPhaseColor(phase.type)} rounded-[2px] flex items-center justify-center overflow-hidden border transition-all hover:brightness-125 cursor-pointer`}
                      style={{
                        left: `${leftPos}%`,
                        width: `${width}%`,
                        minWidth: '20px'
                      }}
                      title={`${phase.label}: ${phase.startTime} - ${phase.endTime}`}
                      onMouseEnter={() => setHoveredEvent({
                        type: phase.type.toUpperCase(),
                        details: phase.label,
                        timestamp: `${phase.startTime} - ${phase.endTime}`
                      })}
                      onMouseLeave={() => setHoveredEvent(null)}
                    >
                      <span className="text-[10px] text-white whitespace-nowrap overflow-hidden text-ellipsis px-[4px] font-medium drop-shadow-md">
                        {phase.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Video Segments Track */}
        <Collapsible
          open={expandedTracks.videoSegments}
          onOpenChange={() => toggleTrackExpansion('videoSegments')}
          className="track-container"
        >
          <div className="h-[60px] bg-background-level-3 rounded-[8px] overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="px-[12px] py-[4px] flex items-center justify-between cursor-pointer hover:bg-background-level-4/50">
                <span className="text-[12px] text-text-icon-01">Video Segments</span>
                {expandedTracks.videoSegments ? 
                  <ChevronUp className="h-[14px] w-[14px] text-text-icon-02" /> : 
                  <ChevronDown className="h-[14px] w-[14px] text-text-icon-02" />
                }
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="p-[12px]">
              <div className="h-[24px] bg-background-level-4 rounded-full w-full relative">
                {videoSegments.map((segment, index) => {
                  // Calculate segment position and width as percentage
                  const leftPos = getPositionPercentage(segment.startTime);
                  const width = getWidthPercentage(segment.startTime, segment.endTime);
                  
                  return (
                    <TooltipProvider key={`video-${index}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute h-full bg-gradient-to-r from-primary-200/90 to-primary-300/90 rounded-full cursor-pointer shadow-inner border border-primary-300/50 hover:brightness-125 transition-all"
                            style={{
                              left: `${leftPos}%`,
                              width: `${width}%`
                            }}
                            onMouseEnter={() => setHoveredEvent({
                              type: 'VIDEO',
                              details: segment.url,
                              timestamp: `${segment.startTime} - ${segment.endTime}`
                            })}
                            onMouseLeave={() => setHoveredEvent(null)}
                            onClick={() => onPositionChange(segment.startTime)}
                            role="button"
                            tabIndex={0}
                          >
                            {/* Video segment start/end markers */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-5 w-5 rounded-full bg-info-200 flex items-center justify-center shadow">
                              <Video className="h-3 w-3 text-white" />
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 h-5 w-5 rounded-full bg-info-100 flex items-center justify-center shadow">
                              <Square className="h-3 w-3 text-white" fill="currentColor" />
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="p-200 bg-background-level-3 border-outline-primary">
                          <p className="text-xs text-text-icon-01">Video Segment</p>
                          <p className="text-xs text-text-icon-02">{segment.startTime} - {segment.endTime}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* System Events Track - Event Track */}
        <Collapsible
          open={expandedTracks.systemEvents}
          onOpenChange={() => toggleTrackExpansion('systemEvents')}
          className="track-container"
        >
          <div className="h-[40px] bg-background-level-3 rounded-[8px] overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="px-[12px] py-[4px] flex items-center justify-between cursor-pointer hover:bg-background-level-4/50">
                <span className="text-[12px] text-text-icon-01">System Events</span>
                {expandedTracks.systemEvents ? 
                  <ChevronUp className="h-[14px] w-[14px] text-text-icon-02" /> : 
                  <ChevronDown className="h-[14px] w-[14px] text-text-icon-02" />
                }
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="px-[12px]">
              <div className="h-[20px] w-full relative flex items-center">
                {systemEventClusters.map((cluster, index) => {
                  const renderSystemEventMarker = (event: SystemEvent) => {
                    const leftPos = getPositionPercentage(event.timestamp);
                    return (
                      <TooltipProvider key={`sysevent-${index}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 cursor-pointer transition-transform hover:scale-110"
                              style={{ left: `${leftPos}%` }}
                              onMouseEnter={() => setHoveredEvent({
                                type: event.type.toUpperCase(),
                                details: event.details,
                                timestamp: event.timestamp
                              })}
                              onMouseLeave={() => setHoveredEvent(null)}
                            >
                              <div className="flex items-center justify-center h-5 w-5 rounded bg-secondary-50/20 border border-secondary-50/50 shadow-sm">
                                {getSystemEventIcon
