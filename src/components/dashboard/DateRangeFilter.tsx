
import React from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addWeeks, subWeeks, subMonths } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type definition for date range selection
export type DateRangeType = 'daily' | 'weekly' | 'monthly';

export interface DateRangeInfo {
  type: DateRangeType;
  label: string;
  tooltip: string;
  period: {
    current: string;
    previous: string[];
  };
  dateRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Get detailed information about the current date range
 * @param type The type of date range (daily, weekly, monthly)
 * @returns DateRangeInfo object with detailed range information
 */
export const getDateRangeInfo = (type: DateRangeType): DateRangeInfo => {
  const today = new Date();
  
  switch (type) {
    case 'daily':
      return {
        type,
        label: 'Daily',
        tooltip: 'Shows data by day of the week (Monday-Sunday)',
        period: {
          current: format(today, 'EEEE'), // Current day (e.g., "Tuesday")
          previous: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            .filter(day => day !== format(today, 'EEEE'))
        },
        dateRange: {
          start: today,
          end: today
        }
      };
      
    case 'weekly': {
      const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
      const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      const twoWeeksAgoStart = startOfWeek(subWeeks(today, 2), { weekStartsOn: 1 });
      const twoWeeksAgoEnd = endOfWeek(subWeeks(today, 2), { weekStartsOn: 1 });
      const threeWeeksAgoStart = startOfWeek(subWeeks(today, 3), { weekStartsOn: 1 });
      const threeWeeksAgoEnd = endOfWeek(subWeeks(today, 3), { weekStartsOn: 1 });
      
      const currentWeekNumber = getCurrentWeekNumber(today);
      
      return {
        type,
        label: 'Weekly',
        tooltip: 'Shows data by week (past 4 weeks)',
        period: {
          current: `Week ${currentWeekNumber} (${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d')})`,
          previous: [
            `Week ${currentWeekNumber-1} (${format(lastWeekStart, 'MMM d')} - ${format(lastWeekEnd, 'MMM d')})`,
            `Week ${currentWeekNumber-2} (${format(twoWeeksAgoStart, 'MMM d')} - ${format(twoWeeksAgoEnd, 'MMM d')})`,
            `Week ${currentWeekNumber-3} (${format(threeWeeksAgoStart, 'MMM d')} - ${format(threeWeeksAgoEnd, 'MMM d')})`
          ]
        },
        dateRange: {
          start: currentWeekStart,
          end: currentWeekEnd
        }
      };
    }
      
    case 'monthly': {
      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);
      const lastMonthStart = startOfMonth(subMonths(today, 1));
      const lastMonthEnd = endOfMonth(subMonths(today, 1));
      
      return {
        type,
        label: 'Monthly',
        tooltip: 'Shows data by month (past 12 months)',
        period: {
          current: format(today, 'MMMM yyyy'),
          previous: [
            format(subMonths(today, 1), 'MMMM yyyy'),
            format(subMonths(today, 2), 'MMMM yyyy'),
            // Only showing 3 previous months for brevity
            format(subMonths(today, 3), 'MMMM yyyy')
          ]
        },
        dateRange: {
          start: currentMonthStart,
          end: currentMonthEnd
        }
      };
    }
    
    default:
      return getDateRangeInfo('monthly'); // Default to monthly
  }
};

/**
 * Calculate the current week number of the year
 */
const getCurrentWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * Component to display the current date range information
 */
export const DateRangeIndicator: React.FC<{
  dateRange: DateRangeType;
}> = ({ dateRange }) => {
  const rangeInfo = getDateRangeInfo(dateRange);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-background-level-2 text-text-icon-01 px-3 py-1 ml-2">
            {rangeInfo.period.current}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Current Period</p>
            <p className="text-xs">{rangeInfo.period.current}</p>
            
            {rangeInfo.period.previous.length > 0 && (
              <>
                <p className="text-sm font-semibold mt-2">Previous Periods</p>
                <ul className="text-xs space-y-1">
                  {rangeInfo.period.previous.slice(0, 3).map((period, idx) => (
                    <li key={idx}>{period}</li>
                  ))}
                </ul>
              </>
            )}
            
            <p className="text-xs mt-2 text-text-icon-02">{rangeInfo.tooltip}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Delete the extra DateRangeFilter.ts file since we now have everything in the .tsx file
<lov-delete file_path="src/components/dashboard/DateRangeFilter.ts" />
