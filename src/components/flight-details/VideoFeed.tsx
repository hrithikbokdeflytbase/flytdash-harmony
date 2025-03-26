
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Maximize2, Square, Loader2, Plane, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CameraType = 'wide' | 'zoom' | 'thermal';
type VideoState = 'loading' | 'error' | 'empty' | 'playing';

type VideoSegment = {
  startTime: string; // Format: "HH:MM:SS"
  endTime: string; // Format: "HH:MM:SS"
  url: string;
};

interface TimelinePosition {
  timestamp: string; // Format: "HH:MM:SS"
  hasVideo: boolean;
}

type VideoFeedProps = {
  cameraType?: CameraType;
  videoState?: VideoState;
  timelinePosition?: TimelinePosition;
  videoSegments?: VideoSegment[];
  onPositionUpdate?: (position: string) => void;
  onJumpToNearestVideo?: () => void;
};

const VideoFeed: React.FC<VideoFeedProps> = ({
  cameraType = 'wide',
  videoState = 'empty',
  timelinePosition,
  videoSegments = [],
  onPositionUpdate,
  onJumpToNearestVideo
}) => {
  const [activeSegment, setActiveSegment] = useState<VideoSegment | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevTimelinePosition, setPrevTimelinePosition] = useState<string | undefined>(timelinePosition?.timestamp);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle timeline position changes
  useEffect(() => {
    if (!timelinePosition) return;

    // Check if timeline position has changed
    if (timelinePosition.timestamp !== prevTimelinePosition) {
      setPrevTimelinePosition(timelinePosition.timestamp);

      // If we have video content at this position
      if (timelinePosition.hasVideo) {
        // Find the appropriate video segment
        const segment = findVideoSegmentForTimestamp(timelinePosition.timestamp);
        if (segment) {
          // Start transition effect
          setIsTransitioning(true);

          // Set the active segment after a short delay to simulate loading
          setTimeout(() => {
            setActiveSegment(segment);
            setIsTransitioning(false);

            // If video element exists, seek to the correct position
            if (videoRef.current) {
              const segmentDurationInSeconds = timeToSeconds(segment.endTime) - timeToSeconds(segment.startTime);
              const positionInSegment = timeToSeconds(timelinePosition.timestamp) - timeToSeconds(segment.startTime);
              videoRef.current.currentTime = positionInSegment;
            }
          }, 500);
          
          // Set recording state - simulating active recording for demo purposes
          setIsRecording(true);
        } else {
          // No segment found for this timestamp despite hasVideo being true
          console.warn("No video segment found for timestamp", timelinePosition.timestamp);
        }
      } else {
        // No video at this position
        setActiveSegment(null);
        setIsRecording(false);
      }
    }
  }, [timelinePosition, prevTimelinePosition]);

  // Find the appropriate video segment for a given timestamp
  const findVideoSegmentForTimestamp = (timestamp: string): VideoSegment | null => {
    // Convert timestamp to seconds for easier comparison
    const timeInSeconds = timeToSeconds(timestamp);

    // Find a segment that contains this timestamp
    const segment = videoSegments.find(seg => {
      const startSeconds = timeToSeconds(seg.startTime);
      const endSeconds = timeToSeconds(seg.endTime);
      return timeInSeconds >= startSeconds && timeInSeconds <= endSeconds;
    });
    return segment || null;
  };

  // Convert "HH:MM:SS" format to seconds
  const timeToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Find nearest video segment to current timestamp
  const findNearestVideoSegment = (): VideoSegment | null => {
    if (!timelinePosition || videoSegments.length === 0) return null;
    
    const currentTime = timeToSeconds(timelinePosition.timestamp);
    
    // Map segments to their distance from current time
    const segmentsWithDistance = videoSegments.map(segment => {
      const startTime = timeToSeconds(segment.startTime);
      const endTime = timeToSeconds(segment.endTime);
      
      // If current time is within segment, distance is 0
      if (currentTime >= startTime && currentTime <= endTime) {
        return { segment, distance: 0 };
      }
      
      // Distance to start or end, whichever is closer
      const distanceToStart = Math.abs(currentTime - startTime);
      const distanceToEnd = Math.abs(currentTime - endTime);
      return { 
        segment, 
        distance: Math.min(distanceToStart, distanceToEnd)
      };
    });
    
    // Sort by distance and get the closest
    segmentsWithDistance.sort((a, b) => a.distance - b.distance);
    return segmentsWithDistance[0]?.segment || null;
  };

  // Handle jump to nearest video
  const handleJumpToNearest = () => {
    const nearestSegment = findNearestVideoSegment();
    if (nearestSegment && onPositionUpdate) {
      onPositionUpdate(nearestSegment.startTime);
    }
    if (onJumpToNearestVideo) {
      onJumpToNearestVideo();
    }
  };

  // Camera type badge background color
  const getCameraBadgeColor = (type: CameraType) => {
    switch (type) {
      case 'wide':
        return 'bg-blue-600/70 border-blue-500';
      case 'zoom':
        return 'bg-purple-600/70 border-purple-500';
      case 'thermal':
        return 'bg-orange-600/70 border-orange-500';
      default:
        return 'bg-blue-600/70 border-blue-500';
    }
  };

  // Camera icon
  const CameraIcon = () => {
    switch (cameraType) {
      case 'wide':
        return <Camera className="w-4 h-4 mr-1" />;
      case 'zoom':
        return <Maximize2 className="w-4 h-4 mr-1" />;
      case 'thermal':
        return <Square className="w-4 h-4 mr-1" />;
      default:
        return <Camera className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with "Video Feed" title */}
      <div className="flex items-center justify-between mb-200 px-300">
        <h3 className="text-text-icon-01 text-sm font-medium">Video Feed</h3>
        {isRecording && videoState === 'playing' && (
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-error-200 mr-2 animate-pulse"></div>
            <span className="text-text-icon-01 text-xs">Recording</span>
          </div>
        )}
      </div>

      {/* Video container */}
      <div 
        className="relative flex-1 rounded-200 border border-outline-primary overflow-hidden bg-background-level-2"
        aria-label={`Video feed showing ${cameraType} camera view`}
        role="region"
      >
        {videoState === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-400 bg-background-level-2">
            <Loader2 className="h-[60px] w-[60px] text-primary-200 mb-400 animate-spin" />
            <p className="text-text-icon-01 text-base font-medium mb-200">Loading video...</p>
          </div>
        )}

        {videoState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-400 bg-background-level-2">
            <p className="text-text-icon-01 text-base font-medium mb-200">Video unavailable</p>
            <p className="text-text-icon-02 text-sm mb-400">There was a problem loading this video</p>
          </div>
        )}

        {videoState === 'empty' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-400 bg-background-level-2">
            <Plane className="h-[60px] w-[60px] text-text-icon-02 mb-400" />
            <p className="text-text-icon-01 text-base font-medium mb-200">No video recorded at this time</p>
            {timelinePosition && (
              <p className="text-text-icon-02 text-sm mb-400">Current position: {timelinePosition.timestamp}</p>
            )}
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex items-center" 
              onClick={handleJumpToNearest}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Jump to nearest video
            </Button>
          </div>
        )}

        {videoState === 'playing' && (
          <>
            {/* Video Element */}
            <div className="absolute inset-0 bg-background-level-2">
              {/* Actual video element */}
              <video 
                ref={videoRef} 
                className={cn(
                  "w-full h-full object-cover", 
                  isTransitioning && "opacity-0 transition-opacity duration-500", 
                  !isTransitioning && "opacity-100 transition-opacity duration-500"
                )} 
                src={activeSegment?.url || ""} 
                muted={true} 
                autoPlay={true} 
                playsInline 
                aria-label={`${cameraType} camera video feed`} 
              />
            </div>

            {/* Video overlays */}
            <div className="absolute inset-0 flex flex-col">
              {/* Top overlay - Camera badge and timestamp */}
              <div className="p-300 flex justify-between items-start">
                <Badge 
                  className={cn("flex items-center gap-1 px-2 py-1 border", getCameraBadgeColor(cameraType))} 
                  aria-label={`Camera type: ${cameraType}`}
                >
                  <CameraIcon />
                  <span className="capitalize">{cameraType}</span>
                </Badge>

                <div className="bg-background-level-3 bg-opacity-75 px-3 py-1 rounded-md">
                  <span className="text-text-icon-01 text-xs">
                    {timelinePosition?.timestamp || "00:00:00"}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
