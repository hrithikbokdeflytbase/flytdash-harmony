import React, { useState } from 'react';
import { BarChart, XAxis, YAxis, Bar, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRangeType } from './DateRangeFilter';
import { Button } from '@/components/ui/button';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, endOfMonth, endOfWeek, isSameDay, isSameWeek, isSameMonth, isAfter, getDay, setDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

type ViewType = 'total' | 'status';

interface FlightTimelineProps {
  viewType: ViewType;
  dateRange: DateRangeType;
  isLoading: boolean;
}

// Generate mock data with current period information
const generateMockData = (dateRange: DateRangeType, viewType: ViewType, currentDate: Date) => {
  const now = new Date();
  
  if (viewType === 'total') {
    switch (dateRange) {
      case 'monthly':
        // Monthly data showing each month with empty state for future months
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(currentDate.getFullYear(), i, 1);
          const isCurrentMonth = isSameMonth(date, now);
          const isFutureMonth = isAfter(date, now);
          
          return {
            name: format(date, 'MMM'),
            flights: isFutureMonth ? 0 : Math.floor(Math.random() * 70) + 30,
            date,
            isCurrent: isCurrentMonth,
            isFuture: isFutureMonth
          };
        });
      case 'weekly':
        // Weekly data - show 7 weeks
        return Array.from({ length: 7 }, (_, i) => {
          // Calculate date for this week
          const weekStart = startOfWeek(addWeeks(currentDate, i - 3));
          const isCurrentWeek = isSameWeek(weekStart, now);
          const isFutureWeek = isAfter(weekStart, now);
          
          return {
            name: `W${format(weekStart, 'w')}`,
            flights: isFutureWeek ? 0 : Math.floor(Math.random() * 30) + 10,
            date: weekStart,
            isCurrent: isCurrentWeek,
            isFuture: isFutureWeek
          };
        });
      case 'daily':
        // Daily data - always starting with Sunday (0) through Saturday (6)
        // Get the start of the week (Sunday) for the current date
        const weekStartSunday = startOfWeek(currentDate, { weekStartsOn: 0 });
        
        return Array.from({ length: 7 }, (_, i) => {
          const date = addDays(weekStartSunday, i);
          const isCurrentDay = isSameDay(date, now);
          const isFutureDay = isAfter(date, now);
          
          return {
            name: format(date, 'EEE'),
            flights: isFutureDay ? 0 : Math.floor(Math.random() * 25) + 5,
            date,
            isCurrent: isCurrentDay,
            isFuture: isFutureDay
          };
        });
    }
  } else {
    // Status view with current period information and renamed properties
    switch (dateRange) {
      case 'monthly':
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(currentDate.getFullYear(), i, 1);
          const isCurrentMonth = isSameMonth(date, now);
          const isFutureMonth = isAfter(date, now);
          
          return {
            name: format(date, 'MMM'),
            success: isFutureMonth ? 0 : Math.floor(Math.random() * 60) + 20,
            failed: isFutureMonth ? 0 : Math.floor(Math.random() * 15),
            error: isFutureMonth ? 0 : Math.floor(Math.random() * 8),
            date,
            isCurrent: isCurrentMonth,
            isFuture: isFutureMonth,
            // Add a flag for the first bar to show CURRENT only once
            isFirstInStack: true
          };
        });
      case 'weekly':
        return Array.from({ length: 7 }, (_, i) => {
          const weekStart = startOfWeek(addWeeks(currentDate, i - 3));
          const isCurrentWeek = isSameWeek(weekStart, now);
          const isFutureWeek = isAfter(weekStart, now);
          
          return {
            name: `W${format(weekStart, 'w')}`,
            success: isFutureWeek ? 0 : Math.floor(Math.random() * 25) + 10,
            failed: isFutureWeek ? 0 : Math.floor(Math.random() * 5),
            error: isFutureWeek ? 0 : Math.floor(Math.random() * 3),
            date: weekStart,
            isCurrent: isCurrentWeek,
            isFuture: isFutureWeek,
            isFirstInStack: true
          };
        });
      case 'daily':
        // Daily data with status breakdown - always starting with Sunday (0) through Saturday (6)
        const weekStartSunday = startOfWeek(currentDate, { weekStartsOn: 0 });
        
        return Array.from({ length: 7 }, (_, i) => {
          const date = addDays(weekStartSunday, i);
          const isCurrentDay = isSameDay(date, now);
          const isFutureDay = isAfter(date, now);
          
          return {
            name: format(date, 'EEE'),
            success: isFutureDay ? 0 : Math.floor(Math.random() * 20) + 5,
            failed: isFutureDay ? 0 : Math.floor(Math.random() * 4),
            error: isFutureDay ? 0 : Math.floor(Math.random() * 2),
            date,
            isCurrent: isCurrentDay,
            isFuture: isFutureDay,
            isFirstInStack: true
          };
        });
    }
  }
  return [];
};

// Enhanced CustomBar component with significantly improved current period highlighting
const CustomBar = (props: any) => {
  const { x, y, width, height, isCurrent, isFuture, fill, dataKey, payload, ...rest } = props;
  
  // Different styling for future months (empty state)
  if (isFuture) {
    return (
      <g>
        <defs>
          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <path d="M -1,1 l 2,-2
                   M 0,4 l 4,-4
                   M 3,5 l 2,-2" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          fill="url(#diagonalHatch)"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={1}
          rx={4}
          ry={4}
          {...rest}
        />
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(255, 255, 255, 0.03)"
          rx={4}
          ry={4}
        />
        <rect
          x={x}
          y={y + height - 2}
          width={width}
          height={2}
          fill="rgba(255, 255, 255, 0.08)"
          rx={1}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 + 5}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.5)"
          fontSize="9"
          fontWeight="500"
          letterSpacing="0.5"
        >
          FUTURE
        </text>
      </g>
    );
  }
  
  // Only show the CURRENT label for the first bar in the stack
  const shouldShowCurrentLabel = isCurrent && 
    ((payload && payload.isFirstInStack) || dataKey === 'flights');
  
  // Different styling based on whether it's the current period
  if (isCurrent) {
    // For current period, use a gradient and special styling
    const gradientId = `currentPeriodGradient-${dataKey}`;
    const baseColor = fill;
    const lighterColor = (() => {
      // Create a lighter version of the base color for the gradient
      if (baseColor === '#3399FF') return '#66BBFF'; // For total flights
      if (baseColor === '#1EAE6D') return '#25D684'; // For successful
      if (baseColor === '#F8473A') return '#FF5F52'; // For failed 
      if (baseColor === '#FDB022') return '#FFCC44'; // For aborted
      return baseColor; // Fallback
    })();
    
    // Get the glow color that matches the bar's color
    const getGlowColor = () => {
      if (baseColor === '#3399FF') return 'rgba(51, 153, 255, 0.6)'; // Blue for total
      if (baseColor === '#1EAE6D') return 'rgba(30, 174, 109, 0.6)'; // Green for success
      if (baseColor === '#F8473A') return 'rgba(248, 71, 58, 0.6)'; // Red for failed
      if (baseColor === '#FDB022') return 'rgba(253, 176, 34, 0.6)'; // Yellow/orange for error
      return 'rgba(255, 255, 255, 0.6)'; // Default white glow
    };
    
    const glowColor = getGlowColor();
    
    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighterColor} />
            <stop offset="100%" stopColor={baseColor} />
          </linearGradient>
          {/* Add outer glow filter with the color matching the bar */}
          <filter id={`glow-${dataKey}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={baseColor} floodOpacity="0.5" result="color" />
            <feComposite operator="in" in="color" in2="blur" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Bar with gradient fill and glow effect */}
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          fill={`url(#${gradientId})`}
          stroke="#ffffff"
          strokeWidth={2}
          strokeOpacity={0.5}
          rx={4}
          ry={4}
          filter={`url(#glow-${dataKey})`}
          className="drop-shadow-lg"
          {...rest}
        />
        {/* Highlight indicator at bottom */}
        <rect
          x={x}
          y={y + height - 4}
          width={width}
          height={4}
          fill={baseColor}
          rx={2}
          className="animate-pulse"
          style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
        />
        {/* Star/highlight at top - Only show for the first bar in stack */}
        {shouldShowCurrentLabel && (
          <circle
            cx={x + width / 2}
            cy={y - 5}
            r={4}
            fill={baseColor}
            className="animate-pulse"
            style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
          />
        )}
        {/* "Current" label on top - Only show for the first bar in stack */}
        {shouldShowCurrentLabel && (
          <text
            x={x + width / 2}
            y={y - 12}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))' }}
          >
            CURRENT
          </text>
        )}
      </g>
    );
  }
  
  // Regular bar for non-current periods
  return (
    <rect 
      x={x} 
      y={y} 
      width={width} 
      height={height} 
      fill={fill}
      rx={4}
      ry={4}
      {...rest}
    />
  );
};

// Custom tooltip component with improved styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isCurrentPeriod = payload[0]?.payload?.isCurrent;
    const isFuturePeriod = payload[0]?.payload?.isFuture;
    
    if (isFuturePeriod) {
      return (
        <div className="flybase-card p-300 border shadow-lg rounded-lg border-outline-primary bg-background-level-2/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-100">
            <span className="inline-block w-2 h-2 rounded-full bg-text-icon-02/50"></span>
            <p className="fb-body1-medium text-text-icon-01">
              {label}
            </p>
          </div>
          <div className="flex items-center gap-2 pb-100 mb-100 border-b border-outline-primary/50">
            <span className="text-xs py-1 px-2 bg-background-level-3 rounded-full text-text-icon-02 font-medium">FUTURE</span>
          </div>
          <p className="fb-body2-regular text-text-icon-02">
            No flight data available yet
          </p>
        </div>
      );
    }
    
    return (
      <div className={cn(
        "flybase-card p-300 border shadow-lg rounded-lg", 
        isCurrentPeriod 
          ? "border-primary-100 bg-background-level-2/90 backdrop-blur-sm" 
          : "border-outline-primary bg-background-level-2/80"
      )}>
        <p className={cn(
          "fb-body1-medium mb-100", 
          isCurrentPeriod ? "text-primary-100" : "text-text-icon-01"
        )}>
          {isCurrentPeriod && "● "}{label}{isCurrentPeriod ? " (Current)" : ""}
        </p>
        {payload.map((entry: any, index: number) => (
          <p 
            key={`item-${index}`} 
            className="fb-body2-regular flex justify-between items-center gap-300" 
          >
            <span className="flex items-center gap-100">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomCursor = ({ x, y, width, height, payload }: any) => {
  const isCurrentPeriod = payload && payload[0]?.payload?.isCurrent;
  const isFuturePeriod = payload && payload[0]?.payload?.isFuture;
  
  // Update cursor colors to use the same color scheme as the bars instead of purple
  const getCursorColor = () => {
    if (isFuturePeriod) return "rgba(255, 255, 255, 0.05)";
    
    if (isCurrentPeriod) {
      const dataKey = payload[0]?.dataKey;
      if (dataKey === 'flights') return "rgba(51, 153, 255, 0.2)"; // Blue for flights
      if (dataKey === 'success') return "rgba(30, 174, 109, 0.2)"; // Green for success
      if (dataKey === 'failed') return "rgba(248, 71, 58, 0.2)"; // Red for failed
      if (dataKey === 'error') return "rgba(253, 176, 34, 0.2)"; // Yellow for error
    }
    
    return "rgba(73, 109, 200, 0.15)"; // Default blue highlight
  };
  
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={getCursorColor()}
      fillOpacity={0.4}
      stroke={
        isFuturePeriod 
          ? "rgba(255, 255, 255, 0.2)" 
          : isCurrentPeriod 
            ? getCursorColor().replace("0.2", "0.5") 
            : "none"
      }
      strokeWidth={1}
      strokeDasharray={isFuturePeriod ? "3 3" : "none"}
      style={{ pointerEvents: 'none' }}
    />
  );
};

const FlightTimeline: React.FC<FlightTimelineProps> = ({ viewType, dateRange, isLoading }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const data = React.useMemo(() => generateMockData(dateRange, viewType, currentDate), [dateRange, viewType, currentDate]);
  const navigate = useNavigate();
  
  // Navigation functions - updated for weekly navigation in daily view
  const navigateToPrevious = () => {
    setCurrentDate(prevDate => {
      switch (dateRange) {
        case 'monthly':
          return subMonths(prevDate, 12); // Navigate to previous year
        case 'weekly':
          return subWeeks(prevDate, 1);
        case 'daily':
          return subWeeks(prevDate, 1); // Navigate back a whole week instead of just one day
        default:
          return prevDate;
      }
    });
  };

  const navigateToNext = () => {
    const now = new Date();
    setCurrentDate(prevDate => {
      switch (dateRange) {
        case 'monthly': {
          // Only navigate to next year if it's not in the future
          const nextYear = addMonths(prevDate, 12);
          return nextYear.getFullYear() > now.getFullYear() ? prevDate : nextYear;
        }
        case 'weekly': {
          const nextWeek = addWeeks(prevDate, 1);
          return isAfter(nextWeek, now) ? prevDate : nextWeek;
        }
        case 'daily': {
          const nextWeek = addWeeks(prevDate, 1); // Navigate forward a whole week instead of just one day
          return isAfter(nextWeek, now) ? prevDate : nextWeek;
        }
        default:
          return prevDate;
      }
    });
  };

  const resetToToday = () => {
    // When resetting to today in daily view, ensure we use the current week's Sunday-Saturday
    if (dateRange === 'daily') {
      // Find the Sunday of the current week
      const today = new Date();
      const sunday = startOfWeek(today, { weekStartsOn: 0 });
      setCurrentDate(sunday);
    } else {
      setCurrentDate(new Date());
    }
  };

  // Format the date range for display
  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'monthly':
        return format(currentDate, 'yyyy');
      case 'weekly':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'daily':
        // For daily view, show the week range (Sunday - Saturday)
        const weekStartSunday = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEndSaturday = addDays(weekStartSunday, 6);
        return `${format(weekStartSunday, 'MMM d')} - ${format(weekEndSaturday, 'MMM d, yyyy')}`;
      default:
        return '';
    }
  };

  // Define the color scheme for the chart with renamed labels
  const chartConfig = {
    flights: {
      label: "Flights",
      color: "#3399FF"
    },
    success: {
      label: "Success",
      color: "#1EAE6D"
    },
    failed: {
      label: "Failed",
      color: "#F8473A"
    },
    error: {
      label: "Error",
      color: "#FDB022"
    }
  };

  // Function to handle bar click and navigate to all logs with date filter
  const handleBarClick = (data: any) => {
    console.log("Bar clicked event:", data);
    
    if (!data || !data.activePayload || data.activePayload.length === 0) {
      console.log("No valid data in the click event");
      return;
    }
    
    const clickedItem = data.activePayload[0].payload;
    console.log("Clicked item details:", clickedItem);
    
    if (!clickedItem || !clickedItem.date) {
      console.log("No date in clicked item");
      return;
    }
    
    // Don't navigate for future dates
    if (clickedItem.isFuture === true) {
      console.log("Future date clicked, not navigating");
      return;
    }
    
    let fromDate, toDate;
    
    switch (dateRange) {
      case 'monthly':
        // For monthly view, set from-to as the entire month
        fromDate = startOfMonth(clickedItem.date);
        toDate = endOfMonth(clickedItem.date);
        break;
      case 'weekly':
        // For weekly view, set from-to as the entire week
        fromDate = startOfWeek(clickedItem.date);
        toDate = endOfWeek(clickedItem.date);
        break;
      case 'daily':
        // For daily view, just set the specific day
        fromDate = startOfDay(clickedItem.date);
        toDate = endOfDay(clickedItem.date);
        break;
      default:
        return;
    }
    
    // Format dates for URL parameters
    const fromParam = format(fromDate, 'yyyy-MM-dd');
    const toParam = format(toDate, 'yyyy-MM-dd');
    
    console.log(`Navigating to: /all-logs?from=${fromParam}&to=${toParam}`);
    
    // Navigate to all logs page with date filter
    navigate(`/all-logs?from=${fromParam}&to=${toParam}`);
  };

  // Helper to get end of day (missing in our imports above)
  const endOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  };

  return (
    <div className="w-full h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-100" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-300">
            
            <div className="flex items-center space-x-200">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToPrevious}
                className="border-outline-primary text-text-icon-01 bg-background-level-2 hover:bg-background-level-4 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToToday}
                className="border-outline-primary text-text-icon-01 bg-background-level-2 hover:bg-background-level-4 transition-colors"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToNext}
                className="border-outline-primary text-text-icon-01 bg-background-level-2 hover:bg-background-level-4 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-text-icon-01 font-medium bg-background-level-2 px-300 py-100 rounded-full text-sm border border-outline-primary">
              {getDateRangeLabel()}
            </div>
          </div>
          
          <ChartContainer config={chartConfig} className="w-full h-[350px]">
            <BarChart 
              data={data} 
              // Increase top margin to prevent "CURRENT" tag from being cut off
              margin={{ top: 30, right: 30, left: 20, bottom: 45 }}
              width={800}
              height={350}
              onClick={handleBarClick}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'rgba(255,255,255,0.54)' }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                tickMargin={25}
                scale="point"
                padding={{ left: 30, right: 30 }}
                height={45}
                tickSize={0}
              />
              <YAxis 
                tick={{ fill: 'rgba(255,255,255,0.54)' }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                tickMargin={10}
                tickSize={0}
              />
              <ChartTooltip 
                content={<CustomTooltip />} 
                cursor={<CustomCursor />}
                wrapperStyle={{ outline: 'none' }}
              />
              {viewType === 'total' ? (
                <Bar 
                  dataKey="flights" 
                  fill="#3399FF" 
                  name="Flights" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={500}
                  activeBar={{ fill: '#33BBFF', stroke: '#77DDFF', strokeWidth: 2 }}
                  shape={<CustomBar />}
                  isAnimationActive={true}
                  barSize={dateRange === 'daily' ? 40 : 50}
                  maxBarSize={60}
                />
              ) : (
                <>
                  <Legend />
                  <Bar 
                    dataKey="success" 
                    stackId="a" 
                    fill="#1EAE6D" 
                    name="Success" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={500}
                    activeBar={{ fill: '#25D684', stroke: '#77DDFF', strokeWidth: 1 }}
                    shape={<CustomBar />}
                    isAnimationActive={true}
                    barSize={dateRange === 'daily' ? 40 : 50}
                    maxBarSize={60}
                  />
                  <Bar 
                    dataKey="failed" 
                    stackId="a" 
                    fill="#F8473A" 
                    name="Failed" 
                    animationDuration={500}
                    activeBar={{ fill: '#FF5F52', stroke: '#77DDFF', strokeWidth: 1 }}
                    shape={<CustomBar />}
                    isAnimationActive={true}
                  />
                  <Bar 
                    dataKey="error" 
                    stackId="a" 
                    fill="#FDB022" 
                    name="Error" 
                    animationDuration={500}
                    activeBar={{ fill: '#FFCC44', stroke: '#77DDFF', strokeWidth: 1 }}
                    shape={<CustomBar />}
                    isAnimationActive={true}
                  />
                </>
              )}
            </BarChart>
          </ChartContainer>
        </>
      )}
    </div>
  );
};

export default FlightTimeline;
