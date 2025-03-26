
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DateRangeValue } from '@/components/dashboard/DateRangeFilter';
import RecentFlightsTable from '@/components/dashboard/RecentFlightsTable';
import AllFlightsFiltersBar from '@/components/dashboard/AllFlightsFiltersBar';
import { useLocation } from 'react-router-dom';
import { parse } from 'date-fns';
import { toast } from "sonner";

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
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: undefined, to: undefined });
  const location = useLocation();
  
  // Parse URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    
    console.log("URL parameters:", { fromParam, toParam });
    
    // If we have date parameters in the URL, use them
    if (fromParam) {
      const fromDate = parseDateParam(fromParam);
      const toDate = parseDateParam(toParam);
      
      console.log("Parsed dates:", { fromDate, toDate });
      
      if (fromDate) {
        // Simulate loading state for demonstration
        setIsLoading(true);
        
        // Update date range with parsed dates
        setDateRange({
          from: fromDate,
          to: toDate
        });
        
        // Show toast notification
        if (toDate) {
          toast.success(`Filtered from ${fromParam} to ${toParam}`);
        } else {
          toast.success(`Filtered to ${fromParam}`);
        }
        
        // Simulate API fetch delay
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    }
  }, [location.search]);
  
  // Handle date range changes
  const handleDateRangeChange = (range: DateRangeValue) => {
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
      
      {/* Filters Section - Now using AllFlightsFiltersBar which has DateRangePicker */}
      <div className="mb-600">
        <AllFlightsFiltersBar
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
