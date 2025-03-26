
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DateRangeType } from '@/components/dashboard/DateRangeFilter';
import RecentFlightsTable from '@/components/dashboard/RecentFlightsTable';
import FiltersBar from '@/components/dashboard/FiltersBar';

const AllLogs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('monthly');
  
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
