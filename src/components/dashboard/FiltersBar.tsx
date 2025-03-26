import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter, RefreshCw, CheckSquare, Target, Route, Zap, BellRing, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DateRangeType } from './DateRangeFilter';
import AdvancedFilters from './AdvancedFilters';
import FilterChip from './FilterChip';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { format, addDays, isToday } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  
  const resetFilters = () => {
    onDateRangeChange('monthly');
    setOperationType('all');
    setIncludeManual(false);
    setTriggerType('all');
    setSelectedDrones([]);
  };
  
  const advancedFilterCount = (triggerType !== 'all' ? 1 : 0) + (selectedDrones.length > 0 ? 1 : 0);

  // Get active filters for display
  const activeFilters = [...(operationType !== 'all' ? [{
    id: 'operation',
    label: `Operation: ${operationType === 'gtl' ? 'GTL' : 'Mission'}`
  }] : []), ...(includeManual ? [{
    id: 'manual',
    label: 'Including manual operations'
  }] : []), ...(triggerType !== 'all' ? [{
    id: 'trigger',
    label: `Trigger: ${triggerType === 'normal' ? 'Normal' : 'Alarm Sensor'}`
  }] : []), ...(selectedDrones.length > 0 ? [{
    id: 'drones',
    label: `${selectedDrones.length} Drone${selectedDrones.length > 1 ? 's' : ''}`
  }] : [])];
  
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
                    disabled={isLoading || dateRange === 'monthly' && operationType === 'all' && !includeManual && triggerType === 'all' && selectedDrones.length === 0}
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

        <div className="mt-400 grid grid-cols-1 md:grid-cols-2 gap-400">
          {/* Time Period Toggle Group */}
          <div>
            <Label className="text-sm text-text-icon-02 mb-100 block">Time Period</Label>
            <ToggleGroup 
              type="single" 
              value={dateRange} 
              onValueChange={(value) => value && onDateRangeChange(value as DateRangeType)}
              className="h-10 bg-background-level-2 border border-[rgba(255,255,255,0.08)] rounded-lg"
              disabled={isLoading}
            >
              <ToggleGroupItem 
                value="daily" 
                className="h-10 data-[state=on]:bg-primary-200 data-[state=on]:text-text-icon-01 rounded-md font-normal"
              >
                Daily
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="weekly"
                className="h-10 data-[state=on]:bg-primary-200 data-[state=on]:text-text-icon-01 rounded-md font-normal"
              >
                Weekly
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="monthly"
                className="h-10 data-[state=on]:bg-primary-200 data-[state=on]:text-text-icon-01 rounded-md font-normal"
              >
                Monthly
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Operation Type Filter */}
          <div>
            <Label htmlFor="operation-type" className="text-sm text-text-icon-02 mb-100 block">Operation Type</Label>
            <Select value={operationType} onValueChange={setOperationType}>
              <SelectTrigger 
                id="operation-type" 
                disabled={isLoading} 
                className="h-10 w-full bg-background-level-3 border-outline-primary"
              >
                <SelectValue placeholder="Operation Type" />
              </SelectTrigger>
              <SelectContent className="bg-background-level-2 border-[rgba(255,255,255,0.08)]">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary-100" />
                    <span>All Operations</span>
                  </div>
                </SelectItem>
                <SelectItem value="gtl">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary-100" />
                    <span>GTL</span>
                  </div>
                </SelectItem>
                <SelectItem value="mission">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-primary-100" />
                    <span>Mission</span>
                  </div>
                </SelectItem>
                <SelectSeparator />
                <div className="px-2 py-2 flex items-center gap-2">
                  <Checkbox 
                    id="manual-ops" 
                    checked={includeManual} 
                    onCheckedChange={checked => setIncludeManual(checked as boolean)} 
                    className="data-[state=checked]:bg-primary-200 border-outline-primary h-5 w-5" 
                  />
                  <Label 
                    htmlFor="manual-ops" 
                    className="text-text-icon-01 cursor-pointer text-sm"
                  >
                    Include manual operations
                  </Label>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-400 flex flex-col sm:flex-row sm:items-center gap-400 justify-end">
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
            <ChevronDown 
              className={cn(
                "ml-1 h-3 w-3 transition-transform duration-200", 
                showAdvancedFilters && "transform rotate-180"
              )} 
            />
          </Button>
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
