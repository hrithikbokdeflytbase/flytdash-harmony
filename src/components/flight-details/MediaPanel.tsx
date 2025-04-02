
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Film, Loader2, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { timeToSeconds } from './timeline/timelineUtils';

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
    uploadStatus: 'success'
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

export function MediaPanel({ flightId, timelinePosition = '00:00:00' }: MediaPanelProps) {
  // State for media items, filter type, and loading states
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'photos' | 'videos'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
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
    setIsPreviewOpen(true);
  };
  
  // Close preview
  const closePreview = () => {
    setIsPreviewOpen(false);
  };
  
  // Render the filters
  const renderFilters = () => (
    <div className="flex items-center gap-2 mb-4">
      <button 
        className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          filterType === 'all' 
            ? "bg-primary-200 text-text-icon-01" 
            : "bg-background-level-3 text-text-icon-02"
        )}
        onClick={() => setFilterType('all')}
      >
        All
      </button>
      <button 
        className={cn(
          "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1",
          filterType === 'photos' 
            ? "bg-primary-200 text-text-icon-01" 
            : "bg-background-level-3 text-text-icon-02"
        )}
        onClick={() => setFilterType('photos')}
      >
        <ImageIcon className="w-3 h-3" /> 
        Photos
      </button>
      <button 
        className={cn(
          "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1",
          filterType === 'videos' 
            ? "bg-primary-200 text-text-icon-01" 
            : "bg-background-level-3 text-text-icon-02"
        )}
        onClick={() => setFilterType('videos')}
      >
        <Film className="w-3 h-3" /> 
        Videos
      </button>
      
      <div className="ml-auto text-sm text-text-icon-02">
        {filteredItems.length} {filterType === 'all' ? 'items' : filterType}
      </div>
    </div>
  );
  
  // Render media grid
  const renderMediaGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {filteredItems.map(item => (
        <div 
          key={item.id} 
          className="relative group cursor-pointer rounded-md overflow-hidden bg-background-level-2"
          onClick={() => handleItemClick(item)}
        >
          <div className="aspect-video relative">
            <img 
              src={item.thumbnailUrl} 
              alt={item.title || item.id}
              className="w-full h-full object-cover"
            />
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                  <Film className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs truncate">{item.timestamp}</p>
            </div>
          </div>
          <div className="p-2">
            <p className="text-text-icon-01 text-sm truncate font-medium">{item.title || item.id}</p>
            <p className="text-text-icon-02 text-xs">{item.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
  
  // Render media preview modal (simplified version)
  const renderMediaPreview = () => {
    if (!selectedItem || !isPreviewOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={closePreview}>
        <div className="max-w-4xl w-full max-h-[80vh] p-4" onClick={e => e.stopPropagation()}>
          {selectedItem.type === 'photo' ? (
            <img 
              src={selectedItem.url} 
              alt={selectedItem.title || selectedItem.id} 
              className="w-full h-full object-contain"
            />
          ) : (
            <video 
              src={selectedItem.url} 
              controls 
              className="w-full h-full"
            />
          )}
          <div className="mt-2 bg-background-level-2 p-2 rounded-md">
            <p className="text-text-icon-01 font-medium">{selectedItem.title || selectedItem.id}</p>
            <p className="text-text-icon-02 text-sm">Timestamp: {selectedItem.timestamp}</p>
          </div>
        </div>
      </div>
    );
  };

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
