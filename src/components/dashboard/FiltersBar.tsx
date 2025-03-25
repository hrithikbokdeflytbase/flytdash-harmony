import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Filter, 
  RefreshCw, 
  Rocket, 
  Target,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { DateRangeType } from './DateRangeFilter';
import AdvancedFilters from './AdvancedFilters';
import FilterChip from './FilterChip';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

export interface FiltersBarProps {
  dateRange: DateRangeType;
  onDateRangeChange: (range: DateRangeType) => void;
  isLoading?: boolean;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  dateRange,
  onDateRangeChange,
  isLoading = false
}) => {
  const [operationType, setOperationType] = useState<string>('all');
  const [includeManual, setIncludeManual] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [triggerType, setTriggerType] = useState<string>('all');
  const [selectedDrones, setSelectedDrones] = useState<string[]>([]);
  
  // Initialize with today and a week from today
  const today = new Date();
  const oneWeekLater = addDays(today, 7);
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: today,
    to: oneWeekLater
  });
  
  const formatDateDisplay = () => {
    switch (dateRange) {
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'daily':
        return 'Daily';
      default:
        return 'Select Date Range';
    }
  };

  const handleDateRangeSelect = (selectedRange: DateRange | undefined) => {
    // Only update if we have a valid selection
    if (selectedRange) {
      setDate(selectedRange);
      
      // Auto-detect date range type based on selection
      if (selectedRange.from && selectedRange.to) {
        const diffInDays = Math.floor(
          (selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffInDays <= 1) {
          onDateRangeChange('daily');
        } else if (diffInDays <= 7) {
          onDateRangeChange('weekly');
        } else {
          onDateRangeChange('monthly');
        }
      }
    }
  };

  const resetFilters = () => {
    onDateRangeChange('monthly');
    setOperationType('all');
    setIncludeManual(false);
    setTriggerType('all');
    setSelectedDrones([]);
    setDate({
      from: today,
      to: oneWeekLater
    });
  };

  const advancedFilterCount = 
    (triggerType !== 'all' ? 1 : 0) +
    (selectedDrones.length > 0 ? 1 : 0);
  
  // Get active filters for display
  const activeFilters = [
    ...(operationType !== 'all' ? [{ id: 'operation', label: `Operation: ${operationType === 'gtl' ? 'GTL' : 'Mission'}` }] : []),
    ...(includeManual ? [{ id: 'manual', label: 'Including manual operations' }] : []),
    ...(triggerType !== 'all' ? [{ id: 'trigger', label: `Trigger: ${triggerType === 'normal' ? 'Normal' : 'Alarm Sensor'}` }] : []),
    ...(selectedDrones.length > 0 ? [{ id: 'drones', label: `${selectedDrones.length} Drone${selectedDrones.length > 1 ? 's' : ''}` }] : [])
  ];

  const removeFilter = (id: string) => {
    switch (id) {
      case 'operation':
        setOperationType('all');
        break;
      case 'manual':
        setIncludeManual(false);
        break;
      case 'trigger':
        setTriggerType('all');
        break;
      case 'drones':
        setSelectedDrones([]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-outline-primary">
      <div className="bg-background-level-3 p-400">
        <div className="flex flex-col space-y-300 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between gap-400">
          <div>
            <h3 className="text-xl font-semibold text-text-icon-01">Flight Data Filters</h3>
            <p className="fb-body2-regular text-text-icon-02 mt-100">Filter flight data</p>
          </div>

          <div className="flex items-center gap-200">
            {/* Reset Button with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-outline-primary text-text-icon-01 bg-background-level-2 hover:bg-background-level-4 transition-colors"
                    onClick={resetFilters}
                    disabled={isLoading || (
                      dateRange === 'monthly' && 
                      operationType === 'all' && 
                      !includeManual && 
                      triggerType === 'all' && 
                      selectedDrones.length === 0
                    )}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all filters to default values</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-400 grid grid-cols-1 md:grid-cols-3 gap-400">
          {/* Date Range Filter */}
          <div>
            <Label htmlFor="date-range" className="text-sm text-text-icon-02 mb-100 block">Date Range</Label>
            <div className="flex gap-200 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    id="date-range"
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background-level-2 border-outline-primary",
                      isLoading && "opacity-70 cursor-not-allowed"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2 text-primary-100" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(date.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background-level-2 border border-outline-primary shadow-lg" align="start">
                  <div className="p-300 border-b border-outline-primary">
                    <div className="flex gap-200 items-center justify-between">
                      <Select value={dateRange} onValueChange={(value) => onDateRangeChange(value as DateRangeType)}>
                        <SelectTrigger 
                          className="h-8 bg-background-level-1 border-outline-primary"
                        >
                          <SelectValue placeholder="Preset" />
                        </SelectTrigger>
                        <SelectContent className="bg-background-level-2 border-outline-primary">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <span className="text-sm text-text-icon-01/84">{formatDateDisplay()}</span>
                    </div>
                  </div>
                  <CalendarComponent
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Operation Type Filter */}
          <div>
            <Label htmlFor="operation-type" className="text-sm text-text-icon-02 mb-100 block">Operation Type</Label>
            <Select value={operationType} onValueChange={setOperationType}>
              <SelectTrigger 
                id="operation-type"
                disabled={isLoading}
                className="h-10 w-full bg-background-level-2 border-outline-primary"
              >
                <div className="flex items-center gap-2">
                  {operationType === 'gtl' ? (
                    <Target className="h-4 w-4 text-primary-100" />
                  ) : operationType === 'mission' ? (
                    <Rocket className="h-4 w-4 text-primary-100" />
                  ) : (
                    <Info className="h-4 w-4 text-primary-100" />
                  )}
                  <SelectValue placeholder="Operation Type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-background-level-2 border-outline-primary">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>All Operations</span>
                  </div>
                </SelectItem>
                <SelectItem value="gtl">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>GTL</span>
                  </div>
                </SelectItem>
                <SelectItem value="mission">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    <span>Mission</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col justify-between">
            {/* Include Manual Operations Checkbox */}
            <div className="flex items-center gap-200 mb-300">
              <Checkbox 
                id="manual-ops" 
                checked={includeManual} 
                onCheckedChange={(checked) => setIncludeManual(checked as boolean)}
                className="data-[state=checked]:bg-primary-100 border-outline-primary h-5 w-5"
              />
              <Label htmlFor="manual-ops" className="text-text-icon-01 cursor-pointer">
                Include manual operations
              </Label>
            </div>

            {/* Advanced Filters Button */}
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "border-outline-primary bg-background-level-2 hover:bg-background-level-4 transition-colors", 
                showAdvancedFilters && "bg-background-level-4"
              )}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              disabled={isLoading}
            >
              <Filter className="h-4 w-4 mr-1" />
              More Filters
              {advancedFilterCount > 0 && (
                <Badge className="ml-1 bg-primary-100 text-background-level-1">
                  {advancedFilterCount}
                </Badge>
              )}
              <ChevronDown className={cn(
                "ml-1 h-3 w-3 transition-transform duration-200", 
                showAdvancedFilters && "transform rotate-180"
              )} />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mt-400 flex flex-wrap gap-200">
            {activeFilters.map(filter => (
              <FilterChip 
                key={filter.id}
                label={filter.label}
                onRemove={() => removeFilter(filter.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Panel with animation */}
      {showAdvancedFilters && (
        <div className="animate-accordion-down">
          <AdvancedFilters 
            triggerType={triggerType}
            setTriggerType={setTriggerType}
            selectedDrones={selectedDrones}
            setSelectedDrones={setSelectedDrones}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default FiltersBar;
