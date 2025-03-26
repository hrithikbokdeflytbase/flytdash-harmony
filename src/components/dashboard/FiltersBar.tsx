
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangeType, DateRangeValue } from './DateRangeFilter';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Filter, ChevronDown, RefreshCw } from 'lucide-react';
import AdvancedFilters from './AdvancedFilters';
import DateRangePicker from './DateRangePicker';

interface FiltersBarProps {
  dateRange: DateRangeType;
  onDateRangeChange: (range: DateRangeType) => void;
  isLoading?: boolean;
  customDateRange?: DateRangeValue;
}

const FiltersBar: React.FC<FiltersBarProps> = ({ 
  dateRange, 
  onDateRangeChange, 
  isLoading = false,
  customDateRange
}) => {
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeValue>(
    customDateRange || { from: undefined, to: undefined }
  );
  
  // Update state when customDateRange prop changes
  React.useEffect(() => {
    if (customDateRange && (customDateRange.from || customDateRange.to)) {
      setSelectedDateRange(customDateRange);
    }
  }, [customDateRange]);
  
  // Handle date range selection
  const handleDateRangeSelect = (value: string) => {
    if (value === 'custom') {
      // Only set to custom if there's a valid date range selected
      if (selectedDateRange.from && selectedDateRange.to) {
        onDateRangeChange('custom');
      }
    } else {
      onDateRangeChange(value as DateRangeType);
    }
  };
  
  // Handle date range picker change
  const handleDatePickerChange = (value: DateRangeValue) => {
    setSelectedDateRange(value);
    
    // If both dates are selected, automatically switch to custom range
    if (value.from && value.to) {
      onDateRangeChange('custom');
    }
  };
  
  // Reset filters
  const handleReset = () => {
    setSelectedDateRange({ from: undefined, to: undefined });
    onDateRangeChange('monthly');
  };
  
  return (
    <Card className="flybase-card border-none bg-background-level-2 shadow-sm">
      <CardHeader className="px-300 py-200 pb-0">
        <CardTitle className="fb-title2-medium text-text-icon-01">Filters</CardTitle>
      </CardHeader>
      <CardContent className="px-300 py-300">
        <div className="flex flex-col gap-400 md:flex-row md:items-end">
          <div className="w-full md:w-auto">
            <Label htmlFor="date-range" className="fb-body1-medium text-text-icon-02">Date Range</Label>
            <div className="mt-100 flex flex-col gap-200 md:flex-row">
              <Select 
                value={dateRange} 
                onValueChange={handleDateRangeSelect}
                disabled={isLoading}
              >
                <SelectTrigger 
                  id="date-range" 
                  className="w-full md:w-[180px] border-outline-primary bg-background-level-1"
                >
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="w-full md:w-auto">
                <DateRangePicker 
                  value={selectedDateRange}
                  onChange={handleDatePickerChange}
                  isDisabled={isLoading}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-300 flex space-x-200 md:ml-auto md:mt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReset}
                    disabled={isLoading}
                    className="border-outline-primary text-text-icon-01 bg-background-level-2 hover:bg-background-level-4 transition-colors"
                  >
                    <RefreshCw className="mr-200 h-4 w-4" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all filters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Advanced Filters Button - Placed next to Reset button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAdvancedFiltersOpen(true)}
              disabled={isLoading}
              className="border-outline-primary text-text-icon-01 bg-background-level-2 hover:bg-background-level-4 transition-colors"
            >
              <Filter className="mr-200 h-4 w-4" />
              More Filters
              <ChevronDown className="ml-100 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Advanced Filters Dialog */}
      <AdvancedFilters
        open={advancedFiltersOpen}
        onOpenChange={setAdvancedFiltersOpen}
      />
    </Card>
  );
};

export default FiltersBar;
