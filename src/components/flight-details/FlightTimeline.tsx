
import React, { useState, useEffect, useRef } from 'react';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineSlider } from '@/components/ui/slider';
import { 
  TimelinePosition, 
  VideoSegment, 
  MissionPhase, 
  SystemEvent, 
  WarningEvent, 
  MediaAction 
} from './timeline/timelineTypes';
import { timeToSeconds, secondsToTime } from './timeline/timelineUtils';
import { PlaybackControls } from './timeline/PlaybackControls';
import { 
  MediaTrack,
  MissionPhasesTrack,
  SystemEventsTrack,
  WarningEventsTrack
} from './timeline/TimelineTracks';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const tracksHeightRef = useRef<number>(0);
  
  const flightDurationSeconds = timeToSeconds(flightDuration);
  const currentSeconds = timeToSeconds(currentPosition.timestamp);
  const currentPercentage = (currentSeconds / flightDurationSeconds) * 100;
  
  // Calculate tracks container height for the position indicator
  useEffect(() => {
    const updateHeight = () => {
      if (tracksContainerRef.current) {
        // Get only the visible height that should be covered by the indicator
        const visibleHeight = tracksContainerRef.current.scrollHeight - 16; // Subtract some padding
        tracksHeightRef.current = Math.min(visibleHeight, tracksContainerRef.current.clientHeight);
      }
    };
    
    updateHeight();
    // Add resize listener to update height if window size changes
    window.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);
  
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

  return (
    <div className="h-[265px] w-full bg-background-level-2 border-t border-t-white/[0.08]" aria-label="Flight timeline">
      {/* Main timeline container */}
      <div className="flex flex-col h-full">
        {/* Top section - tracks */}
        <div className="flex-1 px-4 pt-4 pb-0 overflow-y-auto space-y-2" ref={tracksContainerRef}>
          <MissionPhasesTrack 
            missionPhases={missionPhases} 
            flightDurationSeconds={flightDurationSeconds}
            setHoveredEvent={setHoveredEvent}
          />
          
          <MediaTrack 
            videoSegments={videoSegments} 
            mediaActions={mediaActions} 
            flightDurationSeconds={flightDurationSeconds}
            setHoveredEvent={setHoveredEvent}
            onPositionChange={onPositionChange}
          />
          
          <SystemEventsTrack 
            systemEvents={systemEvents} 
            flightDurationSeconds={flightDurationSeconds}
            setHoveredEvent={setHoveredEvent}
          />
          
          <WarningEventsTrack 
            warningEvents={warningEvents} 
            flightDurationSeconds={flightDurationSeconds}
            setHoveredEvent={setHoveredEvent}
          />
          
          {/* Event hover info display */}
          {hoveredEvent && (
            <div className="absolute bottom-24 left-4 bg-background-level-3/90 backdrop-blur-sm p-2 rounded-md border border-outline-primary text-xs z-50 max-w-xs">
              <p className="text-text-icon-01 font-medium">{hoveredEvent.type}</p>
              <p className="text-text-icon-02">{hoveredEvent.details}</p>
              <p className="text-text-icon-02 text-primary-100">{hoveredEvent.timestamp}</p>
            </div>
          )}
        </div>
        
        {/* Bottom section - slider and controls in a new layout */}
        <div className="px-4 pb-3 relative mt-1">
          {/* Slider that spans full width and aligns with tracks */}
          <div className="w-full">
            <TimelineSlider
              value={[sliderValue]}
              max={100}
              step={0.1}
              onValueChange={handleSliderChange}
              aria-label="Timeline position"
              className="w-full z-30"
              indicatorHeight={tracksHeightRef.current || 140}
            />
          </div>
          
          {/* Controls and timestamps below the slider */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-text-icon-02 w-16">
              {currentPosition.timestamp}
            </div>
            
            <PlaybackControls 
              isPlaying={isPlaying}
              togglePlayback={togglePlayback}
              skipBackward={skipBackward}
              skipForward={skipForward}
            />
            
            <div className="text-xs text-text-icon-02 w-16 text-right">
              {flightDuration}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTimeline;
