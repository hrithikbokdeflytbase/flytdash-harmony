
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRangeValue } from './DateRangeFilter';
import { CalendarIcon } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

interface DateRangePickerProps {
  dateRange: DateRangeValue;
  onDateRangeChange: (range: DateRangeValue) => void;
  disabled?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  disabled = false
}) => {
  // Ensure dateRange is not undefined to prevent errors
  const safeRange = dateRange || { from: undefined, to: undefined };
  
  return (
    <div>
      <Label className="text-sm text-text-icon-02 mb-100 block">Date Range</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full h-10 justify-start bg-background-level-3 border-outline-primary",
              !safeRange.from && "text-text-icon-02"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {safeRange.from ? (
              safeRange.to ? (
                <>
                  {isValid(safeRange.from) && format(safeRange.from, "MMM d, yyyy")} -{" "}
                  {isValid(safeRange.to) && format(safeRange.to, "MMM d, yyyy")}
                </>
              ) : (
                isValid(safeRange.from) && format(safeRange.from, "MMM d, yyyy")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: safeRange.from,
              to: safeRange.to
            }}
            onSelect={(selected) => {
              onDateRangeChange({
                from: selected?.from,
                to: selected?.to
              });
            }}
            initialFocus
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
