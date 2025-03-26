import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DateRangeType } from '@/components/dashboard/DateRangeFilter';
import RecentFlightsTable from '@/components/dashboard/RecentFlightsTable';
import FiltersBar from '@/components/dashboard/FiltersBar';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateRangeValue } from '@/components/dashboard/DateRangeFilter';

const AllLogs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('monthly');
  const [customDateRange, setCustomDateRange] = useState<DateRangeValue>({ from: undefined, to: undefined });
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse URL query parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const fromParam = queryParams.get('from');
    const toParam = queryParams.get('to');
    const rangeParam = queryParams.get('range') as DateRangeType | null;
    
    // If we have from/to params, set custom date range
    if (fromParam && toParam) {
      const fromDate = new Date(fromParam);
      const toDate = new Date(toParam);
      
      // Only set if dates are valid
      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        setCustomDateRange({ from: fromDate, to: toDate });
        // Set range type if provided, otherwise default to 'custom'
        setDateRange(rangeParam || 'monthly');
        
        // Load data with new date range
        handleDateChange();
      }
    }
    
    // If only range param is provided
    else if (rangeParam && ['daily', 'weekly', 'monthly'].includes(rangeParam)) {
      setDateRange(rangeParam as DateRangeType);
      handleDateChange(rangeParam as DateRangeType);
    }
    
    // Clean up URL params after processing
    if (fromParam || toParam || rangeParam) {
      // Remove the query parameters from URL but keep the history
      navigate('/all-logs', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);
  
  // Simulate loading state for demonstration
  const handleDateRangeChange = (range: DateRangeType) => {
    setIsLoading(true);
    setDateRange(range);
    
    // Simulate API fetch delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  // Handle date changes with optional range parameter
  const handleDateChange = (range?: DateRangeType) => {
    setIsLoading(true);
    
    // If range is provided, use it
    if (range) {
      setDateRange(range);
    }
    
    // Simulate API fetch delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <DashboardLayout title="Flight Logs">
      <div className="mb-600">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="fb-mega text-text-icon-01">All Flight Logs</h1>
            <p className="fb-body2-regular text-text-icon-02 mt-100">Complete history of drone operations and flights</p>
          </div>
        </div>
      </div>
      
      {/* Improved Filters Section */}
      <div className="mb-600">
        <FiltersBar
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          isLoading={isLoading}
          customDateRange={customDateRange}
        />
      </div>
      
      {/* Flight Logs Table */}
      <div className="flybase-card p-400 mb-600 rounded-xl shadow-sm">
        <h2 className="fb-title1-medium text-text-icon-01 mb-400">Flight Logs</h2>
        <RecentFlightsTable isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default AllLogs;
