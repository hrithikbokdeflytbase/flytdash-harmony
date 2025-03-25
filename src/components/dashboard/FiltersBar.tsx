
import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, Filter, RefreshCw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DateRangeType } from './DateRangeFilter';
import AdvancedFilters from './AdvancedFilters';
import FilterChip from './FilterChip';
import { cn } from '@/lib/utils';

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

  const resetFilters = () => {
    onDateRangeChange('monthly');
    setOperationType('all');
    setIncludeManual(false);
    setTriggerType('all');
    setSelectedDrones([]);
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
    <div className="rounded-200 overflow-hidden">
      <div className="bg-background-level-3 p-400">
        <div className="flex flex-col space-y-300 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-400">
          <div>
            <h3 className="fb-title1-medium text-text-icon-01">Flight Data Filters</h3>
            <p className="fb-body2-regular text-text-icon-02">Filter flight data</p>
          </div>

          <div className="flex flex-wrap gap-300 items-center">
            {/* Date Range Filter */}
            <div className="flex-1 min-w-[180px] sm:flex-none">
              <Select value={dateRange} onValueChange={(value) => onDateRangeChange(value as DateRangeType)}>
                <SelectTrigger 
                  disabled={isLoading}
                  className="flex gap-200 h-auto py-200 bg-background-level-2 border-outline-primary"
                >
                  <Calendar className="h-4 w-4 text-primary-100" />
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Operation Type Filter */}
            <div className="flex-1 min-w-[180px] sm:flex-none">
              <Select value={operationType} onValueChange={setOperationType}>
                <SelectTrigger 
                  disabled={isLoading}
                  className="h-auto py-200 bg-background-level-2 border-outline-primary"
                >
                  <SelectValue placeholder="Operation Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operations</SelectItem>
                  <SelectItem value="gtl">GTL</SelectItem>
                  <SelectItem value="mission">Mission</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Manual Operations Checkbox */}
            <div className="flex items-center space-x-200">
              <Checkbox 
                id="manual-ops" 
                checked={includeManual} 
                onCheckedChange={(checked) => setIncludeManual(checked as boolean)}
                className="data-[state=checked]:bg-primary-100"
              />
              <Label htmlFor="manual-ops" className="text-sm text-text-icon-01">
                Include manual
              </Label>
            </div>

            {/* Advanced Filters Button */}
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "border-outline-primary bg-background-level-2", 
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
                "ml-1 h-3 w-3 transition-transform", 
                showAdvancedFilters && "transform rotate-180"
              )} />
            </Button>

            {/* Reset Button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="border-outline-primary text-text-icon-01"
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
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mt-300 flex flex-wrap gap-200">
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

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <AdvancedFilters 
          triggerType={triggerType}
          setTriggerType={setTriggerType}
          selectedDrones={selectedDrones}
          setSelectedDrones={setSelectedDrones}
        />
      )}
    </div>
  );
};

export default FiltersBar;
