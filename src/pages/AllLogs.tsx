
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DateRangeType } from '@/components/dashboard/DateRangeFilter';
import RecentFlightsTable from '@/components/dashboard/RecentFlightsTable';
import FiltersBar from '@/components/dashboard/FiltersBar';
import { useLocation } from 'react-router-dom';
import { parse } from 'date-fns';

// Helper function to parse date from URL parameter
const parseDateParam = (param: string | null): Date | undefined => {
  if (!param) return undefined;
  try {
    // Parse date in format yyyy-MM-dd
    const date = parse(param, 'yyyy-MM-dd', new Date());
    return isNaN(date.getTime()) ? undefined : date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return undefined;
  }
};

const AllLogs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('monthly');
  const location = useLocation();
  
  // Parse URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    
    // If we have date parameters in the URL, use them
    if (fromParam) {
      const fromDate = parseDateParam(fromParam);
      const toDate = parseDateParam(toParam);
      
      if (fromDate) {
        // Simulate loading state for demonstration
        setIsLoading(true);
        
        // Update date range type based on provided dates
        if (fromParam === toParam) {
          setDateRange('daily');
        } else {
          // Determine if it's weekly or monthly based on date difference
          // This is a simplification and might need refinement
          setDateRange('monthly');
        }
        
        // Simulate API fetch delay
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    }
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
