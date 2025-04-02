
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DateRangeType } from '@/components/dashboard/DateRangeFilter';
import MetricCard from '@/components/dashboard/MetricCard';
import FlightTimeline from '@/components/dashboard/FlightTimeline';
import RecentFlightsTable from '@/components/dashboard/RecentFlightsTable';
import FiltersBar from '@/components/dashboard/FiltersBar';
import FailedFlightsPopup from '@/components/dashboard/FailedFlightsPopup';
import { AlertCircle, Calendar, Loader } from 'lucide-react';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('daily');
  const [timelineView, setTimelineView] = useState<'total' | 'status'>('total');
  const [failedFlightsPopupOpen, setFailedFlightsPopupOpen] = useState(false);
  
  // Simulate loading state for demonstration
  const handleDateRangeChange = (range: DateRangeType) => {
    setIsLoading(true);
    setDateRange(range);
    
    // Simulate API fetch delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Updated counts to match the failure data
  const totalFlights = 30;
  const failedFlights = 15; // Sum of all failures in the categories
  
  return (
    <DashboardLayout title="Flight Logs Dashboard">
      <div className="mb-500">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="fb-mega text-text-icon-01">Flight Logs Dashboard</h1>
            <p className="fb-body2-regular text-text-icon-02 mt-100">Monitor drone operations and flight logs</p>
          </div>
        </div>
      </div>
      
      {/* Improved Filters Section */}
      <div className="mb-400">
        <FiltersBar 
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          isLoading={isLoading}
        />
      </div>
      
      {/* Dashboard Overview Section */}
      <div className="mb-400">
        <h2 className="fb-title1-medium text-text-icon-01 mb-300">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-400">
          <MetricCard
            title="Total Flights"
            value={isLoading ? <Loader className="w-6 h-6 animate-spin text-primary-100" /> : totalFlights.toString()}
            icon={Calendar}
            trend={{ value: 12, isPositive: true }}
            iconColor="text-primary-100"
            iconBgColor="bg-container-info"
            className="w-full"
          />
          <MetricCard
            title="Failed Flights"
            value={isLoading ? <Loader className="w-6 h-6 animate-spin text-error-200" /> : failedFlights.toString()}
            icon={AlertCircle}
            trend={{ value: 5, isPositive: false }}
            iconColor="text-error-200"
            iconBgColor="bg-container-error"
            className="w-full cursor-pointer"
            onClick={() => setFailedFlightsPopupOpen(true)}
          />
        </div>
      </div>
      
      {/* Failed Flights Popup */}
      <FailedFlightsPopup 
        open={failedFlightsPopupOpen}
        onOpenChange={setFailedFlightsPopupOpen}
        failedCount={failedFlights}
        totalCount={totalFlights}
      />
      
      {/* Flight Timeline Section */}
      <div className="flybase-card p-300 mb-400 rounded-xl shadow-sm w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-300">
          <h2 className="fb-title1-medium text-text-icon-01">Flight Timeline</h2>
          <div className="flex items-center mt-200 sm:mt-0 space-x-200 bg-background-level-3 rounded-full p-100">
            <button 
              className={`px-300 py-100 rounded-full text-sm ${timelineView === 'total' ? 'bg-primary-200 text-text-icon-01' : 'text-text-icon-02 hover:text-text-icon-01'}`}
              onClick={() => setTimelineView('total')}
            >
              Total Flights
            </button>
            <button 
              className={`px-300 py-100 rounded-full text-sm ${timelineView === 'status' ? 'bg-primary-200 text-text-icon-01' : 'text-text-icon-02 hover:text-text-icon-01'}`}
              onClick={() => setTimelineView('status')}
            >
              Status Breakdown
            </button>
          </div>
        </div>
        
        <div className="w-full h-[350px]">
          <FlightTimeline 
            viewType={timelineView} 
            dateRange={dateRange} 
            isLoading={isLoading} 
          />
        </div>
      </div>
      
      {/* Recent Flights Section */}
      <div className="flybase-card p-400 mb-500 rounded-xl shadow-sm">
        <h2 className="fb-title1-medium text-text-icon-01 mb-400">Recent Flights</h2>
        <RecentFlightsTable isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default Index;

