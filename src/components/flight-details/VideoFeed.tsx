import React, { useState, useRef, useEffect } from 'react';
import { Video, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VideoSegment, TimelinePosition } from './timeline/timelineTypes';
type VideoState = 'loading' | 'error' | 'empty' | 'playing';
type VideoFeedProps = {
  videoState?: VideoState;
  timelinePosition?: TimelinePosition;
  videoSegments?: VideoSegment[];
  onPositionUpdate?: (position: string) => void;
  className?: string;
  isPlaying?: boolean;
  playbackSpeed?: number;
};
const VideoFeed: React.FC<VideoFeedProps> = ({
  videoState = 'empty',
  timelinePosition,
  videoSegments = [],
  onPositionUpdate,
  className,
  isPlaying = false,
  playbackSpeed = 1
}) => {
  const [activeSegment, setActiveSegment] = useState<VideoSegment | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevTimelinePosition, setPrevTimelinePosition] = useState<string | undefined>(timelinePosition?.timestamp);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Log the current state for debugging
  useEffect(() => {
    console.log("VideoFeed state:", {
      videoState,
      timelinePosition,
      isPlaying,
      playbackSpeed
    });
  }, [videoState, timelinePosition, isPlaying, playbackSpeed]);

  // Handle timeline position changes
  useEffect(() => {
    if (!timelinePosition) return;

    // Check if timeline position has changed
    if (timelinePosition.timestamp !== prevTimelinePosition) {
      setPrevTimelinePosition(timelinePosition.timestamp);

      // If we have video content at this position
      if (timelinePosition.hasVideo) {
        // Find the appropriate video segment
        const segment = findVideoSegmentForTimestamp(timelinePosition.timestamp);
        if (segment) {
          // Start transition effect
          setIsTransitioning(true);

          // Set the active segment after a short delay to simulate loading
          setTimeout(() => {
            setActiveSegment(segment);
            setIsTransitioning(false);

            // If video element exists, seek to the correct position
            if (videoRef.current) {
              const segmentStart = timeToSeconds(segment.startTime);
              const positionInSeconds = timeToSeconds(timelinePosition.timestamp);
              const seekTime = positionInSeconds - segmentStart;
              videoRef.current.currentTime = Math.max(0, seekTime);

              // Play or pause based on isPlaying prop
              if (isPlaying) {
                videoRef.current.play().catch(err => {
                  console.error("Could not play video:", err);
                });
              } else {
                videoRef.current.pause();
              }

              // Set playback rate based on the playbackSpeed prop
              videoRef.current.playbackRate = playbackSpeed;
            }
          }, 500);
        } else {
          // No segment found for this timestamp despite hasVideo being true
          console.warn("No video segment found for timestamp", timelinePosition.timestamp);
        }
      } else {
        // No video at this position
        setActiveSegment(null);
      }
    }
  }, [timelinePosition, prevTimelinePosition, videoSegments]);

  // Sync video playback with isPlaying prop
  useEffect(() => {
    if (!videoRef.current || !activeSegment) return;
    if (isPlaying) {
      videoRef.current.play().catch(err => {
        console.error("Could not play video:", err);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, activeSegment]);

  // Sync video playback speed with playbackSpeed prop
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Sync current video time with timelinePosition when playing
  useEffect(() => {
    if (!videoRef.current || !activeSegment || !timelinePosition || !isPlaying) return;
    const updateVideoPosition = () => {
      if (!videoRef.current || !activeSegment) return;

      // Get current video time and convert to timeline time
      const videoTime = videoRef.current.currentTime;
      const segmentStart = timeToSeconds(activeSegment.startTime);
      const timelineTime = secondsToTime(segmentStart + videoTime);

      // Only update if the time has changed significantly (to avoid loops)
      if (Math.abs(timeToSeconds(timelinePosition.timestamp) - timeToSeconds(timelineTime)) > 1) {
        if (onPositionUpdate) {
          onPositionUpdate(timelineTime);
        }
      }
    };

    // Update every 250ms during playback
    const interval = setInterval(updateVideoPosition, 250);
    return () => clearInterval(interval);
  }, [videoRef.current, activeSegment, timelinePosition, isPlaying, onPositionUpdate]);

  // Event listener for video time updates
  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeSegment || !onPositionUpdate || isPlaying) return;

    // When manually seeking in the video, update the timeline position
    const videoTime = videoRef.current.currentTime;
    const segmentStart = timeToSeconds(activeSegment.startTime);
    const timelineTime = secondsToTime(segmentStart + videoTime);

    // Only update if not playing (playing is handled by the effect above)
    if (!isPlaying) {
      onPositionUpdate(timelineTime);
    }
  };

  // Find the appropriate video segment for a given timestamp
  const findVideoSegmentForTimestamp = (timestamp: string): VideoSegment | null => {
    // Convert timestamp to seconds for easier comparison
    const timeInSeconds = timeToSeconds(timestamp);

    // Find a segment that contains this timestamp
    const segment = videoSegments.find(seg => {
      const startSeconds = timeToSeconds(seg.startTime);
      const endSeconds = timeToSeconds(seg.endTime);
      return timeInSeconds >= startSeconds && timeInSeconds <= endSeconds;
    });
    return segment || null;
  };

  // Convert "HH:MM:SS" format to seconds
  const timeToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Convert seconds to "HH:MM:SS" format
  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find nearest available video segment
  const findNearestVideoSegment = (timestamp: string): {
    direction: 'before' | 'after';
    segment: VideoSegment;
  } | null => {
    if (!videoSegments.length) return null;
    const timeInSeconds = timeToSeconds(timestamp);
    let nearestBefore: VideoSegment | null = null;
    let nearestAfter: VideoSegment | null = null;
    let beforeDistance = Infinity;
    let afterDistance = Infinity;
    for (const segment of videoSegments) {
      const endSeconds = timeToSeconds(segment.endTime);
      const startSeconds = timeToSeconds(segment.startTime);

      // Check if segment is before current time
      if (endSeconds < timeInSeconds) {
        const distance = timeInSeconds - endSeconds;
        if (distance < beforeDistance) {
          beforeDistance = distance;
          nearestBefore = segment;
        }
      }

      // Check if segment is after current time
      if (startSeconds > timeInSeconds) {
        const distance = startSeconds - timeInSeconds;
        if (distance < afterDistance) {
          afterDistance = distance;
          nearestAfter = segment;
        }
      }
    }

    // Return the closest segment
    if (beforeDistance <= afterDistance && nearestBefore) {
      return {
        direction: 'before',
        segment: nearestBefore
      };
    } else if (nearestAfter) {
      return {
        direction: 'after',
        segment: nearestAfter
      };
    }
    return null;
  };
  return;
};
export default VideoFeed;