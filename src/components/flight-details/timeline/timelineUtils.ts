
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
