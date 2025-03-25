
import React from 'react';
import { Calendar } from 'lucide-react';

export type DateRangeType = 'daily' | 'weekly' | 'monthly';

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
  const formatDateDisplay = () => {
    switch (currentRange) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
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
      
      <div className="flex items-center space-x-300">
        <div className="flex space-x-200 bg-background-level-3 rounded-full p-100">
          <button
            onClick={() => onRangeChange('monthly')}
            disabled={isLoading}
            className={`px-300 py-200 rounded-full text-sm transition-colors ${
              currentRange === 'monthly'
                ? 'bg-primary-200 text-text-icon-01'
                : 'text-text-icon-02 hover:bg-surface-states-hover hover:text-text-icon-01'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => onRangeChange('weekly')}
            disabled={isLoading}
            className={`px-300 py-200 rounded-full text-sm transition-colors ${
              currentRange === 'weekly'
                ? 'bg-primary-200 text-text-icon-01'
                : 'text-text-icon-02 hover:bg-surface-states-hover hover:text-text-icon-01'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => onRangeChange('daily')}
            disabled={isLoading}
            className={`px-300 py-200 rounded-full text-sm transition-colors ${
              currentRange === 'daily'
                ? 'bg-primary-200 text-text-icon-01'
                : 'text-text-icon-02 hover:bg-surface-states-hover hover:text-text-icon-01'
            }`}
          >
            Daily
          </button>
        </div>
        
        <div className="flex items-center space-x-200 px-300 py-100 bg-background-level-3 rounded-full">
          <Calendar className="h-4 w-4 text-primary-100" />
          <span className="text-sm text-text-icon-01">{formatDateDisplay()}</span>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
