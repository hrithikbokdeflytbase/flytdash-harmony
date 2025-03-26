
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Clock, Square, Maximize2, LayoutGrid, Volume2, Volume1, VolumeX, Maximize, ChevronRight, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type CameraType = 'wide' | 'zoom' | 'thermal';

type VideoState = 'loading' | 'error' | 'empty' | 'playing';

type VideoFeedProps = {
  isRecording?: boolean;
  currentTimestamp?: string;
  cameraType?: CameraType;
  hasVideoContent?: boolean;
  videoState?: VideoState;
  recordingDuration?: string;
};

const VideoFeed: React.FC<VideoFeedProps> = ({
  isRecording = false,
  currentTimestamp = '00:00:00',
  cameraType = 'wide',
  hasVideoContent = false,
  videoState = 'empty',
  recordingDuration = '00:00:00',
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
  
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // For demo purposes, simulate video progress
  useEffect(() => {
    if (isPlaying && hasVideoContent) {
      progressTimeoutRef.current = setTimeout(() => {
        setProgress(prev => (prev < 100 ? prev + 0.5 : 0));
      }, 200);
    }
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, [isPlaying, progress, hasVideoContent]);

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-300">
        <h2 className="fb-title1-medium text-text-icon-01">Video Feed</h2>
        <div className="flex items-center text-text-icon-02">
          <Clock className="w-4 h-4 mr-2" />
          <span>{currentTimestamp}</span>
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
            <p className="text-text-icon-02 text-sm mb-400">Current position: {currentTimestamp}</p>
            <Button variant="secondary" size="sm">
              Jump to nearest video
            </Button>
          </div>
        )}

        {videoState === 'playing' && (
          <>
            {/* Video Element */}
            <div className="absolute inset-0 bg-background-level-3">
              <video 
                className="w-full h-full object-cover" 
                src="" /* Will be populated with actual video source */
                muted={isMuted}
                aria-label={`${cameraType} camera video feed`}
              />
              
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
