
import { toast } from "@/hooks/use-toast";

// Define Media Item interface (matching what we have in MediaPanel)
export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  timestamp: string;
  thumbnailUrl: string;
  url: string;
  title?: string;
  duration?: string; // For videos only, in seconds
  uploadStatus?: 'success' | 'failed' | 'processing';
  width?: number;
  height?: number;
  fileSize?: string;
}

export class MediaService {
  private readonly API_BASE_URL = '/api'; // Set this to your actual API base URL
  private readonly ITEMS_PER_PAGE = 12; // Number of items to load per page
  
  /**
   * Fetch media items for a specific flight with pagination support
   */
  async getFlightMedia(flightId: string, page = 1, limit = this.ITEMS_PER_PAGE): Promise<{
    items: MediaItem[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      // Simulate network delay and potential random failure (20% chance of failure for demo)
      await this.simulateNetworkDelay();
      
      if (Math.random() < 0.2 && page === 1) {
        throw new Error("Network request failed");
      }
      
      // Get mock data
      const allItems = this.getMockMediaItems();
      
      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = allItems.slice(startIndex, endIndex);
      const hasMore = endIndex < allItems.length;
      
      return {
        items: paginatedItems,
        totalCount: allItems.length,
        hasMore
      };
    } catch (error) {
      console.error('Error fetching flight media:', error);
      throw new Error('Failed to load media. Please try again.');
    }
  }
  
  /**
   * Retry uploading a failed media item
   */
  async retryUpload(itemId: string): Promise<MediaItem> {
    try {
      // Simulate a network delay
      await this.simulateNetworkDelay(2000);
      
      // 90% success rate for demo purposes
      const isSuccess = Math.random() > 0.1;
      
      if (!isSuccess) {
        throw new Error('Upload failed');
      }
      
      // Return the updated item
      return {
        id: itemId,
        type: 'photo', // This would come from the API in a real implementation
        timestamp: '00:00:00', // This would come from the API in a real implementation
        thumbnailUrl: '', // This would come from the API in a real implementation
        url: '', // This would come from the API in a real implementation
        uploadStatus: 'success' as const
      };
    } catch (error) {
      console.error('Error retrying upload:', error);
      throw new Error('Failed to upload. Please try again.');
    }
  }
  
  /**
   * Helper method to simulate network delay
   */
  private async simulateNetworkDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get mock media items for testing
   */
  private getMockMediaItems(): MediaItem[] {
    // For testing empty state
    // return [];
    
    const baseItems = [
      {
        id: 'photo-001',
        type: 'photo' as const,
        timestamp: '00:01:45',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        title: 'Takeoff Area',
        uploadStatus: 'success' as const,
        width: 1200,
        height: 800,
        fileSize: '2.4 MB'
      },
      {
        id: 'photo-002',
        type: 'photo' as const,
        timestamp: '00:04:30',
        thumbnailUrl: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
        url: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
        title: 'City Overview',
        uploadStatus: 'success' as const,
        width: 1600,
        height: 900,
        fileSize: '3.1 MB'
      },
      {
        id: 'video-001',
        type: 'video' as const,
        timestamp: '00:06:15',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        title: 'Mission Start',
        duration: '45',
        uploadStatus: 'success' as const,
        width: 1920,
        height: 1080,
        fileSize: '8.7 MB'
      },
      {
        id: 'photo-003',
        type: 'photo' as const,
        timestamp: '00:09:20',
        thumbnailUrl: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413',
        url: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413',
        title: 'Inspection Point 1',
        uploadStatus: 'processing' as const,
        width: 1400,
        height: 933,
        fileSize: '1.9 MB'
      },
      {
        id: 'photo-004',
        type: 'photo' as const,
        timestamp: '00:12:10',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
        title: 'Tower Closeup',
        uploadStatus: 'failed' as const,
        width: 2000,
        height: 1333,
        fileSize: '4.2 MB'
      },
      {
        id: 'video-002',
        type: 'video' as const,
        timestamp: '00:15:30',
        thumbnailUrl: 'https://images.unsplash.com/photo-1528872042734-8f50f9d3c59b',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        title: 'Structure Survey',
        duration: '62',
        uploadStatus: 'success' as const,
        width: 1280,
        height: 720,
        fileSize: '15.3 MB'
      }
    ];
    
    // Generate more items for testing pagination/infinite scroll
    const moreItems: MediaItem[] = [];
    
    // Generate 30 additional items
    for (let i = 1; i <= 30; i++) {
      const isPhoto = Math.random() > 0.3; // 70% photos, 30% videos
      const timestamp = `00:${(20 + i).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
      
      moreItems.push({
        id: isPhoto ? `photo-extra-${i}` : `video-extra-${i}`,
        type: isPhoto ? 'photo' : 'video',
        timestamp,
        thumbnailUrl: isPhoto 
          ? `https://picsum.photos/id/${200 + i}/800/600`
          : `https://picsum.photos/id/${300 + i}/800/600`,
        url: isPhoto 
          ? `https://picsum.photos/id/${200 + i}/1600/1200`
          : `https://storage.googleapis.com/gtv-videos-bucket/sample/${i % 2 === 0 ? 'BigBuckBunny' : 'ElephantsDream'}.mp4`,
        title: isPhoto ? `Flight Photo ${i}` : `Flight Video ${i}`,
        duration: isPhoto ? undefined : `${Math.floor(Math.random() * 120 + 30)}`,
        uploadStatus: Math.random() > 0.1 ? 'success' : (Math.random() > 0.5 ? 'failed' : 'processing'),
        width: Math.floor(Math.random() * 1000) + 1000,
        height: Math.floor(Math.random() * 600) + 600,
        fileSize: `${(Math.random() * 10).toFixed(1)} MB`
      });
    }
    
    return [...baseItems, ...moreItems];
  }
}

// Create a singleton instance
export const mediaService = new MediaService();
