import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image as ImageIcon, Film, Loader2, Info, RefreshCcw, Check, X, Clock, Play, ArrowRight, FileText, Download, AlertCircle } from 'lucide-react';
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [highlightedMediaId, setHighlightedMediaId] = useState<string | null>(null);
  const [retryingItems, setRetryingItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  
  // Ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
  // Fetch media items when component mounts or flightId changes
  useEffect(() => {
    setMediaItems([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchMediaItems(1, true);
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
  
  // Setup IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;
    
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create a new observer
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreItems();
      }
    }, { rootMargin: '100px' });
    
    // Observe the load more trigger element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      // Clean up observer on unmount
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, isLoadingMore, filteredItems]);
  
  // Function to load more items
  const loadMoreItems = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    fetchMediaItems(currentPage + 1);
  }, [currentPage, hasMore, isLoadingMore]);
  
  // Function to fetch media items from the API with pagination
  const fetchMediaItems = async (page: number, reset = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);
    
    try {
      const result = await mediaService.getFlightMedia(flightId, page);
      
      if (reset) {
        setMediaItems(result.items);
      } else {
        setMediaItems(prev => [...prev, ...result.items]);
      }
      
      setCurrentPage(page);
      setHasMore(result.hasMore);
      setTotalItems(result.totalCount);
    } catch (err) {
      console.error('Error fetching media items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media');
      toast({
        title: "Error",
        description: "Failed to load media items",
        variant: "destructive",
      });
    } finally {
      if (page === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
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
  
  // Handle refresh/retry for initial load error
  const handleRetryInitialLoad = () => {
    setMediaItems([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchMediaItems(1, true);
  };
  
  // Format the timestamp for display
  const formatCaptureTime = (timestamp: string) => {
    // Convert from HH:MM:SS format to a more readable time
    const [hours, minutes, seconds] = timestamp.split(':');
    return `${hours}:${minutes}`;
  };
  
  // Render filter pills with minimal styling
  const renderFilters = () => (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <ToggleGroup type="single" value={filterType} onValueChange={(value) => value && setFilterType(value as 'all' | 'photos' | 'videos')}>
          <ToggleGroupItem value="all" aria-label="Show all media" className="h-7 text-xs">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="photos" aria-label="Show photos only" className="h-7 text-xs flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> 
            Photos
          </ToggleGroupItem>
          <ToggleGroupItem value="videos" aria-label="Show videos only" className="h-7 text-xs flex items-center gap-1">
            <Film className="w-3 h-3" /> 
            Videos
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="text-[12px] text-text-icon-02 mt-1.5">
        {filterType === 'all' && `${totalCount || 0} items (${photoCount} photos, ${videoCount} videos)`}
        {filterType === 'photos' && `${photoCount} photos`}
        {filterType === 'videos' && `${videoCount} videos`}
      </div>
    </div>
  );
  
  // Render minimal status indicator
  const renderStatusIndicator = (item: MediaItem) => {
    // If this item is currently being retried
    if (retryingItems.has(item.id)) {
      return (
        <Badge variant="processing" size="sm" className="absolute top-2 right-2 flex items-center gap-1">
          <Loader2 className="w-2 h-2 animate-spin" /> Retrying
        </Badge>
      );
    }
    
    switch(item.uploadStatus) {
      case 'success':
        return (
          <Badge variant="success" size="sm" className="absolute top-2 right-2 flex items-center gap-1">
            <Check className="w-2 h-2" /> Success
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="processing" size="sm" className="absolute top-2 right-2 flex items-center gap-1">
            <Loader2 className="w-2 h-2 animate-spin" /> Processing
          </Badge>
        );
      case 'failed':
        return (
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="failed" size="sm" className="flex items-center gap-1">
              <X className="w-2 h-2" /> Failed
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-5 px-1.5 text-[10px]"
              onClick={(e) => handleRetryUpload(e, item.id)}
              disabled={retryingItems.has(item.id)}
            >
              <RefreshCcw className="w-2 h-2 mr-1" /> Retry
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  // Render media grid with loading skeletons - updated for 2 cards per row
  const renderMediaGrid = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading && !mediaItems.length ? (
          // Render skeleton loaders during initial load - 2 per row
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
              <div className="relative">
                <AspectRatio ratio={16/9}>
                  <Skeleton className="w-full h-full" />
                </AspectRatio>
              </div>
              <CardContent className="p-2">
                <Skeleton className="h-3 w-3/4 mb-1" />
                <Skeleton className="h-2 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : filteredItems.length > 0 ? (
          // Render actual media items - 2 per row
          filteredItems.map(item => (
            <Card 
              key={item.id} 
              className={cn(
                "overflow-hidden cursor-pointer hover:shadow-md transition-all",
                isNearTimelinePosition(item.timestamp) || highlightedMediaId === item.id
                  ? "ring-1 ring-primary-200"
                  : ""
              )}
              onClick={() => handleItemClick(item)}
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
                  {renderStatusIndicator(item)}
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
                          `Video${item.duration ? ` • ${item.duration}s` : ''}`
                        }
                      </span>
                    </div>
                    <div className="text-[10px] text-text-icon-02 mt-1">
                      Captured at {formatCaptureTime(item.timestamp)}\n                    </div>
                  </div>
                  
                  {/* Jump to timestamp button for easy navigation - smaller and minimal */}
                  {onTimelinePositionChange && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 px-1.5 text-[10px]"
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
                      <Clock className="w-2 h-2 mr-1" /> Jump
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : !isLoading ? (
          // Render empty state when no items match the filter
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center py-10 text-text-icon-02">
              <Info className="w-8 h-8 mb-3 text-text-icon-03" />
              <p className="text-sm font-medium">No media found</p>
              <p className="text-xs mt-1 text-text-icon-03">
                {filterType !== 'all' ? 
                  `Try changing the filter from "${filterType}" to "all"` : 
                  "No media is available for this flight"
                }
              </p>
              {filterType !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 text-xs h-7"
                  onClick={() => setFilterType('all')}
                >
                  Show All Media
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Load more indicator - more minimal */}
      {hasMore && filteredItems.length > 0 && (
        <div 
          ref={loadMoreRef} 
          className="w-full py-6 flex justify-center items-center"
        >
          {isLoadingMore ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-5 h-5 animate-spin mb-1 text-primary-200" />
              <p className="text-xs text-text-icon-02">Loading more media...</p>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={loadMoreItems} 
              className="flex items-center gap-2 text-xs h-7"
            >
              Load More
            </Button>
          )}
        </div>
      )}
    </>
  );

  // Render media preview dialog with improved details
  const renderMediaPreview = () => {
    if (!selectedItem) return null;
    
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-lg border-none sm:rounded-xl">
          <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-background/40 backdrop-blur hover:bg-background/60 p-2 transition-colors">
            <X className="h-5 w-5 text-white" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          <div className="flex flex-col w-full h-full">
            <div className="relative flex-1 bg-black min-h-[50vh] flex items-center justify-center">
              {selectedItem.type === 'photo' ? (
                <img 
                  src={selectedItem.url} 
                  alt={selectedItem.title || selectedItem.id} 
                  className="max-w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    // Show error if image fails to load
                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x450?text=Image+Failed+to+Load';
                  }}
                />
              ) : (
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
              )}
            </div>
            
            <div className="p-4 border-t flex flex-col gap-3 bg-background">
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-medium">{selectedItem.title || `Flight Media ${selectedItem.id}`}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="flex items-center gap-1 text-[10px] py-0 px-1.5">
                      {selectedItem.type === 'photo' ? (
                        <>
                          <ImageIcon className="w-3 h-3" /> Photo
                        </>
                      ) : (
                        <>
                          <Film className="w-3 h-3" /> Video {selectedItem.duration && `(${selectedItem.duration}s)`}
                        </>
                      )}
                    </Badge>
                      
                    <Badge variant="outline" className="flex items-center gap-1 text-[10px] py-0 px-1.5">
                      <Clock className="w-3 h-3" /> {selectedItem.timestamp}
                    </Badge>
                      
                    {selectedItem.fileSize && (
                      <Badge variant="outline" className="flex items-center gap-1 text-[10px] py-0 px-1.5">
                        <FileText className="w-3 h-3" /> {selectedItem.fileSize}
                      </Badge>
                    )}
                      
                    {selectedItem.uploadStatus && (
                      <Badge 
                        variant={selectedItem.uploadStatus === 'success' ? 'success' : 
                                  selectedItem.uploadStatus === 'processing' ? 'processing' : 'failed'} 
                        className="flex items-center gap-1"
                      >
                        {selectedItem.uploadStatus === 'success' && <Check className="w-2 h-2" />}
                        {selectedItem.uploadStatus === 'processing' && <Loader2 className="w-2 h-2 animate-spin" />}
                        {selectedItem.uploadStatus === 'failed' && <X className="w-2 h-2" />}
                        {selectedItem.uploadStatus.charAt(0).toUpperCase() + selectedItem.uploadStatus.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
                  
                <div className="flex gap-2">
                  {/* Minimal buttons */}
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                    
                  <Button 
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleJumpToTimestamp}
                    disabled={!onTimelinePositionChange}
                  >
                    <Clock className="mr-1 w-3 h-3" />
                    Jump to Timeline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

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
          onClick={handleRetryInitialLoad}
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
    <div className="flex flex-col items-center justify-center py-12 text-text-icon-02">
      <Info className="w-10 h-10 mb-3 text-text-icon-03" />
      <p className="text-lg font-medium">No media found</p>
      <p className="text-sm mt-1 text-text-icon-03">
        {filterType !== 'all' ? 
          `Try changing the filter from "${filterType}" to "all"` : 
          "No media is available for this flight"
        }
      </p>
      {filterType !== 'all' && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => setFilterType('all')}
        >
          Show All Media
        </Button>
      )}
    </div>
  );

  // Render error loading media item
  const renderErrorItem = (item: MediaItem) => (
    <div className="absolute inset-0 flex items-center justify-center bg-background-level-3">
      <div className="flex flex-col items-center justify-center text-destructive p-4 text-center">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load media</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={(e) => {
            e.stopPropagation();
            // Could implement a reload function here
          }}
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-primary-200 animate-spin mb-3" />
      <p className="text-lg font-medium text-text-icon-02">Loading flight media</p>
      <p className="text-sm mt-1 text-text-icon-03">Please wait while we fetch the media items...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 flex-shrink-0">
        {renderFilters()}
        
        {error && renderError()}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 pt-1">
          {isLoading && !mediaItems.length ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
              <p className="text-sm font-medium text-text-icon-02">Loading flight media</p>
              <p className="text-xs mt-1 text-text-icon-03">Please wait while we fetch the media items...</p>
            </div>
          ) : error && !mediaItems.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-icon-02">
              <AlertCircle className="w-8 h-8 mb-3 text-destructive" />
              <p className="text-sm font-medium">Error loading media</p>
              <p className="text-xs mt-1 text-text-icon-03">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 text-xs h-7"
                onClick={handleRetryInitialLoad}
              >
                <RefreshCcw className="w-3 h-3 mr-1" /> Try Again
              </Button>
            </div>
          ) : (
            renderMediaGrid()
          )}
        </div>
      </ScrollArea>
      
      {renderMediaPreview()}
    </div>
  );
}
