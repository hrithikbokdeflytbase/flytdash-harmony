
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DateRangeFilter, { DateRangeType } from '@/components/dashboard/DateRangeFilter';
import MetricCard from '@/components/dashboard/MetricCard';
import FlightTimeline from '@/components/dashboard/FlightTimeline';
import RecentFlightsTable from '@/components/dashboard/RecentFlightsTable';
import { Calendar, AlertCircle, Loader } from 'lucide-react';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('this-month');
  const [timelineView, setTimelineView] = useState<'total' | 'status'>('total');
  
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
    <DashboardLayout title="Flight Logs Dashboard">
      <div className="mb-600">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="fb-mega text-text-icon-01">Flight Logs Dashboard</h1>
            <p className="fb-body2-regular text-text-icon-02 mt-100">Monitor drone operations and flight logs</p>
          </div>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="flybase-card p-400 mb-600">
        <DateRangeFilter 
          currentRange={dateRange} 
          onRangeChange={handleDateRangeChange} 
          isLoading={isLoading}
        />
      </div>
      
      {/* Dashboard Overview Section */}
      <div className="mb-600">
        <h2 className="fb-title1-medium text-text-icon-01 mb-400">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-400">
          <MetricCard
            title="Total Flights"
            value={isLoading ? <Loader className="w-6 h-6 animate-spin text-primary-100" /> : "287"}
            icon={Calendar}
            trend={{ value: 12, isPositive: true }}
            iconColor="text-primary-100"
            iconBgColor="bg-container-info"
            className="w-full"
          />
          <MetricCard
            title="Failed Flights"
            value={isLoading ? <Loader className="w-6 h-6 animate-spin text-error-200" /> : "24"}
            icon={AlertCircle}
            trend={{ value: 5, isPositive: false }}
            iconColor="text-error-200"
            iconBgColor="bg-container-error"
            className="w-full"
          />
        </div>
      </div>
      
      {/* Flight Timeline Section */}
      <div className="flybase-card p-400 mb-600">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-400">
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
        
        <FlightTimeline 
          viewType={timelineView} 
          dateRange={dateRange} 
          isLoading={isLoading} 
        />
      </div>
      
      {/* Recent Flights Section */}
      <div className="flybase-card p-400 mb-600">
        <h2 className="fb-title1-medium text-text-icon-01 mb-400">Recent Flights</h2>
        <RecentFlightsTable isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default Index;
