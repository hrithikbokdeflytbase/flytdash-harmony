
import React from 'react';
import { ImageIcon, Film, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MediaStatusBadge } from './MediaStatusBadge';
import { MediaItem } from '@/services/mediaService';
import { useToast } from "@/hooks/use-toast";

interface MediaCardProps {
  item: MediaItem;
  isHighlighted: boolean;
  isNearTimelinePosition: boolean;
  onClick: () => void;
  onJumpToTimestamp?: () => void;
  onRetryUpload?: (e: React.MouseEvent) => void;
  isRetrying: boolean;
}

export function MediaCard({
  item,
  isHighlighted,
  isNearTimelinePosition,
  onClick,
  onJumpToTimestamp,
  onRetryUpload,
  isRetrying
}: MediaCardProps) {
  const { toast } = useToast();
  
  // Format the timestamp for display
  const formatCaptureTime = (timestamp: string) => {
    // Convert from HH:MM:SS format to a more readable time
    const [hours, minutes] = timestamp.split(':');
    return `${hours}:${minutes}`;
  };
  
  const handleJumpToTimestamp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onJumpToTimestamp) {
      onJumpToTimestamp();
      toast({
        title: "Timeline updated",
        description: `Jumped to ${item.timestamp}`,
        duration: 2000,
      });
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-md transition-all",
        isNearTimelinePosition || isHighlighted ? "ring-1 ring-primary-200" : ""
      )}
      onClick={onClick}
    >
      <div className="relative">
        <AspectRatio ratio={16/9}>
          {item.thumbnailUrl ? (
            <img 
              src={item.thumbnailUrl} 
              alt={item.title || item.id}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback for broken images
                (e.target as HTMLImageElement).src = "https://placehold.co/800x450?text=Image+Not+Available";
              }}
            />
          ) : (
            // Fallback for items without thumbnails
            <div className="w-full h-full bg-background-level-3 flex items-center justify-center">
              {item.type === 'photo' ? (
                <ImageIcon className="w-8 h-8 text-text-icon-03" />
              ) : (
                <Film className="w-8 h-8 text-text-icon-03" />
              )}
            </div>
          )}
          
          {/* Media type indicator - minimal dot */}
          <div className="absolute bottom-2 left-2 bg-black/60 rounded-full p-1">
            {item.type === 'photo' ? (
              <ImageIcon className="w-3 h-3 text-white" />
            ) : (
              <Film className="w-3 h-3 text-white" />
            )}
          </div>
          
          {/* Timestamp indicator - small minimal */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] rounded-sm flex items-center gap-1 px-1.5 py-0.5">
            <Clock className="w-2 h-2" />
            {item.timestamp}
          </div>
          
          {/* Upload status indicator - minimal badge */}
          <MediaStatusBadge 
            status={item.uploadStatus} 
            isRetrying={isRetrying} 
            onRetry={onRetryUpload ? (e) => onRetryUpload(e) : undefined} 
          />
        </AspectRatio>
      </div>
      <CardContent className="p-2.5">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-xs line-clamp-1">{item.title || item.id}</h4>
            <div className="flex items-center mt-0.5">
              <span className="text-[10px] text-text-icon-02">
                {item.type === 'photo' ? 
                  `Photo${item.fileSize ? ` • ${item.fileSize}` : ''}` : 
                  `Video${item.duration ? ` • ${item.duration}s` : ''}${item.fileSize ? ` • ${item.fileSize}` : ''}`
                }
              </span>
            </div>
            <div className="text-[10px] text-text-icon-02 mt-1">
              Captured at {formatCaptureTime(item.timestamp)}
            </div>
          </div>
          
          {/* Jump to timestamp button for easy navigation - smaller and minimal */}
          {onJumpToTimestamp && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 px-1.5 text-[10px]"
              onClick={handleJumpToTimestamp}
            >
              <Clock className="w-2 h-2 mr-1" /> Jump
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
