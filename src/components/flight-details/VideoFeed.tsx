
import React, { useState, useRef, useEffect } from 'react';
import { Video, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VideoSegment, TimelinePosition } from './timeline/timelineTypes';
import CustomButton from '@/components/ui/CustomButton';
import { Progress } from '@/components/ui/progress';

type VideoState = 'loading' | 'error' | 'empty' | 'playing';

type VideoFeedProps = {
  videoState?: VideoState;
  timelinePosition?: TimelinePosition;
  videoSegments?: VideoSegment[];
  onPositionUpdate?: (position: string) => void;
  className?: string;
  isPlaying?: boolean;
  playbackSpeed?: number;
};

const VideoFeed: React.FC<VideoFeedProps> = ({
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Log the current state for debugging
  useEffect(() => {
    console.log("VideoFeed state:", {
      videoState,
      timelinePosition,
      isPlaying,
      playbackSpeed
    });
  }, [videoState, timelinePosition, isPlaying, playbackSpeed]);

  // Handle timeline position changes
  useEffect(() => {
    if (!timelinePosition) return;

    // Check if timeline position has changed
    if (timelinePosition.timestamp !== prevTimelinePosition) {
      setPrevTimelinePosition(timelinePosition.timestamp);
      setVideoError(null);

      // If we have video content at this position
      if (timelinePosition.hasVideo) {
        // Find the appropriate video segment
        const segment = findVideoSegmentForTimestamp(timelinePosition.timestamp);
        if (segment) {
          // Start transition effect
          setIsTransitioning(true);
          setLoadingProgress(0);
          
          // Simulate progress for better UX
          startLoadingProgressSimulation();

          // Set the active segment after a short delay to simulate loading
          setTimeout(() => {
            setActiveSegment(segment);
            
            // If video element exists, seek to the correct position
            if (videoRef.current) {
              // Reset error state
              setVideoError(null);
              
              // Configure video element
              const segmentStart = timeToSeconds(segment.startTime);
              const positionInSeconds = timeToSeconds(timelinePosition.timestamp);
              const seekTime = positionInSeconds - segmentStart;
              
              // Register event listeners for better error handling
              const handleVideoError = () => {
                console.error("Video playback error");
                setVideoError("Failed to load video. Please try again.");
                stopLoadingProgressSimulation();
                setIsTransitioning(false);
              };
              
              const handleCanPlay = () => {
                stopLoadingProgressSimulation();
                setLoadingProgress(100);
                setIsTransitioning(false);
                setIsBuffering(false);
                
                // Play or pause based on isPlaying prop
                if (isPlaying) {
                  videoRef.current?.play().catch(err => {
                    console.error("Could not play video:", err);
                    setVideoError("Could not play video. Please try again.");
                  });
                }
              };
              
              const handleWaiting = () => {
                setIsBuffering(true);
              };
              
              const handlePlaying = () => {
                setIsBuffering(false);
              };
              
              // Clean up previous listeners
              videoRef.current.removeEventListener('error', handleVideoError);
              videoRef.current.removeEventListener('canplay', handleCanPlay);
              videoRef.current.removeEventListener('waiting', handleWaiting);
              videoRef.current.removeEventListener('playing', handlePlaying);
              
              // Add new listeners
              videoRef.current.addEventListener('error', handleVideoError);
              videoRef.current.addEventListener('canplay', handleCanPlay);
              videoRef.current.addEventListener('waiting', handleWaiting);
              videoRef.current.addEventListener('playing', handlePlaying);
              
              // Set video properties
              videoRef.current.currentTime = Math.max(0, seekTime);
              videoRef.current.playbackRate = playbackSpeed;
              
              // Force load the video
              videoRef.current.load();
            }
          }, 500);
        } else {
          // No segment found for this timestamp despite hasVideo being true
          console.warn("No video segment found for timestamp", timelinePosition.timestamp);
          setActiveSegment(null);
          setIsTransitioning(false);
          stopLoadingProgressSimulation();
        }
      } else {
        // No video at this position
        setActiveSegment(null);
        setIsTransitioning(false);
        stopLoadingProgressSimulation();
      }
    }
  }, [timelinePosition, prevTimelinePosition, videoSegments]);

  // Sync video playback with isPlaying prop
  useEffect(() => {
    if (!videoRef.current || !activeSegment) return;
    
    if (isPlaying) {
      // Only attempt to play if not in an error state
      if (!videoError) {
        videoRef.current.play().catch(err => {
          console.error("Could not play video:", err);
          setVideoError("Could not play video. Please try again.");
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, activeSegment, videoError]);

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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopLoadingProgressSimulation();
      // Remove any video event listeners
      if (videoRef.current) {
        videoRef.current.oncanplay = null;
        videoRef.current.onerror = null;
        videoRef.current.onwaiting = null;
        videoRef.current.onplaying = null;
      }
    };
  }, []);

  // Simulate loading progress for better UX
  const startLoadingProgressSimulation = () => {
    stopLoadingProgressSimulation();
    
    setLoadingProgress(0);
    const interval = window.setInterval(() => {
      setLoadingProgress(prev => {
        // Gradually increase up to 90%, the last 10% will come when the video is ready
        if (prev >= 90) {
          stopLoadingProgressSimulation();
          return 90;
        }
        const increment = Math.random() * 5 + 3; // Random increment between 3 and 8
        return Math.min(90, prev + increment);
      });
    }, 300);
    
    progressIntervalRef.current = interval;
  };
  
  const stopLoadingProgressSimulation = () => {
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

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

  // Handle retry for video errors
  const handleVideoRetry = () => {
    if (!videoRef.current || !activeSegment || !timelinePosition) return;
    
    setVideoError(null);
    setIsTransitioning(true);
    startLoadingProgressSimulation();
    
    // Force reload the video
    videoRef.current.load();
    
    // Set the current time and playback rate
    const segmentStart = timeToSeconds(activeSegment.startTime);
    const positionInSeconds = timeToSeconds(timelinePosition.timestamp);
    const seekTime = positionInSeconds - segmentStart;
    videoRef.current.currentTime = Math.max(0, seekTime);
    videoRef.current.playbackRate = playbackSpeed;
    
    // Try to play if needed
    if (isPlaying) {
      videoRef.current.play().catch(err => {
        console.error("Could not play video on retry:", err);
        setVideoError("Still unable to play video. Please try again later.");
        setIsTransitioning(false);
        stopLoadingProgressSimulation();
      });
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
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find nearest available video segment
  const findNearestVideoSegment = (timestamp: string): {
    direction: 'before' | 'after';
    segment: VideoSegment;
  } | null => {
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
      return {
        direction: 'before',
        segment: nearestBefore
      };
    } else if (nearestAfter) {
      return {
        direction: 'after',
        segment: nearestAfter
      };
    }
    return null;
  };
  
  // Find and jump to the nearest video segment
  const handleFindNearestVideo = () => {
    if (!timelinePosition || !onPositionUpdate) return;
    
    const nearest = findNearestVideoSegment(timelinePosition.timestamp);
    if (nearest) {
      // Jump to the start of the nearest segment
      const timestamp = nearest.direction === 'before' ? 
        nearest.segment.endTime : nearest.segment.startTime;
      
      onPositionUpdate(timestamp);
    }
  };

  // Render the actual video component or placeholders based on state
  return (
    <div className={cn("relative w-full h-full flex items-center justify-center bg-background-level-3 rounded-md overflow-hidden", className)}>
      {videoState === 'loading' && (
        <div className="flex flex-col items-center justify-center text-text-icon-02">
          <Loader2 className="w-12 h-12 animate-spin mb-2" />
          <p>Loading video...</p>
          
          {/* Loading progress bar */}
          <div className="w-48 mt-4">
            <Progress value={loadingProgress} className="h-1.5" />
          </div>
        </div>
      )}
      
      {videoState === 'error' && (
        <div className="flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="w-12 h-12 mb-2" />
          <p>Failed to load video</p>
          <CustomButton variant="outline" size="sm" className="mt-4" onClick={handleVideoRetry}>
            Try Again
          </CustomButton>
        </div>
      )}
      
      {videoState === 'empty' && (
        <div className="flex flex-col items-center justify-center text-text-icon-02">
          <Video className="w-12 h-12 mb-2" />
          <p>No video available at this position</p>
          {timelinePosition?.hasVideo === false && (
            <div className="mt-4 flex flex-col items-center">
              <p className="text-sm text-text-icon-03 mb-2">Jump to nearest video:</p>
              <div className="flex gap-2">
                <CustomButton 
                  variant="outline" 
                  size="sm" 
                  disabled={!findNearestVideoSegment(timelinePosition?.timestamp || '00:00:00')}
                  onClick={handleFindNearestVideo}
                >
                  Find Video
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeSegment && (videoState === 'playing' || videoState === 'empty') && (
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}>
          {/* Loading overlay */}
          {isTransitioning && (
            <div className="absolute inset-0 z-20 bg-background-level-3/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin mb-3 text-primary-200" />
                <p className="text-text-icon-02 mb-2">Loading video...</p>
                <div className="w-48 mt-2">
                  <Progress value={loadingProgress} className="h-1.5" />
                </div>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {videoError && (
            <div className="absolute inset-0 z-20 bg-background-level-3/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center text-destructive">
                <AlertCircle className="w-10 h-10 mb-3" />
                <p className="text-center mb-4 max-w-xs">{videoError}</p>
                <CustomButton variant="outline" size="sm" onClick={handleVideoRetry}>
                  Try Again
                </CustomButton>
              </div>
            </div>
          )}
          
          {/* Buffering indicator */}
          {isBuffering && !videoError && !isTransitioning && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="flex flex-col items-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Buffering...</p>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={activeSegment.url}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            controls={false}
            crossOrigin="anonymous" // For handling CORS issues with external media
          />
          
          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            {videoState === 'playing' && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm px-2 py-1">
                <Video className="w-4 h-4 mr-1" />
                {playbackSpeed !== 1 ? `${playbackSpeed}x` : ''}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
