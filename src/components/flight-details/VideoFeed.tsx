
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Maximize2, Square, Loader2, AlertCircle, Video, Thermometer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VideoSegment, TimelinePosition } from './timeline/timelineTypes';

type CameraType = 'wide' | 'zoom' | 'thermal' | 'ogi';
type VideoState = 'loading' | 'error' | 'empty' | 'playing';

type VideoFeedProps = {
  cameraType?: CameraType;
  videoState?: VideoState;
  timelinePosition?: TimelinePosition;
  videoSegments?: VideoSegment[];
  onPositionUpdate?: (position: string) => void;
  className?: string;
  isPlaying?: boolean;
  playbackSpeed?: number;
};

const VideoFeed: React.FC<VideoFeedProps> = ({
  cameraType = 'wide',
  videoState = 'empty',
  timelinePosition,
  videoSegments = [],
  onPositionUpdate,
  className,
  isPlaying = false,
  playbackSpeed = 1
}) => {
  const [activeSegment, setActiveSegment] = useState<VideoSegment | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevTimelinePosition, setPrevTimelinePosition] = useState<string | undefined>(timelinePosition?.timestamp);
  const [prevCameraType, setPrevCameraType] = useState<CameraType>(cameraType);
  const [cameraTransitioning, setCameraTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Log the current state for debugging
  useEffect(() => {
    console.log("VideoFeed state:", { videoState, cameraType, timelinePosition, isPlaying, playbackSpeed });
  }, [videoState, cameraType, timelinePosition, isPlaying, playbackSpeed]);

  // Handle camera type changes
  useEffect(() => {
    if (cameraType !== prevCameraType) {
      setCameraTransitioning(true);
      
      // After a brief delay, update the camera type
      setTimeout(() => {
        setPrevCameraType(cameraType);
        setCameraTransitioning(false);
      }, 400);
    }
  }, [cameraType, prevCameraType]);

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
              const segmentStart = timeToSeconds(segment.startTime);
              const positionInSeconds = timeToSeconds(timelinePosition.timestamp);
              const seekTime = positionInSeconds - segmentStart;
              
              videoRef.current.currentTime = Math.max(0, seekTime);
              
              // Play or pause based on isPlaying prop
              if (isPlaying) {
                videoRef.current.play().catch(err => {
                  console.error("Could not play video:", err);
                });
              } else {
                videoRef.current.pause();
              }
              
              // Set playback rate based on the playbackSpeed prop
              videoRef.current.playbackRate = playbackSpeed;
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

  // Sync video playback with isPlaying prop
  useEffect(() => {
    if (!videoRef.current || !activeSegment) return;
    
    if (isPlaying) {
      videoRef.current.play().catch(err => {
        console.error("Could not play video:", err);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, activeSegment]);
  
  // Sync video playback speed with playbackSpeed prop
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Sync current video time with timelinePosition when playing
  useEffect(() => {
    if (!videoRef.current || !activeSegment || !timelinePosition || !isPlaying) return;
    
    const updateVideoPosition = () => {
      if (!videoRef.current || !activeSegment) return;
      
      // Get current video time and convert to timeline time
      const videoTime = videoRef.current.currentTime;
      const segmentStart = timeToSeconds(activeSegment.startTime);
      const timelineTime = secondsToTime(segmentStart + videoTime);
      
      // Only update if the time has changed significantly (to avoid loops)
      if (Math.abs(timeToSeconds(timelinePosition.timestamp) - timeToSeconds(timelineTime)) > 1) {
        if (onPositionUpdate) {
          onPositionUpdate(timelineTime);
        }
      }
    };
    
    // Update every 250ms during playback
    const interval = setInterval(updateVideoPosition, 250);
    
    return () => clearInterval(interval);
  }, [videoRef.current, activeSegment, timelinePosition, isPlaying, onPositionUpdate]);

  // Event listener for video time updates
  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeSegment || !onPositionUpdate || isPlaying) return;
    
    // When manually seeking in the video, update the timeline position
    const videoTime = videoRef.current.currentTime;
    const segmentStart = timeToSeconds(activeSegment.startTime);
    const timelineTime = secondsToTime(segmentStart + videoTime);
    
    // Only update if not playing (playing is handled by the effect above)
    if (!isPlaying) {
      onPositionUpdate(timelineTime);
    }
  };

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

  // Convert seconds to "HH:MM:SS" format
  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find nearest available video segment
  const findNearestVideoSegment = (timestamp: string): { direction: 'before' | 'after', segment: VideoSegment } | null => {
    if (!videoSegments.length) return null;
    
    const timeInSeconds = timeToSeconds(timestamp);
    
    let nearestBefore: VideoSegment | null = null;
    let nearestAfter: VideoSegment | null = null;
    let beforeDistance = Infinity;
    let afterDistance = Infinity;
    
    for (const segment of videoSegments) {
      const endSeconds = timeToSeconds(segment.endTime);
      const startSeconds = timeToSeconds(segment.startTime);
      
      // Check if segment is before current time
      if (endSeconds < timeInSeconds) {
        const distance = timeInSeconds - endSeconds;
        if (distance < beforeDistance) {
          beforeDistance = distance;
          nearestBefore = segment;
        }
      }
      
      // Check if segment is after current time
      if (startSeconds > timeInSeconds) {
        const distance = startSeconds - timeInSeconds;
        if (distance < afterDistance) {
          afterDistance = distance;
          nearestAfter = segment;
        }
      }
    }
    
    // Return the closest segment
    if (beforeDistance <= afterDistance && nearestBefore) {
      return { direction: 'before', segment: nearestBefore };
    } else if (nearestAfter) {
      return { direction: 'after', segment: nearestAfter };
    }
    
    return null;
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
      case 'ogi':
        return 'bg-green-600/70 border-green-500';
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
      case 'ogi':
        return 'border-green-500/30';
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
        return <Thermometer className="w-4 h-4 mr-1" />;
      case 'ogi':
        return <Square className="w-4 h-4 mr-1" />;
      default:
        return <Camera className="w-4 h-4 mr-1" />;
    }
  };

  // Get nearest video information for empty state
  const nearestVideo = timelinePosition ? findNearestVideoSegment(timelinePosition.timestamp) : null;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <Badge 
          className={cn(
            "flex items-center gap-1 px-2 py-1 border transition-colors duration-300", 
            getCameraBadgeColor(cameraType),
            cameraTransitioning && "opacity-0"
          )} 
          aria-label={`Camera type: ${cameraType}`}
        >
          <CameraIcon />
          <span className="capitalize">{cameraType}</span>
        </Badge>
      </div>

      <div className={cn(
        "relative flex-1 rounded-lg border overflow-hidden", 
        getCameraBorderColor(cameraType)
      )} 
        aria-label={`Video feed showing ${cameraType} camera view`} 
        role="region"
      >
        {videoState === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gray-900">
            <Loader2 className="h-[60px] w-[60px] text-blue-400 mb-4 animate-spin" />
            <p className="text-white text-base font-medium mb-2">Loading video...</p>
            <p className="text-gray-400 text-sm">Please wait while the video loads</p>
          </div>
        )}

        {videoState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gray-900">
            <AlertCircle className="h-[60px] w-[60px] text-red-400 mb-4" />
            <p className="text-white text-base font-medium mb-2">Video unavailable</p>
            <p className="text-gray-400 text-sm mb-4">There was a problem loading this video</p>
          </div>
        )}

        {videoState === 'empty' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gray-900">
            <Video className="h-[60px] w-[60px] text-gray-400 mb-4" />
            <p className="text-white text-base font-medium mb-2">No video available at current position</p>
            <p className="text-gray-400 text-sm">Try a different position on the timeline</p>
            
            {nearestVideo && (
              <div className="mt-4 text-gray-400 text-sm">
                <p>Nearest video: {nearestVideo.direction === 'before' ? 'Before' : 'After'} current position</p>
                <p className="mt-1">
                  {nearestVideo.direction === 'before' 
                    ? `Ends at ${nearestVideo.segment.endTime}` 
                    : `Starts at ${nearestVideo.segment.startTime}`}
                </p>
              </div>
            )}
          </div>
        )}

        {videoState === 'playing' && (
          <>
            {/* Video Element */}
            <div className="absolute inset-0 bg-gray-900">
              {/* Actual video element */}
              <video 
                ref={videoRef} 
                className={cn(
                  "w-full h-full object-cover", 
                  isTransitioning && "opacity-0 transition-opacity duration-500", 
                  !isTransitioning && "opacity-100 transition-opacity duration-500"
                )} 
                src={activeSegment?.url || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} 
                muted={true} 
                autoPlay={false}
                playsInline 
                controls={false}
                onTimeUpdate={handleTimeUpdate}
                aria-label={`${cameraType} camera video feed`} 
              />
            </div>

            {/* Overlay elements */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              {/* Top overlay with camera selection */}
              <div className="p-3 flex justify-between items-start">
                <div className="flex space-x-2 pointer-events-auto">
                  <Badge 
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 border transition-colors duration-300",
                      cameraType === 'wide' ? 'bg-blue-600/70 border-blue-500' : 'bg-gray-800/70 border-gray-700',
                      cameraTransitioning && "opacity-0"
                    )}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    <span>Wide</span>
                  </Badge>

                  <Badge 
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 border transition-colors duration-300",
                      cameraType === 'zoom' ? 'bg-purple-600/70 border-purple-500' : 'bg-gray-800/70 border-gray-700',
                      cameraTransitioning && "opacity-0"
                    )}
                  >
                    <Maximize2 className="w-4 h-4 mr-1" />
                    <span>Zoom</span>
                  </Badge>

                  <Badge 
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 border transition-colors duration-300",
                      cameraType === 'thermal' ? 'bg-orange-600/70 border-orange-500' : 'bg-gray-800/70 border-gray-700',
                      cameraTransitioning && "opacity-0"
                    )}
                  >
                    <Thermometer className="w-4 h-4 mr-1" />
                    <span>Thermal</span>
                  </Badge>

                  <Badge 
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 border transition-colors duration-300",
                      cameraType === 'ogi' ? 'bg-green-600/70 border-green-500' : 'bg-gray-800/70 border-gray-700',
                      cameraTransitioning && "opacity-0"
                    )}
                  >
                    <Square className="w-4 h-4 mr-1" />
                    <span>OGI</span>
                  </Badge>
                </div>
              </div>
              
              {/* Camera transition effect */}
              {cameraTransitioning && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-white font-medium text-lg">Switching to {cameraType}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
