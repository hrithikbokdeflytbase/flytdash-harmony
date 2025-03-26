
import React, { useState } from 'react';
import { Settings, Info, PlayCircle, SkipBack, SkipForward, Pause, ChevronDown, ChevronUp, Circle, Square, Triangle, Octagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
  missionPhases = [
    { type: 'takeoff', startTime: '00:00:00', endTime: '00:01:30', label: 'Takeoff' },
    { type: 'mission', startTime: '00:01:30', endTime: '00:15:00', label: 'Mission' },
    { type: 'hover', startTime: '00:15:00', endTime: '00:18:30', label: 'Hover' },
    { type: 'manual', startTime: '00:18:30', endTime: '00:22:00', label: 'Manual Control' },
    { type: 'rtl', startTime: '00:22:00', endTime: '00:24:30', label: 'Return to Launch' },
    { type: 'landing', startTime: '00:24:30', endTime: '00:25:30', label: 'Landing' },
  ],
  systemEvents = [
    { type: 'connection', timestamp: '00:00:30', details: 'GPS Fixed' },
    { type: 'calibration', timestamp: '00:01:15', details: 'IMU Calibrated' },
    { type: 'modeChange', timestamp: '00:05:45', details: 'Mode: Autonomous' },
    { type: 'command', timestamp: '00:12:20', details: 'Waypoint Reached' },
    { type: 'modeChange', timestamp: '00:18:30', details: 'Mode: Manual' },
    { type: 'command', timestamp: '00:22:00', details: 'RTL Activated' },
  ],
  warningEvents = [
    { type: 'warning', timestamp: '00:04:15', details: 'Low Battery', severity: 'medium' },
    { type: 'warning', timestamp: '00:08:30', details: 'Strong Wind', severity: 'low' },
    { type: 'error', timestamp: '00:17:45', details: 'Sensor Error', severity: 'high' },
    { type: 'warning', timestamp: '00:21:10', details: 'Signal Interference', severity: 'medium' },
  ],
  mediaActions = [
    { type: 'photo', timestamp: '00:03:20', fileId: 'IMG001' },
    { type: 'videoStart', timestamp: '00:10:00', fileId: 'VID001' },
    { type: 'videoEnd', timestamp: '00:12:30', fileId: 'VID001' },
    { type: 'photo', timestamp: '00:14:15', fileId: 'IMG002' },
    { type: 'videoStart', timestamp: '00:15:00', fileId: 'VID002' },
    { type: 'videoEnd', timestamp: '00:18:45', fileId: 'VID002' },
    { type: 'photo', timestamp: '00:20:50', fileId: 'IMG003' },
    { type: 'videoStart', timestamp: '00:22:15', fileId: 'VID003' },
    { type: 'videoEnd', timestamp: '00:25:00', fileId: 'VID003' },
  ],
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
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newPosition = Math.floor((value[0] / 100) * flightDurationSeconds);
    setSliderValue(value[0]);
    onPositionChange(secondsToTime(newPosition));
  };
  
  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Additional playback control logic would go here
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
      case 'takeoff': return 'bg-green-500/60';
      case 'mission': return 'bg-blue-500/60';
      case 'hover': return 'bg-purple-500/60';
      case 'manual': return 'bg-yellow-500/60';
      case 'rtl': return 'bg-orange-500/60';
      case 'landing': return 'bg-red-500/60';
      default: return 'bg-gray-500/60';
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
  
  return (
    <div className="h-[320px] w-full bg-background-level-2 border-t border-t-white/[0.08]" aria-label="Flight timeline">
      {/* Header Bar - 40px height */}
      <div className="h-[40px] px-[16px] flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-text-icon-01">Flight Timeline</h2>
        <div className="flex gap-[8px]">
          <Button variant="ghost" size="icon" aria-label="Show timeline legend">
            <Info className="h-[18px] w-[18px] text-text-icon-02" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Timeline settings">
            <Settings className="h-[18px] w-[18px] text-text-icon-02" />
          </Button>
        </div>
      </div>
      
      {/* Tracks Container - Variable height based on tracks */}
      <div className="px-[16px] py-[8px] max-h-[180px] overflow-y-auto flex flex-col gap-[8px]">
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
                      className={`absolute h-full ${getMissionPhaseColor(phase.type)} rounded-[2px] flex items-center justify-center overflow-hidden`}
                      style={{
                        left: `${leftPos}%`,
                        width: `${width}%`,
                        minWidth: '20px'
                      }}
                      title={`${phase.label}: ${phase.startTime} - ${phase.endTime}`}
                    >
                      <span className="text-[10px] text-white whitespace-nowrap overflow-hidden text-ellipsis px-[4px]">
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
              <div className="h-[4px] bg-background-level-4 rounded-full w-full relative">
                {videoSegments.map((segment, index) => {
                  // Calculate segment position and width as percentage
                  const leftPos = getPositionPercentage(segment.startTime);
                  const width = getWidthPercentage(segment.startTime, segment.endTime);
                  
                  return (
                    <div
                      key={`video-${index}`}
                      className="absolute h-full bg-primary-200 rounded-full cursor-pointer"
                      style={{
                        left: `${leftPos}%`,
                        width: `${width}%`
                      }}
                      title={`Video segment: ${segment.startTime} - ${segment.endTime}`}
                      onClick={() => onPositionChange(segment.startTime)}
                      role="button"
                      tabIndex={0}
                    />
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
              <div className="h-[20px] w-full relative">
                {systemEvents.map((event, index) => {
                  const leftPos = getPositionPercentage(event.timestamp);
                  return (
                    <div
                      key={`sysevent-${index}`}
                      className="absolute top-0 transform -translate-x-1/2 cursor-pointer"
                      style={{ left: `${leftPos}%` }}
                      title={`${event.details} at ${event.timestamp}`}
                    >
                      <Square 
                        className="h-[12px] w-[12px] text-secondary-50" 
                        fill="currentColor" 
                        strokeWidth={1} 
                      />
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Warnings/Errors Track - Event Track */}
        <Collapsible
          open={expandedTracks.warnings}
          onOpenChange={() => toggleTrackExpansion('warnings')}
          className="track-container"
        >
          <div className="h-[40px] bg-background-level-3 rounded-[8px] overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="px-[12px] py-[4px] flex items-center justify-between cursor-pointer hover:bg-background-level-4/50">
                <span className="text-[12px] text-text-icon-01">Warnings & Errors</span>
                {expandedTracks.warnings ? 
                  <ChevronUp className="h-[14px] w-[14px] text-text-icon-02" /> : 
                  <ChevronDown className="h-[14px] w-[14px] text-text-icon-02" />
                }
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="px-[12px]">
              <div className="h-[20px] w-full relative">
                {warningEvents.map((event, index) => {
                  const leftPos = getPositionPercentage(event.timestamp);
                  const colorClass = getWarningColor(event.type, event.severity);
                  return (
                    <div
                      key={`warning-${index}`}
                      className="absolute top-0 transform -translate-x-1/2 cursor-pointer"
                      style={{ left: `${leftPos}%` }}
                      title={`${event.details} at ${event.timestamp}`}
                    >
                      {event.type === 'warning' ? (
                        <Triangle 
                          className={`h-[12px] w-[12px] ${colorClass}`} 
                          fill="currentColor" 
                          strokeWidth={1} 
                        />
                      ) : (
                        <Octagon 
                          className={`h-[12px] w-[12px] ${colorClass}`} 
                          fill="currentColor" 
                          strokeWidth={1} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Media/Actions Track - Event Track */}
        <Collapsible
          open={expandedTracks.media}
          onOpenChange={() => toggleTrackExpansion('media')}
          className="track-container"
        >
          <div className="h-[40px] bg-background-level-3 rounded-[8px] overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="px-[12px] py-[4px] flex items-center justify-between cursor-pointer hover:bg-background-level-4/50">
                <span className="text-[12px] text-text-icon-01">Media & Actions</span>
                {expandedTracks.media ? 
                  <ChevronUp className="h-[14px] w-[14px] text-text-icon-02" /> : 
                  <ChevronDown className="h-[14px] w-[14px] text-text-icon-02" />
                }
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="px-[12px]">
              <div className="h-[20px] w-full relative">
                {mediaActions.map((action, index) => {
                  const leftPos = getPositionPercentage(action.timestamp);
                  const colorClass = getMediaColor(action.type);
                  return (
                    <div
                      key={`media-${index}`}
                      className="absolute top-0 transform -translate-x-1/2 cursor-pointer"
                      style={{ left: `${leftPos}%` }}
                      title={`${action.type} at ${action.timestamp}`}
                    >
                      <Circle 
                        className={`h-[12px] w-[12px] ${colorClass}`} 
                        fill={action.type === 'photo' ? "currentColor" : "none"} 
                        strokeWidth={1.5} 
                      />
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
      
      <Separator className="bg-white/[0.04]" />
      
      {/* Timeline Scrubber - 50px height */}
      <div className="h-[50px] px-[16px] flex items-center gap-[16px]">
        {/* Playback Controls */}
        <div className="flex items-center gap-[8px]">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-[32px] w-[32px]" 
            onClick={skipBackward}
            aria-label="Skip backward 30 seconds"
          >
            <SkipBack className="h-[16px] w-[16px] text-text-icon-01" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-[32px] w-[32px]" 
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-[16px] w-[16px] text-text-icon-01" />
            ) : (
              <PlayCircle className="h-[16px] w-[16px] text-text-icon-01" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-[32px] w-[32px]" 
            onClick={skipForward}
            aria-label="Skip forward 30 seconds"
          >
            <SkipForward className="h-[16px] w-[16px] text-text-icon-01" />
          </Button>
        </div>
        
        {/* Current Time Display */}
        <div className="text-[12px] text-text-icon-01 w-[60px]">
          {currentPosition.timestamp}
        </div>
        
        {/* Scrubber Track */}
        <div className="flex-1 flex items-center">
          <Slider
            value={[currentPercentage]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSliderChange}
            className="flex-1"
            aria-label="Timeline position"
          />
        </div>
        
        {/* Total Duration Display */}
        <div className="text-[12px] text-text-icon-02 w-[60px]">
          {flightDuration}
        </div>
      </div>
      
      {/* Time Markers */}
      <div className="h-[30px] px-[16px] flex justify-between items-center">
        {Array.from({ length: 6 }).map((_, index) => {
          const sectionDuration = flightDurationSeconds / 5;
          const markerTime = secondsToTime(index * sectionDuration);
          return (
            <div key={index} className="text-[10px] text-text-icon-02">
              {markerTime}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlightTimeline;
