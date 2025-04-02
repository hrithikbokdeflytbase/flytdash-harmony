import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Film, Loader2, Info, RefreshCcw, Check, X, Clock, Play, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { timeToSeconds } from './timeline/timelineUtils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  timestamp: string;
  thumbnailUrl: string;
  url: string;
  title?: string;
  duration?: string; // For videos only, in seconds
  uploadStatus?: 'success' | 'failed' | 'processing';
}

interface MediaPanelProps {
  flightId: string;
  timelinePosition?: string; // Current timeline position in HH:MM:SS format
  onTimelinePositionChange?: (timestamp: string) => void;
}

// Mock media data
const MOCK_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'photo-001',
    type: 'photo',
    timestamp: '00:01:45',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    title: 'Takeoff Area',
    uploadStatus: 'success'
  },
  {
    id: 'photo-002',
    type: 'photo',
    timestamp: '00:04:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    url: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    title: 'City Overview',
    uploadStatus: 'success'
  },
  {
    id: 'video-001',
    type: 'video',
    timestamp: '00:06:15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Mission Start',
    duration: '45',
    uploadStatus: 'success'
  },
  {
    id: 'photo-003',
    type: 'photo',
    timestamp: '00:09:20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413',
    url: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413',
    title: 'Inspection Point 1',
    uploadStatus: 'processing'
  },
  {
    id: 'photo-004',
    type: 'photo',
    timestamp: '00:12:10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
    title: 'Tower Closeup',
    uploadStatus: 'failed'
  },
  {
    id: 'video-002',
    type: 'video',
    timestamp: '00:15:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1528872042734-8f50f9d3c59b',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    title: 'Structure Survey',
    duration: '62',
    uploadStatus: 'success'
  }
];

export function MediaPanel({ flightId, timelinePosition = '00:00:00', onTimelinePositionChange }: MediaPanelProps) {
  // State for media items, filter type, and loading states
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'photos' | 'videos'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Add placeholder implementation for fetching media
  useEffect(() => {
    // Mock loading for now
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setMediaItems(MOCK_MEDIA_ITEMS);
      setIsLoading(false);
    }, 1000);
  }, [flightId]);
  
  // Apply filters whenever media items or filter type changes
  useEffect(() => {
    if (filterType === 'all') {
      setFilteredItems(mediaItems);
    } else if (filterType === 'photos') {
      setFilteredItems(mediaItems.filter(item => item.type === 'photo'));
    } else {
      setFilteredItems(mediaItems.filter(item => item.type === 'video'));
    }
  }, [mediaItems, filterType]);
  
  // Find nearest media item to current timeline position
  useEffect(() => {
    if (mediaItems.length === 0 || !timelinePosition) return;
    
    const currentTime = timeToSeconds(timelinePosition);
    let closestItem = mediaItems[0];
    let smallestDiff = Math.abs(timeToSeconds(closestItem.timestamp) - currentTime);
    
    mediaItems.forEach(item => {
      const diff = Math.abs(timeToSeconds(item.timestamp) - currentTime);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestItem = item;
      }
    });
    
    // Highlight the closest item (future enhancement)
  }, [timelinePosition, mediaItems]);
  
  // Handle item click
  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };
  
  // Jump to timestamp in timeline
  const handleJumpToTimestamp = () => {
    if (selectedItem && onTimelinePositionChange) {
      onTimelinePositionChange(selectedItem.timestamp);
      toast({
        title: "Timeline updated",
        description: `Jumped to ${selectedItem.timestamp}`,
      });
      setIsDialogOpen(false);
    }
  };
  
  // Handle retry upload - Fixed the type issue
  const handleRetryUpload = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    console.log(`Retrying upload for item: ${itemId}`);
    
    // Ensure we use the correct literal type for uploadStatus
    const updatedItems = mediaItems.map(item => 
      item.id === itemId ? {...item, uploadStatus: 'processing' as const} : item
    );
    
    setMediaItems(updatedItems);
    
    // Simulate completion
    setTimeout(() => {
      const finalItems = mediaItems.map(item => 
        item.id === itemId ? {...item, uploadStatus: 'success' as const} : item
      );
      setMediaItems(finalItems);
    }, 2000);
  };
  
  // Get counts for summary
  const getMediaCounts = () => {
    const photoCount = mediaItems.filter(item => item.type === 'photo').length;
    const videoCount = mediaItems.filter(item => item.type === 'video').length;
    return { photoCount, videoCount, totalCount: mediaItems.length };
  };
  
  const { photoCount, videoCount, totalCount } = getMediaCounts();
  
  // Check if a media item is near the current timeline position (within 5 seconds)
  const isNearTimelinePosition = (itemTimestamp: string): boolean => {
    if (!timelinePosition) return false;
    
    const positionTime = timeToSeconds(timelinePosition);
    const itemTime = timeToSeconds(itemTimestamp);
    return Math.abs(positionTime - itemTime) <= 5;
  };
  
  // Render filter pills
  const renderFilters = () => (
    <div className="flex items-center gap-2 mb-4">
      <ToggleGroup type="single" value={filterType} onValueChange={(value) => value && setFilterType(value as 'all' | 'photos' | 'videos')}>
        <ToggleGroupItem value="all" aria-label="Show all media">
          All
        </ToggleGroupItem>
        <ToggleGroupItem value="photos" aria-label="Show photos only" className="flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> 
          Photos
        </ToggleGroupItem>
        <ToggleGroupItem value="videos" aria-label="Show videos only" className="flex items-center gap-1">
          <Film className="w-3 h-3" /> 
          Videos
        </ToggleGroupItem>
      </ToggleGroup>
      
      <div className="ml-auto text-sm text-text-icon-02">
        {filterType === 'all' && `${totalCount} items (${photoCount} photos, ${videoCount} videos)`}
        {filterType === 'photos' && `${photoCount} photos`}
        {filterType === 'videos' && `${videoCount} videos`}
      </div>
    </div>
  );
  
  // Render status indicator
  const renderStatusIndicator = (item: MediaItem) => {
    switch(item.uploadStatus) {
      case 'success':
        return (
          <Badge variant="default" className="absolute top-2 right-2 bg-green-600">
            <Check className="w-3 h-3 mr-1" /> Success
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="default" className="absolute top-2 right-2 bg-amber-500">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing
          </Badge>
        );
      case 'failed':
        return (
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant="destructive">
              <X className="w-3 h-3 mr-1" /> Failed
            </Badge>
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-6 px-2"
              onClick={(e) => handleRetryUpload(e, item.id)}
            >
              <RefreshCcw className="w-3 h-3 mr-1" /> Retry
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  // Render media grid
  const renderMediaGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {filteredItems.map(item => (
        <Card 
          key={item.id} 
          className={cn(
            "overflow-hidden cursor-pointer hover:shadow-md transition-all",
            isNearTimelinePosition(item.timestamp) ? "ring-2 ring-primary-300" : ""
          )}
          onClick={() => handleItemClick(item)}
        >
          <div className="relative">
            <AspectRatio ratio={16/9}>
              <img 
                src={item.thumbnailUrl} 
                alt={item.title || item.id}
                className="w-full h-full object-cover"
              />
              
              {/* Media type indicator */}
              <div className="absolute bottom-2 left-2 bg-black/60 rounded-full p-1.5">
                {item.type === 'photo' ? (
                  <ImageIcon className="w-4 h-4 text-white" />
                ) : (
                  <Film className="w-4 h-4 text-white" />
                )}
              </div>
              
              {/* Timestamp indicator */}
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs rounded-full flex items-center gap-1 px-2 py-1">
                <Clock className="w-3 h-3" />
                {item.timestamp}
              </div>
              
              {/* Upload status indicator */}
              {renderStatusIndicator(item)}
            </AspectRatio>
          </div>
          <CardContent className="p-3">
            <h4 className="font-medium text-sm">{item.title || item.id}</h4>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-text-icon-02">
                {item.type === 'photo' ? 'Photo' : `Video (${item.duration}s)`}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render media preview dialog
  const renderMediaPreview = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-lg border-none sm:rounded-xl">
        <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-background/40 backdrop-blur hover:bg-background/60 p-2 transition-colors">
          <X className="h-5 w-5 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        {selectedItem && (
          <div className="flex flex-col w-full h-full">
            <div className="relative flex-1 bg-black min-h-[50vh]">
              {selectedItem.type === 'photo' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={selectedItem.url} 
                    alt={selectedItem.title || selectedItem.id} 
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <video 
                    src={selectedItem.url} 
                    controls 
                    className="max-w-full max-h-[70vh]"
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t flex flex-wrap justify-between items-center gap-4 bg-background">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">{selectedItem.title || `Flight Media ${selectedItem.id}`}</h3>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {selectedItem.type === 'photo' ? (
                      <>
                        <ImageIcon className="w-3.5 h-3.5" /> Photo
                      </>
                    ) : (
                      <>
                        <Film className="w-3.5 h-3.5" /> Video {selectedItem.duration && `(${selectedItem.duration}s)`}
                      </>
                    )}
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {selectedItem.timestamp}
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={handleJumpToTimestamp}
                disabled={!onTimelinePositionChange}
                className="ml-auto"
              >
                <Clock className="mr-1 w-4 h-4" />
                Jump to Timeline
                <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-shrink-0">
        {renderFilters()}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-primary-200 animate-spin" />
            </div>
          ) : filteredItems.length > 0 ? (
            renderMediaGrid()
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-text-icon-02">
              <Info className="w-8 h-8 mb-2" />
              <p>No media found</p>
              <p className="text-sm">Try changing the filter</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {renderMediaPreview()}
    </div>
  );
}

export default MediaPanel;
