import React, { useState } from 'react';
import { BarChart, XAxis, YAxis, Bar, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRangeType } from './DateRangeFilter';
import { Button } from '@/components/ui/button';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, endOfMonth, endOfWeek, isSameDay, isSameWeek, isSameMonth } from 'date-fns';
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
        // Monthly data showing each month
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(currentDate.getFullYear(), i, 1);
          const isCurrentMonth = isSameMonth(date, now);
          return {
            name: format(date, 'MMM'),
            flights: Math.floor(Math.random() * 70) + 30,
            date,
            isCurrent: isCurrentMonth
          };
        });
      case 'weekly':
        // Weekly data - show 7 weeks
        return Array.from({ length: 7 }, (_, i) => {
          // Calculate date for this week
          const weekStart = startOfWeek(addWeeks(currentDate, i - 3));
          const isCurrentWeek = isSameWeek(weekStart, now);
          return {
            name: `W${format(weekStart, 'w')}`,
            flights: Math.floor(Math.random() * 30) + 10,
            date: weekStart,
            isCurrent: isCurrentWeek
          };
        });
      case 'daily':
        // Daily data - showing 7 days
        return Array.from({ length: 7 }, (_, i) => {
          const date = addDays(currentDate, i - 3);
          const isCurrentDay = isSameDay(date, now);
          return {
            name: format(date, 'EEE'),
            flights: Math.floor(Math.random() * 25) + 5,
            date,
            isCurrent: isCurrentDay
          };
        });
    }
  } else {
    // Status view with current period information
    switch (dateRange) {
      case 'monthly':
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(currentDate.getFullYear(), i, 1);
          const isCurrentMonth = isSameMonth(date, now);
          return {
            name: format(date, 'MMM'),
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
            date,
            isCurrent: isCurrentMonth
          };
        });
      case 'weekly':
        return Array.from({ length: 7 }, (_, i) => {
          const weekStart = startOfWeek(addWeeks(currentDate, i - 3));
          const isCurrentWeek = isSameWeek(weekStart, now);
          return {
            name: `W${format(weekStart, 'w')}`,
            successful: Math.floor(Math.random() * 25) + 10,
            failed: Math.floor(Math.random() * 5),
            aborted: Math.floor(Math.random() * 3),
            date: weekStart,
            isCurrent: isCurrentWeek
          };
        });
      case 'daily':
        return Array.from({ length: 7 }, (_, i) => {
          const date = addDays(currentDate, i - 3);
          const isCurrentDay = isSameDay(date, now);
          return {
            name: format(date, 'EEE'),
            successful: Math.floor(Math.random() * 20) + 5,
            failed: Math.floor(Math.random() * 4),
            aborted: Math.floor(Math.random() * 2),
            date,
            isCurrent: isCurrentDay
          };
        });
    }
  }
  return [];
};

// Enhanced CustomBar component with significantly improved current period highlighting
const CustomBar = (props: any) => {
  const { x, y, width, height, isCurrent, fill, dataKey, ...rest } = props;
  
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
    
    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighterColor} />
            <stop offset="100%" stopColor={baseColor} />
          </linearGradient>
          {/* Add outer glow filter */}
          <filter id={`glow-${dataKey}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#9b87f5" floodOpacity="0.5" result="color" />
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
          fill="#9b87f5"
          rx={2}
          className="animate-pulse"
          style={{ filter: 'drop-shadow(0 0 5px rgba(155, 135, 245, 0.9))' }}
        />
        {/* Star/highlight at top */}
        <circle
          cx={x + width / 2}
          cy={y - 5}
          r={4}
          fill="#9b87f5"
          className="animate-pulse"
          style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 1))' }}
        />
        {/* "Current" label on top */}
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

// Custom cursor for highlighting bars on hover
const CustomCursor = ({ x, y, width, height, payload }: any) => {
  const isCurrentPeriod = payload && payload[0]?.payload?.isCurrent;
  
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={isCurrentPeriod ? "rgba(155, 135, 245, 0.2)" : "rgba(73, 109, 200, 0.15)"}
      fillOpacity={0.4}
      stroke={isCurrentPeriod ? "#9b87f5" : "none"}
      strokeWidth={1}
      strokeDasharray="3 3"
      style={{ pointerEvents: 'none' }}
    />
  );
};

const FlightTimeline: React.FC<FlightTimelineProps> = ({ viewType, dateRange, isLoading }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const data = React.useMemo(() => generateMockData(dateRange, viewType, currentDate), [dateRange, viewType, currentDate]);
  const navigate = useNavigate();
  
  // Navigation functions
  const navigateToPrevious = () => {
    setCurrentDate(prevDate => {
      switch (dateRange) {
        case 'monthly':
          return subMonths(prevDate, 1);
        case 'weekly':
          return subWeeks(prevDate, 1);
        case 'daily':
          return subDays(prevDate, 1);
        default:
          return prevDate;
      }
    });
  };

  const navigateToNext = () => {
    setCurrentDate(prevDate => {
      switch (dateRange) {
        case 'monthly':
          return addMonths(prevDate, 1);
        case 'weekly':
          return addWeeks(prevDate, 1);
        case 'daily':
          return addDays(prevDate, 1);
        default:
          return prevDate;
      }
    });
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Format the date range for display
  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'monthly':
        return format(currentDate, 'yyyy');
      case 'weekly':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'daily':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  // Define the color scheme for the chart
  const chartConfig = {
    flights: {
      label: "Flights",
      color: "#3399FF"
    },
    successful: {
      label: "Successful",
      color: "#1EAE6D"
    },
    failed: {
      label: "Failed",
      color: "#F8473A"
    },
    aborted: {
      label: "Aborted",
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
        toDate = addDays(fromDate, 1); // Include the full day
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
              margin={{ top: 10, right: 30, left: 20, bottom: 45 }}
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
                    dataKey="successful" 
                    stackId="a" 
                    fill="#1EAE6D" 
                    name="Successful" 
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
                    dataKey="aborted" 
                    stackId="a" 
                    fill="#FDB022" 
                    name="Aborted" 
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
