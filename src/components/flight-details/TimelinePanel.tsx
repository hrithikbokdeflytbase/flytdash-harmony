
import React from 'react';
import { Clock } from 'lucide-react';

const TimelinePanel: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 h-[400px] text-center p-4 text-text-icon-02 border border-dashed border-outline-primary mx-4 my-4 rounded-md">
      <Clock size={48} className="text-primary-200 opacity-50" />
      <div className="space-y-2">
        <h3 className="text-lg text-text-icon-01">Timeline View</h3>
        <p className="text-sm">Flight timeline details will be implemented in the next step.</p>
      </div>
    </div>
  );
};

export default TimelinePanel;
