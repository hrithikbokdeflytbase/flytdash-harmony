
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

type DateRangeType = 'today' | 'this-week' | 'this-month' | 'custom';

interface DateRangeFilterProps {
  currentRange: DateRangeType;
  onRangeChange: (range: DateRangeType) => void;
  isLoading?: boolean;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  currentRange,
  onRangeChange,
  isLoading = false
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  const handleCustomDateSubmit = () => {
    if (startDate && endDate) {
      onRangeChange('custom');
      setShowCustomPicker(false);
    }
  };
  
  const formatDateDisplay = () => {
    switch (currentRange) {
      case 'today':
        return 'Today';
      case 'this-week':
        return 'This Week';
      case 'this-month':
        return 'This Month';
      case 'custom':
        if (startDate && endDate) {
          return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
        }
        return 'Custom Range';
      default:
        return 'Select Date Range';
    }
  };
  
  return (
    <div className="flex flex-col space-y-300 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="fb-title1-medium text-text-icon-01">Flight Date Range</h3>
        <p className="fb-body2-regular text-text-icon-02">Filter flight data by date</p>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-300 sm:space-y-0 sm:space-x-300">
        <div className="flex space-x-200">
          <button
            onClick={() => onRangeChange('today')}
            disabled={isLoading}
            className={`px-300 py-200 rounded-200 text-sm transition-colors ${
              currentRange === 'today'
                ? 'bg-primary-200 text-text-icon-01'
                : 'bg-background-level-3 text-text-icon-02 hover:bg-surface-states-hover hover:text-text-icon-01'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onRangeChange('this-week')}
            disabled={isLoading}
            className={`px-300 py-200 rounded-200 text-sm transition-colors ${
              currentRange === 'this-week'
                ? 'bg-primary-200 text-text-icon-01'
                : 'bg-background-level-3 text-text-icon-02 hover:bg-surface-states-hover hover:text-text-icon-01'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => onRangeChange('this-month')}
            disabled={isLoading}
            className={`px-300 py-200 rounded-200 text-sm transition-colors ${
              currentRange === 'this-month'
                ? 'bg-primary-200 text-text-icon-01'
                : 'bg-background-level-3 text-text-icon-02 hover:bg-surface-states-hover hover:text-text-icon-01'
            }`}
          >
            This Month
          </button>
        </div>
        
        <button
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          disabled={isLoading}
          className={`flex items-center space-x-200 px-300 py-200 rounded-200 text-sm transition-colors ${
            currentRange === 'custom' || showCustomPicker
              ? 'bg-primary-200 text-text-icon-01'
              : 'bg-background-level-3 text-text-icon-02 hover:bg-surface-states-hover hover:text-text-icon-01'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>{formatDateDisplay()}</span>
        </button>
        
        {showCustomPicker && (
          <div className="absolute right-0 mt-16 bg-background-level-2 rounded-200 p-400 shadow-lg border border-outline-primary z-10">
            <div className="text-text-icon-01 mb-300">
              <p className="fb-body1-medium">Custom Date Range</p>
              <p className="fb-body2-regular text-text-icon-02 mt-100">Select start and end dates</p>
            </div>
            <div className="space-y-300">
              <div>
                <label className="fb-body2-regular text-text-icon-02 block mb-100">Start Date</label>
                <input 
                  type="date" 
                  className="w-full bg-background-level-3 border border-outline-primary rounded-200 px-300 py-200 text-text-icon-01 focus:border-primary-100"
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                />
              </div>
              <div>
                <label className="fb-body2-regular text-text-icon-02 block mb-100">End Date</label>
                <input 
                  type="date" 
                  className="w-full bg-background-level-3 border border-outline-primary rounded-200 px-300 py-200 text-text-icon-01 focus:border-primary-100"
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                />
              </div>
              <div className="flex justify-end space-x-200 mt-300">
                <button 
                  onClick={() => setShowCustomPicker(false)}
                  className="px-300 py-200 rounded-200 text-sm bg-background-level-3 text-text-icon-02 hover:bg-surface-states-hover hover:text-text-icon-01"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCustomDateSubmit}
                  disabled={!startDate || !endDate}
                  className="px-300 py-200 rounded-200 text-sm bg-primary-200 text-text-icon-01 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
