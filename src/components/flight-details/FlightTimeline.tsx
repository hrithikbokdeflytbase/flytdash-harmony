import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Info, PlayCircle, SkipBack, SkipForward, Pause, ChevronDown, ChevronUp, Circle, Square, 
  Triangle, Octagon, Camera, Video, AlertTriangle, AlertOctagon, Check, X, AlertCircle, ChevronsRight, ChevronsLeft, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { debounce } from '@/lib/utils';

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

// Define our playback speeds
type PlaybackSpeed = 1 | 1.5 | 2;

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
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedTracks, setExpandedTracks] = useState({
    missionPhases: true,
    videoSegments: true,
    systemEvents: true,
    warnings: true,
    media: true,
  });
  const [hoveredEvent, setHoveredEvent] = useState<null | {type: string, details: string, timestamp: string}>(null);
  const [selectedEvent, setSelectedEvent] = useState<null | {type: string, details: string, timestamp: string}>(null);
  const [jumpTarget, setJumpTarget] = useState("");
  const [isJumping, setIsJumping] = useState(false);
  
  // Refs
  const tracksContainerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const jumpTargetInputRef = useRef<HTMLInputElement>(null);
  
  // Helper functions
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
  
  // Calculate current timeline values
  const flightDurationSeconds = timeToSeconds(flightDuration);
  const currentSeconds = timeToSeconds(currentPosition.timestamp);
  const currentPercentage = (currentSeconds / flightDurationSeconds) * 100;
  
  // Debounced position change handler
  const debouncedPositionChange = useCallback(
    debounce((position: string) => {
      onPositionChange(position);
    }, 50),
    [onPositionChange]
  );
  
  // Handle slider change with enhanced interaction feedback
  const handleSliderChange = useCallback((value: number[]) => {
    const newPosition = Math.floor((value[0] / 100) * flightDurationSeconds);
    setSliderValue(value[0]);
    
    // Use debounced function for better performance during dragging
    debouncedPositionChange(secondsToTime(newPosition));
  }, [flightDurationSeconds, debouncedPositionChange]);
  
  // Handle slider interaction
  const handleSliderDragStart = () => {
    setIsDragging(true);
    // Pause playback during dragging
    if (isPlaying) {
      setIsPlaying(false);
    }
  };
  
  const handleSliderDragEnd = () => {
    setIsDragging(false);
  };
  
  // Click anywhere on timeline to jump
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newSeconds = Math.floor(clickPosition * flightDurationSeconds);
    
    // Animate moving to the new position
    setIsJumping(true);
    onPositionChange(secondsToTime(newSeconds));
    
    // Reset jumping state after animation
    setTimeout(() => {
      setIsJumping(false);
    }, 500);
  };
  
  // Advanced playback functions
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  const skipForward = useCallback(() => {
    const newPosition = Math.min(currentSeconds + 30, flightDurationSeconds);
    setIsJumping(true);
    onPositionChange(secondsToTime(newPosition));
    setTimeout(() => setIsJumping(false), 300);
  }, [currentSeconds, flightDurationSeconds, onPositionChange]);
  
  const skipBackward = useCallback(() => {
    const newPosition = Math.max(currentSeconds - 30, 0);
    setIsJumping(true);
    onPositionChange(secondsToTime(newPosition));
    setTimeout(() => setIsJumping(false), 300);
  }, [currentSeconds, onPositionChange]);
  
  const jumpToNextEvent = useCallback(() => {
    // Find all events and sort by timestamp
    const allEvents = [
      ...missionPhases.map(p => ({ timestamp: p.startTime, type: 'missionPhase' })),
      ...systemEvents.map(e => ({ timestamp: e.timestamp, type: 'systemEvent' })),
      ...warningEvents.map(e => ({ timestamp: e.timestamp, type: 'warningEvent' })),
      ...mediaActions.map(e => ({ timestamp: e.timestamp, type: 'mediaAction' }))
    ].sort((a, b) => timeToSeconds(a.timestamp) - timeToSeconds(b.timestamp));
    
    // Find next event after current position
    const nextEvent = allEvents.find(e => timeToSeconds(e.timestamp) > currentSeconds);
    
    if (nextEvent) {
      setIsJumping(true);
      onPositionChange(nextEvent.timestamp);
      setTimeout(() => setIsJumping(false), 300);
    }
  }, [missionPhases, systemEvents, warningEvents, mediaActions, currentSeconds, onPositionChange]);
  
  const jumpToPreviousEvent = useCallback(() => {
    // Find all events and sort by timestamp
    const allEvents = [
      ...missionPhases.map(p => ({ timestamp: p.startTime, type: 'missionPhase' })),
      ...systemEvents.map(e => ({ timestamp: e.timestamp, type: 'systemEvent' })),
      ...warningEvents.map(e => ({ timestamp: e.timestamp, type: 'warningEvent' })),
      ...mediaActions.map(e => ({ timestamp: e.timestamp, type: 'mediaAction' }))
    ].sort((a, b) => timeToSeconds(a.timestamp) - timeToSeconds(b.timestamp));
    
    // Find previous event before current position
    const prevEvents = allEvents.filter(e => timeToSeconds(e.timestamp) < currentSeconds);
    const prevEvent = prevEvents[prevEvents.length - 1];
    
    if (prevEvent) {
      setIsJumping(true);
      onPositionChange(prevEvent.timestamp);
      setTimeout(() => setIsJumping(false), 300);
    }
  }, [missionPhases, systemEvents, warningEvents, mediaActions, currentSeconds, onPositionChange]);
  
  // Jump to specific timestamp
  const handleJumpTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJumpTarget(e.target.value);
  };
  
  const handleJumpTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate timestamp format
    const timestampPattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (timestampPattern.test(jumpTarget)) {
      setIsJumping(true);
      onPositionChange(jumpTarget);
      setTimeout(() => setIsJumping(false), 300);
    }
  };
  
  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond if not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case ' ': // Space bar toggles play/pause
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowRight': // Right arrow skips forward
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowLeft': // Left arrow skips backward
          e.preventDefault();
          skipBackward();
          break;
        case 'n': // n jumps to next event
          e.preventDefault();
          jumpToNextEvent();
          break;
        case 'p': // p jumps to previous event
          e.preventDefault();
          jumpToPreviousEvent();
          break;
        case '1': // 1 sets playback speed to 1x
          e.preventDefault();
          setPlaybackSpeed(1);
          break;
        case '2': // 2 sets playback speed to 2x
          e.preventDefault();
          setPlaybackSpeed(2);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlayback, skipForward, skipBackward, jumpToNextEvent, jumpToPreviousEvent]);
  
  // Playback simulation effect with speed control
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const increment = 0.5 * playbackSpeed;
        const newSeconds = Math.min(currentSeconds + increment, flightDurationSeconds);
        if (newSeconds >= flightDurationSeconds) {
          setIsPlaying(false);
        } else {
          onPositionChange(secondsToTime(newSeconds));
        }
      }, 500);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentSeconds, flightDurationSeconds, onPositionChange, playbackSpeed]);
  
  // Event selection handler
  const handleEventSelect = (event: {type: string, details: string, timestamp: string}) => {
    setSelectedEvent(event);
    
    // Jump to event time
    if (event.timestamp.includes(' - ')) {
      // For ranged events (like phases), jump to start time
      const startTime = event.timestamp.split(' - ')[0];
      setIsJumping(true);
      onPositionChange(startTime);
    } else {
      setIsJumping(true);
      onPositionChange(event.timestamp);
    }
    
    setTimeout(() => setIsJumping(false), 300);
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
            events: [...currentCluster],\
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

  // Utility function to render clusters and markers with added keyboard and interaction support
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
                className={`absolute top-0 transform -translate-x-1/2 cursor-pointer z-10 flex items-center justify-center ${clusterClass} rounded-full h-6 w-6 border border-white/20 shadow-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                style={{ left: `${leftPos}%` }}
                onMouseEnter={() => setHoveredEvent({
                  type: 'cluster',
                  details: `${cluster.events.length} events`,
                  timestamp: secondsToTime(cluster.position)
                })}
                onMouseLeave={() => setHoveredEvent(null)}
                onClick={() => {
                  setIsJumping(true);
                  onPositionChange(secondsToTime(cluster.position));
                  setTimeout(() => setIsJumping(false), 300);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsJumping(true);
                    onPositionChange(secondsToTime(cluster.position));
                    setTimeout(() => setIsJumping(false), 300);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Cluster of ${cluster.events.length} events at ${secondsToTime(cluster.position)}`}
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
  
  // Current time indicator with animation enhancements
  const CurrentTimeIndicator = () => {
    return (
      <div 
        className={cn(
          "absolute top-0 h-full border-l-2 border-dashed border-error-200/80 z-20 transition-all",
          isJumping ? "animate-pulse" : "animate-none"
        )}
        style={{ 
          left: `${currentPercentage}%`,
          height: '100%',
          transition: isDragging ? 'none' : isJumping ? 'left 0.3s ease-out' : 'left 0.1s linear'
        }}
      >
        <div className={cn(
          "absolute -top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-error-200",
          isJumping ? "animate-ping" : "animate-pulse"
        )}></div>
      </div>
    );
  };
  
  // Enhanced Media Actions Track with interaction
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
                  const isSelected = selectedEvent && 
                                    selectedEvent.type === event.type.toUpperCase() && 
                                    selectedEvent.timestamp === event.timestamp;
                  
                  return (
                    <TooltipProvider key={`media-${index}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 cursor-pointer transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              isSelected ? "scale-125" : ""
                            )}
                            style={{ left: `${leftPos}%` }}
                            onMouseEnter={() => setHoveredEvent({
                              type: event.type.toUpperCase(),
                              details: event.fileId || '',
                              timestamp: event.timestamp
                            })}
                            onMouseLeave={() => setHoveredEvent(null)}
                            onClick={() => handleEventSelect({
                              type: event.type.toUpperCase(),
                              details: event.fileId || '',
                              timestamp: event.timestamp
                            })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleEventSelect({
                                  type: event.type.toUpperCase(),
                                  details: event.fileId || '',
                                  timestamp: event.timestamp
                                });
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`${event.type} at ${event.timestamp}`}
                          >
                            {event.type === 'photo' ? (
                              <div className={cn(
                                "flex items-center justify-center h-5 w-5 rounded-full bg-success-200/20 border border-success-200/50",
                                isSelected ? "ring-2 ring-success-200 animate-pulse" : ""
                              )}>
                                <Camera className="h-3 w-3 text-success-200" />
                              </div>
                            ) : event.type === 'videoStart' ? (
                              <div className={cn(
                                "flex items-center justify-center h-5 w-5 rounded-full bg-info-200/20 border border-info-200/50",
                                isSelected ? "ring-2 ring-info-200 animate-pulse" : ""
                              )}>
                                <Video className="h-3 w-3 text-info-200" />
                              </div>
                            ) : (
                              <div className={cn(
                                "flex items-center justify-center h-5 w-5 rounded-full bg-info-100/20 border border-info-100/50",
                                isSelected ? "ring-2 ring-info-100 animate-pulse" : ""
                              )}>
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
  
  // Enhanced Playback Controls component with speed control
  const PlaybackControls = () => {
    return (
      <div className="flex items-center space-x-2 h-10">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={jumpToPreviousEvent}
          aria-label="Jump to previous event"
          className="h-10 w-10 bg-[#414E6D] hover:bg-[#516185]"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={skipBackward}
          aria-label="Skip backward 30 seconds"
          className="h-10 w-10 bg-[#414E6D] hover:bg-[#516185]"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause playback" : "Start playback"}
          className="h-10 w-10 bg-[#414E6D] hover:bg-[#516185]"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <PlayCircle className="h-5 w-5" />
          )}
        </Button>
        
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={skipForward}
          aria-label="Skip forward 30 seconds"
          className="h-10 w-10 bg-[#414E6D] hover:bg-[#516185]"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={jumpToNextEvent}
          aria-label="Jump to next event"
          className="h-10 w-10 bg-[#414E6D] hover:bg-[#516185]"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
        
        <div className="text-sm text-text-icon-01 ml-2 min-w-16 text-right">
          {currentPosition.timestamp}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="secondary" 
              size="sm"
              className="ml-2 bg-[#414E6D] hover:bg-[#516185]"
            >
              <FastForward className="h-4 w-4 mr-1" />
              {playbackSpeed}x
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setPlaybackSpeed(1)}>
              1x
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPlaybackSpeed(1.5)}>
              1.5x
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPlaybackSpeed(2)}>
              2x
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <form onSubmit={handleJumpTargetSubmit} className="ml-auto flex items-center">
          <input
            ref={jumpTargetInputRef}
            type="text"
            value={jumpTarget}
            onChange={handleJumpTargetChange}
            placeholder="HH:MM:SS"
            className="w-24 h-8 bg-background-level-3 border border-outline-primary text-text-icon-01 text-xs rounded px-2"
            pattern="^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$"
            title="Format: HH:MM:SS"
          />
          <Button 
            type="submit" 
            variant="secondary" 
            size="sm"
            className="ml-2 bg-[#414E6D] hover:bg-[#516185]"
          >
            Jump
          </Button>
        </form>
      </div>
    );
  };
  
  // Mission Phases Track - Phase Track
  const renderMissionPhasesTrack = () => {
    return (
      <Collapsible
        open={expandedTracks.missionPhases}
        onOpenChange={() => toggleTrackExpansion('missionPhases')}
        className="track-container"
      >
        <div className="h-[60px] bg-background-level-3 rounded-[8px] overflow-hidden">
          <CollapsibleTrigger asChild>
            <div className="px-[12px] py-[4px] flex items-center justify-between cursor-pointer hover:bg-
