
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusCard from '@/components/dashboard/StatusCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickStats from '@/components/dashboard/QuickStats';
import { 
  Drone, 
  FileText, 
  BarChart2, 
  AlertCircle, 
  Plus 
} from 'lucide-react';

const recentActivities = [
  {
    id: '1',
    description: 'Inspection report generated for Site A',
    time: '10 min ago',
    type: 'success' as const,
  },
  {
    id: '2',
    description: 'Battery warning for Drone #DJI-003',
    time: '45 min ago',
    type: 'warning' as const,
  },
  {
    id: '3',
    description: 'New flight mission scheduled for tomorrow',
    time: '2 hours ago',
    type: 'info' as const,
  },
  {
    id: '4',
    description: 'Failed to upload data from Drone #DJI-005',
    time: '5 hours ago',
    type: 'error' as const,
  },
];

const Index = () => {
  return (
    <DashboardLayout title="Report Generator">
      <div className="mb-600">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="fb-mega text-text-icon-01">Dashboard Overview</h1>
            <p className="fb-body2-regular text-text-icon-02 mt-100">Monitor drone operations and reporting status</p>
          </div>
          
          <button className="flybase-button-primary flex items-center space-x-200 mt-300 sm:mt-0">
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-400">
        <StatusCard 
          title="Active Drones" 
          value="12" 
          icon={Drone} 
          iconColor="text-primary-100" 
          iconBgColor="bg-container-info"
          trend={{ value: 20, isPositive: true }}
        />
        <StatusCard 
          title="Reports Generated" 
          value="37" 
          icon={FileText} 
          iconColor="text-success-200" 
          iconBgColor="bg-container-success"
          trend={{ value: 15, isPositive: true }}
        />
        <StatusCard 
          title="Data Processing" 
          value="65%" 
          icon={BarChart2} 
          iconColor="text-warning-200" 
          iconBgColor="bg-container-warning"
          trend={{ value: 5, isPositive: false }}
        />
        <StatusCard 
          title="Pending Alerts" 
          value="3" 
          icon={AlertCircle} 
          iconColor="text-error-200" 
          iconBgColor="bg-container-error"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-400 mt-600">
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivities} />
        </div>
        <div>
          <QuickStats />
        </div>
      </div>
      
      <div className="mt-600 flybase-card p-400">
        <div className="flex items-center justify-between mb-400">
          <h3 className="fb-title1-medium text-text-icon-01">Recent Reports</h3>
          <button className="fb-body2-regular text-primary-100 flex items-center hover:underline">
            <span>View all reports</span>
            <ArrowRight className="w-4 h-4 ml-100" />
          </button>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-outline-primary text-left">
              <th className="pb-300 fb-body4-medium text-text-icon-02">Report Name</th>
              <th className="pb-300 fb-body4-medium text-text-icon-02 hidden sm:table-cell">Created</th>
              <th className="pb-300 fb-body4-medium text-text-icon-02 hidden md:table-cell">Author</th>
              <th className="pb-300 fb-body4-medium text-text-icon-02">Status</th>
              <th className="pb-300 fb-body4-medium text-text-icon-02 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((item) => (
              <tr 
                key={item} 
                className="border-b border-outline-primary hover:bg-surface-states-hover cursor-pointer transition-colors"
              >
                <td className="py-300 fb-body2-regular text-text-icon-01">Site Inspection {item}</td>
                <td className="py-300 fb-body2-regular text-text-icon-02 hidden sm:table-cell">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="py-300 fb-body2-regular text-text-icon-02 hidden md:table-cell">Admin User</td>
                <td className="py-300">
                  <span className="bg-container-success text-success-200 text-tiny1-medium px-200 py-50 rounded-full">
                    Completed
                  </span>
                </td>
                <td className="py-300 text-right">
                  <button className="text-text-icon-02 hover:text-text-icon-01 p-100">
                    <FileText className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Index;
