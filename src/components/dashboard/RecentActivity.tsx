
import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

const RecentActivity = ({ activities, className }: RecentActivityProps) => {
  const getStatusColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-container-success text-success-200';
      case 'warning':
        return 'bg-container-warning text-warning-200';
      case 'error':
        return 'bg-container-error text-error-200';
      case 'info':
      default:
        return 'bg-container-info text-info-200';
    }
  };

  return (
    <div className={cn("flybase-card p-400", className)}>
      <div className="flex items-center justify-between mb-400">
        <h3 className="fb-title1-medium text-text-icon-01">Recent Activity</h3>
        <button className="fb-body2-regular text-primary-100 flex items-center hover:underline">
          <span>View all</span>
          <ArrowRight className="w-4 h-4 ml-100" />
        </button>
      </div>
      
      <div className="space-y-300">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="p-300 border border-outline-primary rounded-150 hover:border-outline-secondary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-300">
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(activity.type))}></div>
                <p className="fb-body2-regular text-text-icon-01">{activity.description}</p>
              </div>
              <div className="flex items-center text-text-icon-02 fb-body5-regular">
                <Clock className="w-3 h-3 mr-100" />
                <span>{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
