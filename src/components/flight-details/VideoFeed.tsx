
import React, { useState } from 'react';
import { Camera, Video, Clock, Square, Maximize2, LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CameraType = 'wide' | 'zoom' | 'thermal';

type VideoFeedProps = {
  isRecording?: boolean;
  currentTimestamp?: string;
  cameraType?: CameraType;
  hasVideoContent?: boolean;
};

const VideoFeed: React.FC<VideoFeedProps> = ({
  isRecording = false,
  currentTimestamp = '00:00:00',
  cameraType = 'wide',
  hasVideoContent = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Camera type badge background color
  const getCameraBadgeColor = (type: CameraType) => {
    switch (type) {
      case 'wide': return 'bg-blue-600/70';
      case 'zoom': return 'bg-purple-600/70';
      case 'thermal': return 'bg-orange-600/70';
      default: return 'bg-blue-600/70';
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-300">
        <h2 className="fb-title1-medium text-text-icon-01">Video Feed</h2>
        <div className="flex items-center text-text-icon-02">
          <Clock className="w-4 h-4 mr-2" />
          <span>{currentTimestamp}</span>
        </div>
      </div>

      <div className="relative flex-1 rounded-200 border border-[rgba(255,255,255,0.08)] overflow-hidden">
        {hasVideoContent ? (
          <>
            {/* Video Element */}
            <div className="absolute inset-0 bg-background-level-3">
              <video 
                className="w-full h-full object-cover" 
                src="" /* Will be populated with actual video source */
              />
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 flex flex-col">
              {/* Top overlay - Camera badge & recording indicator */}
              <div className="p-300 flex justify-between items-start">
                <Badge 
                  className={cn("flex items-center gap-1 px-2 py-1", 
                    getCameraBadgeColor(cameraType)
                  )}
                >
                  <CameraIcon />
                  <span className="capitalize">{cameraType}</span>
                </Badge>
                
                {isRecording && (
                  <div className="flex items-center gap-2 bg-background-level-3/70 px-2 py-1 rounded-200">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-400">REC</span>
                  </div>
                )}
              </div>

              {/* Bottom overlay - Video controls */}
              <div className="mt-auto p-300 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white p-1 h-8 w-8"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Square className="h-5 w-5" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="h-8">
                      <Camera className="h-4 w-4 mr-1" />
                      Capture Frame
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
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
      </div>
    </div>
  );
};

export default VideoFeed;
