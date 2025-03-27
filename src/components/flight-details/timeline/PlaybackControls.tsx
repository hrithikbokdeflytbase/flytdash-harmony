
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, SkipBack, SkipForward, Pause } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  togglePlayback: () => void;
  skipBackward: () => void;
  skipForward: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  togglePlayback,
  skipBackward,
  skipForward
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={skipBackward}
        aria-label="Skip backward 30 seconds"
        className="h-8 w-8"
      >
        <SkipBack className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause playback" : "Start playback"}
        className="h-9 w-9"
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
        className="h-8 w-8"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
};
