
import React, { useState } from 'react';
import { Settings, Info, PlayCircle, SkipBack, SkipForward, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type VideoSegment = {
  startTime: string; // Format: "HH:MM:SS"
  endTime: string;   // Format: "HH:MM:SS"
  url: string;
};

interface TimelinePosition {
  timestamp: string; // Format: "HH:MM:SS"
  hasVideo: boolean;
}

interface FlightTimelineProps {
  currentPosition: TimelinePosition;
  videoSegments: VideoSegment[];
  flightDuration: string; // Format: "HH:MM:SS"
  onPositionChange: (position: string) => void;
}

const FlightTimeline: React.FC<FlightTimelineProps> = ({
  currentPosition,
  videoSegments = [],
  flightDuration = "05:30:00",
  onPositionChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  
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
      <div className="px-[16px] py-[8px] h-[160px] flex flex-col gap-[8px]">
        {/* Video Segments Track */}
        <div className="h-[64px] bg-background-level-3 rounded-[8px] p-[12px] relative">
          <div className="text-[12px] text-text-icon-02 mb-[8px]">Video Segments</div>
          <div className="h-[4px] bg-background-level-4 rounded-full w-full relative">
            {videoSegments.map((segment, index) => {
              // Calculate segment position and width as percentage
              const startSeconds = timeToSeconds(segment.startTime);
              const endSeconds = timeToSeconds(segment.endTime);
              const startPercent = (startSeconds / flightDurationSeconds) * 100;
              const width = ((endSeconds - startSeconds) / flightDurationSeconds) * 100;
              
              return (
                <div
                  key={index}
                  className="absolute h-full bg-primary-200 rounded-full cursor-pointer"
                  style={{
                    left: `${startPercent}%`,
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
        </div>
        
        {/* Flight Mode Track */}
        <div className="h-[64px] bg-background-level-3 rounded-[8px] p-[12px]">
          <div className="text-[12px] text-text-icon-02 mb-[8px]">Flight Mode</div>
          <div className="h-[24px] bg-background-level-4 rounded-[4px] w-full flex">
            {/* Placeholder for flight modes - would be dynamically generated */}
            <div className="h-full bg-blue-500/30 rounded-l-[4px] w-[30%] flex items-center justify-center">
              <span className="text-[10px] text-blue-300">Autonomous</span>
            </div>
            <div className="h-full bg-purple-500/30 w-[40%] flex items-center justify-center">
              <span className="text-[10px] text-purple-300">Manual</span>
            </div>
            <div className="h-full bg-green-500/30 rounded-r-[4px] w-[30%] flex items-center justify-center">
              <span className="text-[10px] text-green-300">RTL</span>
            </div>
          </div>
        </div>
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
