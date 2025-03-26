
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Clock, Square, Maximize2, LayoutGrid, Volume2, Volume1, VolumeX, Maximize, ChevronRight, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type CameraType = 'wide' | 'zoom' | 'thermal';

type VideoState = 'loading' | 'error' | 'empty' | 'playing';

type VideoSegment = {
  startTime: string; // Format: "HH:MM:SS"
  endTime: string;   // Format: "HH:MM:SS"
  url: string;
};

interface TimelinePosition {
  timestamp: string; // Format: "HH:MM:SS"
  hasVideo: boolean;
}

type VideoFeedProps = {
  isRecording?: boolean;
  currentTimestamp?: string;
  cameraType?: CameraType;
  hasVideoContent?: boolean;
  videoState?: VideoState;
  recordingDuration?: string;
  timelinePosition?: TimelinePosition;
  videoSegments?: VideoSegment[];
  onPositionUpdate?: (position: string) => void;
};

const VideoFeed: React.FC<VideoFeedProps> = ({
  isRecording = false,
  currentTimestamp = '00:00:00',
  cameraType = 'wide',
  hasVideoContent = false,
  videoState = 'empty',
  recordingDuration = '00:00:00',
  timelinePosition,
  videoSegments = [],
  onPositionUpdate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState('05:30:00');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prevCameraType, setPrevCameraType] = useState<CameraType>(cameraType);
  const [showCameraSwitch, setShowCameraSwitch] = useState(false);
  const [activeSegment, setActiveSegment] = useState<VideoSegment | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevTimelinePosition, setPrevTimelinePosition] = useState<string | undefined>(timelinePosition?.timestamp);
  const [positionChanged, setPositionChanged] = useState(false);
  
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // For demo purposes, simulate video progress
  useEffect(() => {
    if (isPlaying && hasVideoContent) {
      progressTimeoutRef.current = setTimeout(() => {
        setProgress(prev => {
          const newProgress = prev < 100 ? prev + 0.5 : 0;
          
          // If we have the onPositionUpdate callback, use it to update the timeline position
          if (onPositionUpdate) {
            const currentTime = progressToTime(newProgress);
            onPositionUpdate(currentTime);
          }
          
          return newProgress;
        });
      }, 200);
    }
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, [isPlaying, progress, hasVideoContent, onPositionUpdate]);

  // Detect camera type changes
  useEffect(() => {
    if (cameraType !== prevCameraType && hasVideoContent) {
      setPrevCameraType(cameraType);
      setShowCameraSwitch(true);
      const timer = setTimeout(() => {
        setShowCameraSwitch(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [cameraType, prevCameraType, hasVideoContent]);

  // Handle timeline position changes
  useEffect(() => {
    if (!timelinePosition) return;
    
    // Check if timeline position has changed
    if (timelinePosition.timestamp !== prevTimelinePosition) {
      setPrevTimelinePosition(timelinePosition.timestamp);
      
      // Show position changed indicator
      setPositionChanged(true);
      setTimeout(() => setPositionChanged(false), 2000);
      
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
            
            // Calculate progress based on position within segment
            const segmentProgress = calculateProgressInSegment(timelinePosition.timestamp, segment);
            setProgress(segmentProgress);
            
            // If video element exists, seek to the correct position
            if (videoRef.current) {
              const segmentDurationInSeconds = timeToSeconds(segment.endTime) - timeToSeconds(segment.startTime);
              const positionInSegment = timeToSeconds(timelinePosition.timestamp) - timeToSeconds(segment.startTime);
              videoRef.current.currentTime = positionInSegment;
            }
            
            // Update video state if needed
            if (videoState !== 'playing') {
              videoState = 'playing';
            }
          }, 500);
        } else {
          // No segment found for this timestamp despite hasVideo being true
          console.warn("No video segment found for timestamp", timelinePosition.timestamp);
        }
      } else {
        // No video at this position
        videoState = 'empty';
        setActiveSegment(null);
      }
    }
  }, [timelinePosition, prevTimelinePosition, videoState, hasVideoContent]);

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

  // Calculate progress percentage within a segment
  const calculateProgressInSegment = (timestamp: string, segment: VideoSegment): number => {
    const timeInSeconds = timeToSeconds(timestamp);
    const startSeconds = timeToSeconds(segment.startTime);
    const endSeconds = timeToSeconds(segment.endTime);
    const segmentDuration = endSeconds - startSeconds;
    const positionInSegment = timeInSeconds - startSeconds;
    
    return (positionInSegment / segmentDuration) * 100;
  };

  // Convert "HH:MM:SS" format to seconds
  const timeToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && videoContainerRef.current) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Retry loading video
  const handleRetry = () => {
    console.log('Attempting to reload video');
    // In a real app, this would trigger the video reload
    // For demo purposes, we'll just simulate the loading state
    videoState = 'loading';
    setTimeout(() => {
      videoState = 'playing';
    }, 2000);
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert progress percentage to time for hover tooltip
  const progressToTime = (percent: number) => {
    // Assuming 5:30:00 duration is 19800 seconds
    const totalSeconds = 19800;
    const currentSeconds = (percent / 100) * totalSeconds;
    const hours = Math.floor(currentSeconds / 3600);
    const minutes = Math.floor((currentSeconds % 3600) / 60);
    const seconds = Math.floor(currentSeconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Camera type badge background color
  const getCameraBadgeColor = (type: CameraType) => {
    switch (type) {
      case 'wide': return 'bg-blue-600/70 border-blue-500';
      case 'zoom': return 'bg-purple-600/70 border-purple-500';
      case 'thermal': return 'bg-orange-600/70 border-orange-500';
      default: return 'bg-blue-600/70 border-blue-500';
    }
  };

  // Camera border color
  const getCameraBorderColor = (type: CameraType) => {
    switch (type) {
      case 'wide': return 'border-blue-500/30';
      case 'zoom': return 'border-purple-500/30';
      case 'thermal': return 'border-orange-500/30';
      default: return 'border-blue-500/30';
    }
  };

  // Camera type icon
  const CameraIcon = () => {
    switch (cameraType) {
      case 'wide': return <Camera className="w-4 h-4 mr-1" />;
      case 'zoom': return <Maximize2 className="w-4 h-4 mr-1" />;
      case 'thermal': return <Square className="w-4 h-4 mr-1" />;
      default: return <Camera className="w-4 h-4 mr-1" />;
    }
  };

  // Volume icon based on volume level and mute state
  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 50) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  // Determine if there are segments available before or after the current one
  const hasPreviousSegment = (): boolean => {
    if (!activeSegment || videoSegments.length <= 1) return false;
    const currentIndex = videoSegments.findIndex(seg => seg === activeSegment);
    return currentIndex > 0;
  };

  const hasNextSegment = (): boolean => {
    if (!activeSegment || videoSegments.length <= 1) return false;
    const currentIndex = videoSegments.findIndex(seg => seg === activeSegment);
    return currentIndex < videoSegments.length - 1;
  };

  // Preload adjacent video segments
  useEffect(() => {
    if (!activeSegment) return;
    
    // In a real implementation, you would create hidden video elements 
    // to preload the next and previous segments
    const preloadNextSegment = () => {
      if (hasNextSegment()) {
        const currentIndex = videoSegments.findIndex(seg => seg === activeSegment);
        const nextSegment = videoSegments[currentIndex + 1];
        
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'video';
        preloadLink.href = nextSegment.url;
        document.head.appendChild(preloadLink);
        
        // Clean up
        return () => {
          document.head.removeChild(preloadLink);
        };
      }
    };
    
    const cleanup = preloadNextSegment();
    return cleanup;
  }, [activeSegment, videoSegments]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-300">
        <h2 className="fb-title1-medium text-text-icon-01">Video Feed</h2>
        <div className="flex items-center text-text-icon-02">
          <Clock className="w-4 h-4 mr-2" />
          <span>{timelinePosition?.timestamp || currentTimestamp}</span>
        </div>
      </div>

      <div 
        ref={videoContainerRef}
        className={cn(
          "relative flex-1 rounded-200 border overflow-hidden",
          getCameraBorderColor(cameraType)
        )}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        aria-label={`Video feed showing ${cameraType} camera view`}
        role="region"
      >
        {videoState === 'loading' && (
          /* Loading state */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-400 bg-background-level-3">
            <Loader2 className="h-[60px] w-[60px] text-primary-200 mb-400 animate-spin" />
            <p className="text-text-icon-01 text-base font-medium mb-200">Loading video...</p>
            <p className="text-text-icon-02 text-sm">Please wait while we prepare your footage</p>
          </div>
        )}

        {videoState === 'error' && (
          /* Error state */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-400 bg-background-level-3">
            <AlertCircle className="h-[60px] w-[60px] text-destructive mb-400" />
            <p className="text-text-icon-01 text-base font-medium mb-200">Video unavailable</p>
            <p className="text-text-icon-02 text-sm mb-400">There was a problem loading this video</p>
            <Button variant="secondary" size="sm" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {videoState === 'empty' && (
          /* Empty state */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-400 bg-background-level-3">
            <LayoutGrid className="h-[60px] w-[60px] text-text-icon-02 mb-400" />
            <p className="text-text-icon-01 text-base font-medium mb-200">No video recorded at this time</p>
            <p className="text-text-icon-02 text-sm mb-400">Current position: {timelinePosition?.timestamp || currentTimestamp}</p>
            <Button variant="secondary" size="sm">
              Jump to nearest video
            </Button>
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
                src={activeSegment?.url || ""} /* Will be populated with actual video source */
                muted={isMuted}
                autoPlay={isPlaying}
                playsInline
                aria-label={`${cameraType} camera video feed`}
              />
              
              {/* Video segment indicators */}
              {videoState === 'playing' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-background-level-4">
                  {videoSegments.map((segment, index) => {
                    // Calculate start and end percentages based on segment times
                    const startTime = timeToSeconds(segment.startTime);
                    const endTime = timeToSeconds(segment.endTime);
                    const totalTime = timeToSeconds('05:30:00'); // Assuming total timeline is 5:30:00
                    
                    const startPercent = (startTime / totalTime) * 100;
                    const endPercent = (endTime / totalTime) * 100;
                    const segmentWidth = endPercent - startPercent;
                    
                    const isActive = activeSegment === segment;
                    
                    return (
                      <div 
                        key={index}
                        className={cn(
                          "absolute h-full",
                          isActive ? "bg-primary-200" : "bg-primary-200/30"
                        )}
                        style={{
                          left: `${startPercent}%`,
                          width: `${segmentWidth}%`
                        }}
                        title={`Video segment ${segment.startTime} - ${segment.endTime}`}
                      />
                    );
                  })}
                </div>
              )}
              
              {/* Timeline position changed indicator */}
              {positionChanged && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded animate-fade-in">
                  Position updated to {timelinePosition?.timestamp}
                </div>
              )}
              
              {/* Semi-transparent overlay when paused */}
              {!isPlaying && hasVideoContent && (
                <div className="absolute inset-0 bg-background-level-1/30 flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="rounded-full w-16 h-16 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setIsPlaying(true)}
                    aria-label="Play video"
                  >
                    <Video className="h-8 w-8" />
                  </Button>
                </div>
              )}
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 flex flex-col">
              {/* Top overlay - Camera badge & recording indicator */}
              <div className="p-300 flex justify-between items-start">
                <Badge 
                  className={cn("flex items-center gap-1 px-2 py-1 border", 
                    getCameraBadgeColor(cameraType)
                  )}
                  aria-label={`Camera type: ${cameraType}`}
                >
                  <CameraIcon />
                  <span className="capitalize">{cameraType}</span>
                </Badge>
                
                {isRecording && (
                  <div className="flex items-center gap-2 bg-background-level-3/70 px-2 py-1 rounded-200">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-400">REC</span>
                    <span className="text-xs text-text-icon-02">{recordingDuration}</span>
                  </div>
                )}
              </div>

              {/* Camera switch indicator */}
              {showCameraSwitch && (
                <div className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 bg-background-level-1/80 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 animate-fade-in text-white">
                  <span>Switching to</span>
                  <Badge 
                    className={cn("flex items-center gap-1 px-2 py-1 border", 
                      getCameraBadgeColor(cameraType)
                    )}
                  >
                    <CameraIcon />
                    <span className="capitalize">{cameraType}</span>
                  </Badge>
                </div>
              )}

              {/* Current position indicator (bottom-right) */}
              <div className="absolute bottom-12 right-4 bg-black/60 text-white text-sm py-1 px-2 rounded">
                {timelinePosition?.timestamp || currentTimestamp}
              </div>

              {/* Bottom overlay - Video progress & controls */}
              <div 
                className={cn(
                  "mt-auto transition-opacity duration-300",
                  showControls ? "opacity-100" : "opacity-0"
                )}
                aria-hidden={!showControls}
              >
                {/* Progress bar */}
                <div className="relative h-[4px] bg-background-level-4 cursor-pointer group">
                  {/* Buffered portion */}
                  <div 
                    className="absolute h-full bg-primary-300/50" 
                    style={{ width: `${Math.min(progress + 15, 100)}%` }}
                  />
                  
                  {/* Played portion */}
                  <div 
                    className="absolute h-full bg-primary-200" 
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                  
                  {/* Draggable indicator */}
                  <div 
                    className="absolute top-1/2 h-[12px] w-[12px] rounded-full bg-white border-2 border-primary-200 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
                    role="slider"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    tabIndex={0}
                  />
                  
                  {/* Hover timestamp tooltip */}
                  <div className="absolute bottom-[16px] bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
                    style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}>
                    {progressToTime(progress)}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-between bg-black/60 backdrop-blur-sm px-300 py-100 h-[40px]">
                  {/* Left controls */}
                  <div className="flex items-center gap-300">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white p-1 h-8 w-8"
                      onClick={() => setIsPlaying(!isPlaying)}
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                    >
                      {isPlaying ? (
                        <Square className="h-5 w-5" />
                      ) : (
                        <Video className="h-5 w-5" />
                      )}
                    </Button>
                    
                    {/* Volume control */}
                    <div className="flex items-center gap-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white p-1 h-8 w-8"
                        onClick={() => setIsMuted(!isMuted)}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        <VolumeIcon />
                      </Button>
                      <div className="w-[60px]">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(values) => {
                            setVolume(values[0]);
                            if (values[0] > 0) setIsMuted(false);
                          }}
                          className="h-[4px]"
                          aria-label="Volume"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Center - timestamp */}
                  <div className="text-white text-xs">
                    {progressToTime(progress)} / {duration}
                  </div>
                  
                  {/* Right controls */}
                  <div className="flex items-center gap-200">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white p-1 h-8"
                      aria-label="Capture frame"
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      <span className="text-xs">Capture</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white p-1 h-8 w-8"
                      onClick={toggleFullscreen}
                      aria-label="Toggle fullscreen"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
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
