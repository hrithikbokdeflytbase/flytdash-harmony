
import React, { useState } from 'react';
import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRangeType } from './DateRangeFilter';
import { Button } from '@/components/ui/button';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, isSameDay, isSameWeek, isSameMonth } from 'date-fns';

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

const FlightTimeline: React.FC<FlightTimelineProps> = ({ viewType, dateRange, isLoading }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const data = React.useMemo(() => generateMockData(dateRange, viewType, currentDate), [dateRange, viewType, currentDate]);
  
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
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="flybase-card p-200 border border-outline-primary bg-background-level-2">
          <p className="fb-body1-medium text-text-icon-01">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={`item-${index}`} 
              className="fb-body2-regular" 
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom cursor for the chart to create a better hover effect
  const CustomCursor = ({ x, y, width, height }: any) => {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(73, 109, 200, 0.15)"
        fillOpacity={0.3}
        style={{ pointerEvents: 'none' }}
      />
    );
  };

  // Custom bar that highlights the current period
  const CustomBar = (props: any) => {
    const { x, y, width, height, isCurrent, fill, ...rest } = props;
    const fillColor = isCurrent ? '#9b87f5' : fill; // Use theme primary color for current period
    return (
      <g>
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          fill={fillColor}
          {...rest}
        />
        {isCurrent && (
          <rect
            x={x}
            y={y + height - 3}
            width={width}
            height={3}
            fill="#D6BCFA"
            rx={1}
          />
        )}
      </g>
    );
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-100" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-400">
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
            <div className="text-text-icon-01 font-medium">{getDateRangeLabel()}</div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'rgba(255,255,255,0.54)' }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              />
              <YAxis 
                tick={{ fill: 'rgba(255,255,255,0.54)' }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              />
              <Tooltip 
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
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default FlightTimeline;
