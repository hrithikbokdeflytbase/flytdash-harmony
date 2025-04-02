
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
}

export class MediaService {
  private readonly API_BASE_URL = '/api'; // Set this to your actual API base URL
  
  /**
   * Fetch media items for a specific flight
   */
  async getFlightMedia(flightId: string): Promise<MediaItem[]> {
    try {
      // In a real implementation, this would make a network request
      // For now, we'll simulate a network delay and return mock data
      await this.simulateNetworkDelay();
      
      // Return the mock data
      return this.getMockMediaItems();
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
    return [
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
  }
}

// Create a singleton instance
export const mediaService = new MediaService();
