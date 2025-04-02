
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { timeToSeconds } from './timeline/timelineUtils';
import { useToast } from "@/hooks/use-toast";
import { MediaItem, mediaService } from '@/services/mediaService';

// Import refactored components
import { MediaFilters } from './media/MediaFilters';
import { MediaGrid } from './media/MediaGrid';
import { MediaLoadingState } from './media/MediaLoadingState';
import { MediaErrorState } from './media/MediaErrorState';
import { MediaPreviewDialog } from './media/MediaPreviewDialog';

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
      await mediaService.retryUpload(itemId);
      
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

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 flex-shrink-0">
        <MediaFilters 
          filterType={filterType}
          setFilterType={setFilterType}
          totalCount={totalCount}
          photoCount={photoCount}
          videoCount={videoCount}
        />
        
        {error && !mediaItems.length && (
          <MediaErrorState 
            error={error} 
            onRetry={handleRetryInitialLoad} 
            isLoading={isLoading} 
          />
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 pt-1">
          {isLoading && !mediaItems.length ? (
            <MediaLoadingState />
          ) : error && !mediaItems.length ? (
            <MediaErrorState 
              error={error} 
              onRetry={handleRetryInitialLoad} 
              isLoading={isLoading} 
              isMinimal={true} 
            />
          ) : (
            <MediaGrid 
              filteredItems={filteredItems}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              highlightedMediaId={highlightedMediaId}
              retryingItems={retryingItems}
              filterType={filterType}
              isNearTimelinePosition={isNearTimelinePosition}
              onMediaItemClick={handleItemClick}
              onJumpToTimestamp={(timestamp) => {
                if (onTimelinePositionChange) {
                  onTimelinePositionChange(timestamp);
                  toast({
                    title: "Timeline updated",
                    description: `Jumped to ${timestamp}`,
                    duration: 2000,
                  });
                }
              }}
              onRetryUpload={handleRetryUpload}
              loadMoreItems={loadMoreItems}
              onResetFilter={() => setFilterType('all')}
              loadMoreRef={loadMoreRef}
            />
          )}
        </div>
      </ScrollArea>
      
      <MediaPreviewDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedItem={selectedItem}
        onJumpToTimestamp={handleJumpToTimestamp}
        hasTimelineControl={!!onTimelinePositionChange}
      />
    </div>
  );
}
