
/**
 * Convert time string in format "HH:MM:SS" to seconds
 */
export const timeToSeconds = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Convert seconds to time string in format "HH:MM:SS"
 */
export const secondsToTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate percentage of a timestamp within a duration
 */
export const calculateTimePercentage = (timestamp: string, duration: string): number => {
  const timeSeconds = timeToSeconds(timestamp);
  const durationSeconds = timeToSeconds(duration);
  return (timeSeconds / durationSeconds) * 100;
};

/**
 * Format a timestamp as relative to current position (e.g., "+00:30" or "-01:15")
 */
export const formatRelativeTime = (timestamp: string, currentPosition: string): string => {
  const timeSeconds = timeToSeconds(timestamp);
  const currentSeconds = timeToSeconds(currentPosition);
  const diffSeconds = timeSeconds - currentSeconds;
  
  const prefix = diffSeconds >= 0 ? '+' : '-';
  const absDiff = Math.abs(diffSeconds);
  
  const hours = Math.floor(absDiff / 3600);
  const minutes = Math.floor((absDiff % 3600) / 60);
  const seconds = Math.floor(absDiff % 60);
  
  return `${prefix}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Get position percentage for timeline items
 */
export const getPositionPercentage = (timestamp: string, durationSeconds: number): number => {
  const timeSeconds = timeToSeconds(timestamp);
  return (timeSeconds / durationSeconds) * 100;
};

/**
 * Get width percentage for timeline segments
 */
export const getWidthPercentage = (startTime: string, endTime: string, durationSeconds: number): number => {
  const startSeconds = timeToSeconds(startTime);
  const endSeconds = timeToSeconds(endTime);
  return ((endSeconds - startSeconds) / durationSeconds) * 100;
};

/**
 * Get color for mission phase based on type
 */
export const getMissionPhaseColor = (phaseType: string): string => {
  switch (phaseType) {
    case 'mission':
      return 'from-blue-500/90 to-blue-600/90 border-blue-400/40';
    case 'manual':
      return 'from-orange-500/90 to-orange-600/90 border-orange-400/40';
    case 'gtl':
      return 'from-teal-500/90 to-teal-600/90 border-teal-400/40';
    case 'rtds':
      return 'from-red-500/90 to-red-600/90 border-red-400/40';
    default:
      return 'from-gray-500/90 to-gray-600/90 border-gray-400/40';
  }
};

/**
 * Define a threshold for clustering nearby events in pixels
 */
const CLUSTER_THRESHOLD = 3; // percentage points

/**
 * Group events into clusters to avoid overcrowding
 */
export const getMarkerClusters = (events: { timestamp: string; details: string; type: string }[]): any[] => {
  if (!events || events.length === 0) return [];
  
  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => 
    timeToSeconds(a.timestamp) - timeToSeconds(b.timestamp)
  );
  
  const clusters: any[] = [];
  let currentCluster: any = {
    position: timeToSeconds(sortedEvents[0].timestamp),
    events: [sortedEvents[0]],
    isCluster: false
  };
  
  // Group events that are close to each other
  for (let i = 1; i < sortedEvents.length; i++) {
    const currentEvent = sortedEvents[i];
    const currentPosition = timeToSeconds(currentEvent.timestamp);
    const clusterPosition = currentCluster.position;
    
    // If this event is close to the cluster, add it to the cluster
    if (Math.abs(currentPosition - clusterPosition) / 36 < CLUSTER_THRESHOLD) {
      currentCluster.events.push(currentEvent);
      currentCluster.isCluster = currentCluster.events.length > 1;
    } else {
      // Finish the current cluster and start a new one
      clusters.push(currentCluster);
      currentCluster = {
        position: currentPosition,
        events: [currentEvent],
        isCluster: false
      };
    }
  }
  
  // Add the last cluster
  clusters.push(currentCluster);
  
  return clusters;
};
