
import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface PlaybackControlsProps {
  isPlaying: boolean;
  togglePlayback: () => void;
  skipBackward: () => void;
  skipForward: () => void;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  togglePlayback,
  skipBackward,
  skipForward,
  playbackSpeed = 1,
  onSpeedChange
}) => {
  const speedOptions = [0.5, 1, 1.5, 2];

  return (
    <div className="flex items-center space-x-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-background-level-3 hover:bg-background-level-4" 
        onClick={skipBackward}
        aria-label="Skip backward"
      >
        <SkipBack className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 rounded-full bg-background-level-3 hover:bg-background-level-4" 
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-background-level-3 hover:bg-background-level-4" 
        onClick={skipForward}
        aria-label="Skip forward"
      >
        <SkipForward className="h-4 w-4" />
      </Button>

      {onSpeedChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-7 text-xs ml-1 px-2 rounded-full bg-background-level-3 hover:bg-background-level-4",
                playbackSpeed !== 1 && "text-primary-100"
              )}
            >
              {playbackSpeed}x
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-16">
            {speedOptions.map(speed => (
              <DropdownMenuItem
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={cn(
                  "text-center justify-center",
                  playbackSpeed === speed && "bg-primary-100/10 text-primary-100"
                )}
              >
                {speed}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
