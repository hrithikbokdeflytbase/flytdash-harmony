
import React, { useState } from 'react';
import { Camera, ZoomIn, ThermometerSun, Play, Pause, Volume, VolumeX, Camera as CameraIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Camera types
type CameraType = 'wide' | 'zoom' | 'thermal';

// Video segment interface
interface VideoSegment {
  id: string;
  startTime: string;
  endTime: string;
  timestamp: number;
  cameraType: CameraType;
  url: string | null;
}

// Props for the VideoFeed component
interface VideoFeedProps {
  currentTimestamp?: number;
  videoSegments: VideoSegment[];
  className?: string;
}

const VideoFeed: React.FC<VideoFeedProps> = ({
  currentTimestamp = 0,
  videoSegments = [],
  className,
}) => {
  // State for player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Find current video segment based on timestamp
  const currentSegment = videoSegments.find(segment => 
    currentTimestamp >= segment.timestamp && 
    currentTimestamp < (segment.timestamp + 60) // Assuming 60 seconds per segment
  );
  
  // Find nearest video segment if no current segment
  const nearestSegment = !currentSegment ? 
    videoSegments.reduce((nearest, segment) => {
      const currentDiff = Math.abs(segment.timestamp - currentTimestamp);
      const nearestDiff = Math.abs(nearest.timestamp - currentTimestamp);
      return currentDiff < nearestDiff ? segment : nearest;
    }, videoSegments[0]) : 
    null;
  
  // Format timestamp to HH:MM:SS
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  // Handler for jumping to nearest video
  const handleJumpToNearest = () => {
    console.log("Jumping to nearest video at timestamp:", nearestSegment?.timestamp);
    // This would update the timeline position in a real implementation
  };
  
  // Handler for capturing a frame
  const handleCaptureFrame = () => {
    console.log("Capturing current frame");
    // In a real implementation, this would save the current frame as an image
  };
  
  // Get camera type icon and color
  const getCameraTypeDetails = (type: CameraType) => {
    switch(type) {
      case 'wide':
        return { 
          icon: <Camera className="w-5 h-5" />, 
          label: "Wide Angle",
          borderColor: "border-blue-500" 
        };
      case 'zoom':
        return { 
          icon: <ZoomIn className="w-5 h-5" />, 
          label: "Zoom",
          borderColor: "border-purple-500" 
        };
      case 'thermal':
        return { 
          icon: <ThermometerSun className="w-5 h-5" />, 
          label: "Thermal",
          borderColor: "border-orange-500" 
        };
      default:
        return { 
          icon: <Camera className="w-5 h-5" />, 
          label: "Standard",
          borderColor: "border-gray-500" 
        };
    }
  };
  
  // Empty state with no video
  if (!currentSegment) {
    return (
      <div className={cn("bg-background-level-2 rounded-200 p-400 flex flex-col", className)}>
        <h2 className="fb-title1-medium text-text-icon-01 mb-300">Video Feed</h2>
        <div className="flex-1 bg-background-level-3 rounded-200 flex flex-col items-center justify-center p-600">
          <CameraIcon className="w-16 h-16 text-text-icon-02 mb-400" />
          <p className="text-text-icon-01 fb-title2-medium mb-200">No video recorded at this time</p>
          {nearestSegment && (
            <>
              <p className="text-text-icon-02 mb-400">
                Nearest video available at {formatTime(nearestSegment.timestamp)}
              </p>
              <Button 
                onClick={handleJumpToNearest}
                className="flybase-button-primary"
              >
                Jump to nearest video
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Camera type details for the current segment
  const cameraDetails = getCameraTypeDetails(currentSegment.cameraType);
  
  return (
    <div className={cn("bg-background-level-2 rounded-200 p-400 flex flex-col", className)}>
      <h2 className="fb-title1-medium text-text-icon-01 mb-300">Video Feed</h2>
      <div className={cn("relative flex-1 bg-background-level-3 rounded-200 overflow-hidden",
        cameraDetails.borderColor, "border-2")}>
        
        {/* Video element */}
        {currentSegment.url ? (
          <video
            className="w-full h-full object-cover"
            src={currentSegment.url}
            muted={isMuted}
            autoPlay={isPlaying}
            loop
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-text-icon-02">Video feed placeholder</p>
          </div>
        )}
        
        {/* Camera type indicator */}
        <div className="absolute top-400 left-400 bg-background-level-2 bg-opacity-75 rounded-md px-300 py-200 flex items-center gap-200">
          {cameraDetails.icon}
          <span className="text-text-icon-01 fb-body2-medium">{cameraDetails.label}</span>
        </div>
        
        {/* Recording indicator */}
        <div className="absolute top-400 right-400 flex items-center gap-200 bg-background-level-2 bg-opacity-75 rounded-md px-300 py-200">
          <div className="w-300 h-300 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-text-icon-01 fb-body2-medium">REC</span>
        </div>
        
        {/* Timestamp display */}
        <div className="absolute top-1000 right-400 bg-background-level-2 bg-opacity-75 rounded-md px-300 py-200">
          <span className="text-text-icon-01 fb-body2-medium">{formatTime(currentTimestamp)}</span>
        </div>
        
        {/* Video controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-background-level-1 bg-opacity-75 p-300 flex items-center justify-between">
          <div className="flex items-center gap-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume className="w-5 h-5" />}
            </Button>
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCaptureFrame}
            className="text-text-icon-01"
          >
            <CameraIcon className="w-4 h-4 mr-2" />
            Capture Frame
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
