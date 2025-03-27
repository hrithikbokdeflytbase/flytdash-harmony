
// Utility functions for timeline operations

// Convert HH:MM:SS to seconds
export const timeToSeconds = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Convert seconds to HH:MM:SS
export const secondsToTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Calculate position as percentage for timeline items
export const getPositionPercentage = (timeString: string, flightDurationSeconds: number): number => {
  const seconds = timeToSeconds(timeString);
  return (seconds / flightDurationSeconds) * 100;
};

// Calculate width as percentage for duration-based timeline items
export const getWidthPercentage = (startTime: string, endTime: string, flightDurationSeconds: number): number => {
  const startSeconds = timeToSeconds(startTime);
  const endSeconds = timeToSeconds(endTime);
  return ((endSeconds - startSeconds) / flightDurationSeconds) * 100;
};

// Get color for mission phase
export const getMissionPhaseColor = (phaseType: 'manual' | 'gtl' | 'mission' | 'rtds') => {
  switch (phaseType) {
    case 'mission': return 'from-blue-500/80 to-blue-600/80 border-blue-700/40';
    case 'manual': return 'from-yellow-500/80 to-yellow-600/80 border-yellow-700/40';
    case 'gtl': return 'from-green-500/80 to-green-600/80 border-green-700/40';
    case 'rtds': return 'from-orange-500/80 to-orange-600/80 border-orange-700/40';
    default: return 'from-gray-500/80 to-gray-600/80 border-gray-700/40';
  }
};

// Get color for warning/error
export const getWarningColor = (type: 'warning' | 'error', severity: 'low' | 'medium' | 'high') => {
  if (type === 'error') return 'text-error-200 shadow-sm shadow-error-200/30';
  
  switch (severity) {
    case 'low': return 'text-caution-200 shadow-sm shadow-caution-200/30';
    case 'medium': return 'text-warning-200 shadow-sm shadow-warning-200/30';
    case 'high': return 'text-error-100 shadow-sm shadow-error-100/30';
    default: return 'text-caution-100 shadow-sm shadow-caution-100/30';
  }
};

// Get marker groups based on clusters
export const getMarkerClusters = (
  events: Array<{timestamp: string, details?: string, type: string}>, 
  threshold = 2
) => {
  if (!events.length) return [];
  
  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => 
    timeToSeconds(a.timestamp) - timeToSeconds(b.timestamp)
  );
  
  const clusters: Array<{
    isCluster: boolean, 
    events: typeof sortedEvents,
    position: number
  }> = [];
  
  let currentCluster: typeof sortedEvents = [];
  let prevTimestamp = -threshold;
  
  sortedEvents.forEach(event => {
    const eventTime = timeToSeconds(event.timestamp);
    
    if (eventTime - prevTimestamp <= threshold) {
      // Add to current cluster
      currentCluster.push(event);
    } else {
      // Start a new cluster if the previous one had items
      if (currentCluster.length > 0) {
        const clusterPosition = currentCluster.reduce((sum, e) => sum + timeToSeconds(e.timestamp), 0) / currentCluster.length;
        clusters.push({
          isCluster: currentCluster.length > 1,
          events: [...currentCluster],
          position: clusterPosition
        });
      }
      currentCluster = [event];
    }
    
    prevTimestamp = eventTime;
  });
  
  // Add the last cluster
  if (currentCluster.length > 0) {
    const clusterPosition = currentCluster.reduce((sum, e) => sum + timeToSeconds(e.timestamp), 0) / currentCluster.length;
    clusters.push({
      isCluster: currentCluster.length > 1,
      events: [...currentCluster],
      position: clusterPosition
    });
  }
  
  return clusters;
};
