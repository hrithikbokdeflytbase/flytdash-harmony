
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  // Example flight ID - this would normally come from your state or selection
  const exampleFlightId = "FLT-1234";
  
  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-800">
        {/* Dashboard content here */}
        
        {/* Add link to Flight Details page */}
        <div className="flybase-card p-600">
          <h2 className="fb-title1-semi mb-400">Flight Details</h2>
          <p className="text-text-icon-02 mb-600">View detailed flight information, telemetry data, and video playback.</p>
          <Button asChild className="flybase-button-primary">
            <Link to={`/flight-details/${exampleFlightId}`}>View Flight Details</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
