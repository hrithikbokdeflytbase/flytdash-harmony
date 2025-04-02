
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
import { MediaItem, mediaService } from '@/services/mediaService';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface MediaPanelProps {
  flightId: string;
  timelinePosition?: string; // Current timeline position in HH:MM:SS format
  onTimelinePositionChange?: (timestamp: string) => void;
}

export function MediaPanel({ flightId, timelinePosition = '00:00:00', onTimelinePositionChange }: MediaPanelProps) {
  // State for media items, filter type, and loading states
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'photos' | 'videos'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [highlightedMediaId, setHighlightedMediaId] = useState<string | null>(null);
  const [retryingItems, setRetryingItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  // Fetch media items when component mounts or flightId changes
  useEffect(() => {
    fetchMediaItems();
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
    
    // Only highlight if the media is close to current position (within 5 seconds)
    if (smallestDiff <= 5) {
      setHighlightedMediaId(closestItem.id);
      
      // Auto-select media if very close (within 1 second)
      if (smallestDiff <= 1 && !isDialogOpen) {
        // Optional: Auto-open the dialog when timeline exactly matches media
        // setSelectedItem(closestItem);
        // setIsDialogOpen(true);
      }
    } else {
      setHighlightedMediaId(null);
    }
  }, [timelinePosition, mediaItems, isDialogOpen]);
  
  // Function to fetch media items from the API
  const fetchMediaItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await mediaService.getFlightMedia(flightId);
      setMediaItems(items);
    } catch (err) {
      console.error('Error fetching media items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media');
      toast({
        title: "Error",
        description: "Failed to load media items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
        duration: 3000,
      });
      setIsDialogOpen(false);
    }
  };
  
  // Handle retry upload
  const handleRetryUpload = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    
    // Add item ID to retrying set
    setRetryingItems(prev => new Set(prev).add(itemId));
    
    try {
      // Call the API to retry the upload
      const updatedItem = await mediaService.retryUpload(itemId);
      
      // Update the media items with the successful upload
      const updatedItems = mediaItems.map(item => 
        item.id === itemId ? {...item, uploadStatus: 'success' as const} : item
      );
      setMediaItems(updatedItems);
      
      toast({
        title: "Upload successful",
        description: `Media item was uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error retrying upload:', error);
      
      // Update the item to show it's still failed
      const updatedItems = mediaItems.map(item => 
        item.id === itemId ? {...item, uploadStatus: 'failed' as const} : item
      );
      setMediaItems(updatedItems);
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload media item",
        variant: "destructive",
      });
    } finally {
      // Remove the item from the retrying set
      setRetryingItems(prev => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
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
    // If this item is currently being retried
    if (retryingItems.has(item.id)) {
      return (
        <Badge variant="default" className="absolute top-2 right-2 bg-amber-500">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Retrying...
        </Badge>
      );
    }
    
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
              disabled={retryingItems.has(item.id)}
            >
              {retryingItems.has(item.id) ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <RefreshCcw className="w-3 h-3 mr-1" />
              )}
              Retry
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
            isNearTimelinePosition(item.timestamp) || highlightedMediaId === item.id
              ? "ring-2 ring-primary-300"
              : ""
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
              
              {/* Jump to timestamp button for easy navigation */}
              {onTimelinePositionChange && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimelinePositionChange(item.timestamp);
                    toast({
                      title: "Timeline updated",
                      description: `Jumped to ${item.timestamp}`,
                      duration: 2000,
                    });
                  }}
                >
                  <Clock className="w-3 h-3 mr-1" /> Jump
                </Button>
              )}
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
                    onError={(e) => {
                      // Show error if image fails to load
                      (e.target as HTMLImageElement).src = 'https://placehold.co/800x450?text=Image+Failed+to+Load';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <video 
                    src={selectedItem.url} 
                    controls 
                    className="max-w-full max-h-[70vh]"
                    autoPlay
                    onError={(e) => {
                      // Show error message if video fails to load
                      const target = e.target as HTMLVideoElement;
                      target.outerHTML = `
                        <div class="flex flex-col items-center justify-center p-8 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                          <p class="mt-4">Failed to load video</p>
                        </div>
                      `;
                    }}
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

  // Render error state
  const renderError = () => (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle className="flex items-center">
        <X className="w-4 h-4 mr-2" /> Error Loading Media
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{error}</p>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={fetchMediaItems}
          className="self-start mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4 mr-2" />
          )}
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );

  // Render empty state
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center h-40 text-text-icon-02">
      <Info className="w-8 h-8 mb-2" />
      <p>No media found</p>
      <p className="text-sm">Try changing the filter</p>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-40">
      <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-2" />
      <p className="text-text-icon-02">Loading media...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-shrink-0">
        {renderFilters()}
        
        {error && renderError()}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            renderLoading()
          ) : error ? (
            renderEmpty() // We already show the error above, so just show an empty state here
          ) : filteredItems.length > 0 ? (
            renderMediaGrid()
          ) : (
            renderEmpty()
          )}
        </div>
      </ScrollArea>
      
      {renderMediaPreview()}
    </div>
  );
}

export default MediaPanel;
