
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Maximize2, Square, Loader2, Video as VideoIcon, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CameraType, VideoState, VideoSegment, TimelinePosition } from './timeline/timelineTypes';

type VideoFeedProps = {
  cameraType?: CameraType;
  videoState?: VideoState;
  timelinePosition?: TimelinePosition;
  videoSegments?: VideoSegment[];
  onPositionUpdate?: (position: string) => void;
};

const VideoFeed: React.FC<VideoFeedProps> = ({
  cameraType = 'wide',
  videoState = 'empty',
  timelinePosition,
  videoSegments = [],
  onPositionUpdate
}) => {
  const [activeSegment, setActiveSegment] = useState<VideoSegment | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevTimelinePosition, setPrevTimelinePosition] = useState<string | undefined>(timelinePosition?.timestamp);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sample video URLs for demonstration
  const sampleVideoUrls = {
    wide: 'https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-city-seen-from-above-34673-large.mp4',
    zoom: 'https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-farm-fields-seen-from-above-32499-large.mp4',
    thermal: 'https://assets.mixkit.co/videos/preview/mixkit-desert-area-seen-from-the-air-32514-large.mp4'
  };

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
              videoRef.current.play().catch(err => console.error('Error playing video:', err));
            }
          }, 500);
        } else {
          // No segment found for this timestamp despite hasVideo being true
          console.warn("No video segment found for timestamp", timelinePosition.timestamp);
        }
      } else {
        // No video at this position
        setActiveSegment(null);
      }
    }
  }, [timelinePosition, prevTimelinePosition, videoSegments]);

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
    
    // If we found a matching segment, return it
    if (segment) return segment;
    
    // For demo purposes, create a sample segment for any timestamp
    return {
      startTime: "00:00:00",
      endTime: "00:10:00",
      url: sampleVideoUrls[cameraType]
    };
  };

  // Convert "HH:MM:SS" format to seconds
  const timeToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
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

  // Camera border color
  const getCameraBorderColor = (type: CameraType) => {
    switch (type) {
      case 'wide':
        return 'border-blue-500/30';
      case 'zoom':
        return 'border-purple-500/30';
      case 'thermal':
        return 'border-orange-500/30';
      default:
        return 'border-blue-500/30';
    }
  };

  // Camera type icon
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
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="bg-background-level-3/70 px-2 py-1 text-xs">
          <VideoIcon className="w-3 h-3 mr-1" /> 
          Video Feed
        </Badge>
      </div>

      <div 
        className={cn(
          "relative flex-1 rounded-md border overflow-hidden", 
          getCameraBorderColor(cameraType)
        )} 
        aria-label={`Video feed showing ${cameraType} camera view`} 
        role="region" 
        style={{ maxHeight: 'calc(100% - 20px)' }}
      >
        {videoState === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-background-level-3">
            <Loader2 className="h-[60px] w-[60px] text-primary-200 mb-4 animate-spin" />
            <p className="text-text-icon-01 text-base font-medium mb-2">Loading video...</p>
          </div>
        )}

        {videoState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-background-level-3">
            <p className="text-text-icon-01 text-base font-medium mb-2">Video unavailable</p>
            <p className="text-text-icon-02 text-sm mb-4">There was a problem loading this video</p>
          </div>
        )}

        {videoState === 'empty' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-background-level-3">
            <PlayCircle className="h-[60px] w-[60px] text-text-icon-02 mb-4" />
            <p className="text-text-icon-01 text-base font-medium mb-2">No video available at current position</p>
          </div>
        )}

        {videoState === 'playing' && (
          <>
            {/* Video Element */}
            <div className="absolute inset-0 bg-background-level-3">
              {/* Actual video element */}
              <video 
                ref={videoRef} 
                className={cn(
                  "w-full h-full object-cover", 
                  isTransitioning && "opacity-0 transition-opacity duration-500", 
                  !isTransitioning && "opacity-100 transition-opacity duration-500"
                )} 
                src={activeSegment?.url || sampleVideoUrls[cameraType]} 
                muted={true} 
                autoPlay={true} 
                playsInline 
                loop
                aria-label={`${cameraType} camera video feed`} 
              />
            </div>

            {/* Top overlay - Camera badge only */}
            <div className="absolute inset-0 flex flex-col">
              <div className="p-3 flex justify-between items-start">
                <Badge 
                  className={cn("flex items-center gap-1 px-2 py-1 border", getCameraBadgeColor(cameraType))} 
                  aria-label={`Camera type: ${cameraType}`}
                >
                  <CameraIcon />
                  <span className="capitalize">{cameraType}</span>
                </Badge>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
