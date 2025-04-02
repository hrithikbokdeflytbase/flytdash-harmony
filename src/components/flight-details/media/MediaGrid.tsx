
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { MediaCard } from './MediaCard';
import { MediaEmptyState } from './MediaEmptyState';
import { MediaItem } from '@/services/mediaService';

interface MediaGridProps {
  filteredItems: MediaItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  highlightedMediaId: string | null;
  retryingItems: Set<string>;
  filterType: 'all' | 'photos' | 'videos';
  isNearTimelinePosition: (timestamp: string) => boolean;
  onMediaItemClick: (item: MediaItem) => void;
  onJumpToTimestamp: (timestamp: string) => void;
  onRetryUpload: (e: React.MouseEvent, itemId: string) => void;
  loadMoreItems: () => void;
  onResetFilter: () => void;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

export function MediaGrid({
  filteredItems,
  isLoading,
  isLoadingMore,
  hasMore,
  highlightedMediaId,
  retryingItems,
  filterType,
  isNearTimelinePosition,
  onMediaItemClick,
  onJumpToTimestamp,
  onRetryUpload,
  loadMoreItems,
  onResetFilter,
  loadMoreRef
}: MediaGridProps) {
  
  // Render skeleton loaders during initial load
  if (isLoading && !filteredItems.length) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
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
        ))}
      </div>
    );
  }

  // Render empty state when no items match the filter
  if (!isLoading && filteredItems.length === 0) {
    return (
      <div className="col-span-full">
        <MediaEmptyState 
          filterType={filterType} 
          onResetFilter={onResetFilter} 
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredItems.map(item => (
          <MediaCard
            key={item.id}
            item={item}
            isHighlighted={highlightedMediaId === item.id}
            isNearTimelinePosition={isNearTimelinePosition(item.timestamp)}
            onClick={() => onMediaItemClick(item)}
            onJumpToTimestamp={() => onJumpToTimestamp(item.timestamp)}
            onRetryUpload={(e) => onRetryUpload(e, item.id)}
            isRetrying={retryingItems.has(item.id)}
          />
        ))}
      </div>
      
      {/* Load more indicator */}
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
}
