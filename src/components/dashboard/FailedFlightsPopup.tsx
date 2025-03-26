
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { 
  X, 
  ChevronRight, 
  AlertTriangle, 
  Activity, 
  Wind, 
  MapPin, 
  AlertCircle,
  Shield,
  Battery,
  Cpu
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface FailedFlightsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  failedCount: number;
  totalCount: number;
}

// Updated failure data with the specified categories and examples
const failureData = [
  {
    cause: 'Airspace Issues',
    count: 3,
    icon: AlertCircle,
    flights: [
      { id: 'Flight #1204', date: 'Mar 19', type: 'Site Survey', details: 'Aircraft Detected: 1.8km NE, 380ft above' },
      { id: 'Flight #1198', date: 'Mar 18', type: 'Perimeter Scan', details: 'Restricted Airspace: 800m ahead' },
      { id: 'Flight #1187', date: 'Mar 16', type: 'Equipment Check', details: 'Aircraft Approaching: 2.5km SW, 600ft above' },
    ]
  },
  {
    cause: 'Weather Conditions',
    count: 3,
    icon: Wind,
    flights: [
      { id: 'Flight #1201', date: 'Mar 20', type: 'Inspection', details: 'High Wind Speed: 13.4 m/s, gusting to 16 m/s' },
      { id: 'Flight #1195', date: 'Mar 17', type: 'Site Survey', details: 'Rain Detected in operation area' },
      { id: 'Flight #1183', date: 'Mar 15', type: 'GTL', details: 'Lightning Risk: detected within 8km' },
    ]
  },
  {
    cause: 'Zone Violations',
    count: 3,
    icon: Shield,
    flights: [
      { id: 'Flight #1192', date: 'Mar 17', type: 'Manual Flight', details: 'NFZ Breach: 40m from No-Fly Zone boundary' },
      { id: 'Flight #1185', date: 'Mar 16', type: 'Mission', details: 'Geofence Breach: 80m from boundary' },
      { id: 'Flight #1176', date: 'Mar 14', type: 'Perimeter Scan', details: 'Max Altitude Limit: Exceeded by 15m' },
    ]
  },
  {
    cause: 'Navigation Issues',
    count: 2,
    icon: MapPin,
    flights: [
      { id: 'Flight #1178', date: 'Mar 14', type: 'Infrastructure', details: 'GPS Signal Loss (8/14 satellites)' },
      { id: 'Flight #1177', date: 'Mar 14', type: 'Inspection', details: 'Compass Interference Detected' },
    ]
  },
  {
    cause: 'Battery Issues',
    count: 2,
    icon: Battery,
    flights: [
      { id: 'Flight #1190', date: 'Mar 16', type: 'GTL', details: 'Critical Battery Level (12%)' },
      { id: 'Flight #1186', date: 'Mar 15', type: 'Site Survey', details: 'Battery Cell Imbalance (0.4V)' },
    ]
  },
  {
    cause: 'System Failures',
    count: 2,
    icon: Cpu,
    flights: [
      { id: 'Flight #1188', date: 'Mar 16', type: 'Mission', details: 'IMU Calibration Error' },
      { id: 'Flight #1182', date: 'Mar 15', type: 'Manual Flight', details: 'Flight Controller Malfunction' },
    ]
  }
];

const FailedFlightsPopup = ({ open, onOpenChange, failedCount, totalCount }: FailedFlightsPopupProps) => {
  const failureRate = totalCount > 0 ? ((failedCount / totalCount) * 100).toFixed(1) : '0';
  const navigate = useNavigate();

  const handleFlightClick = (flightId: string) => {
    // Simulate navigation to flight detail page
    console.log(`Navigating to flight detail: ${flightId}`);
    // Uncomment this when flight detail page is ready
    // navigate(`/flights/${flightId.replace('Flight #', '')}`);
    
    // Close the dialog after navigation
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-background-level-2 border-outline-primary">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-outline-primary">
          <DialogTitle className="text-text-icon-01 text-xl">
            Failed Flights ({failedCount} of {totalCount} total)
          </DialogTitle>
          <DialogClose className="rounded-full p-1 hover:bg-background-level-3">
            <X className="h-5 w-5 text-text-icon-02" />
          </DialogClose>
        </DialogHeader>

        <div className="py-4 border-b border-outline-primary">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-error-200" />
            <h3 className="text-lg font-medium text-text-icon-01">
              {failedCount} flights failed ({failureRate}% failure rate)
            </h3>
          </div>
        </div>

        <div className="py-4 border-b border-outline-primary max-h-[40vh] overflow-y-auto">
          <h3 className="text-sm font-semibold text-text-icon-02 mb-3">FAILED FLIGHTS BY CAUSE</h3>
          
          <div className="space-y-3">
            {failureData.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Collapsible key={index} defaultOpen={true} className="w-full border border-outline-primary rounded-md overflow-hidden">
                  <CollapsibleTrigger className="w-full p-3 bg-background-level-3 flex justify-between items-center hover:bg-background-level-4 transition-colors">
                    <div className="flex items-center">
                      <IconComponent className="h-5 w-5 text-error-200 mr-3" />
                      <span className="text-text-icon-01">{category.cause} ({category.count} flights)</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-icon-02 transform transition-transform ui-expanded:rotate-90" />
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="bg-background-level-3">
                    {category.flights.map((flight, flightIndex) => (
                      <div 
                        key={flightIndex}
                        className="p-3 border-t border-outline-primary cursor-pointer hover:bg-background-level-4 transition-colors"
                        onClick={() => handleFlightClick(flight.id)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-text-icon-01">{flight.id}</span>
                            <span className="text-sm text-text-icon-02 ml-3">{flight.date}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-text-icon-02" />
                        </div>
                        <div className="text-sm text-text-icon-02 mb-1">
                          {flight.type}
                        </div>
                        <div className="text-sm text-error-200">
                          {flight.details}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>

        <div className="py-4">
          <h3 className="text-sm font-semibold text-text-icon-02 mb-3">FAILURE PATTERN ANALYSIS</h3>
          
          <div className="rounded-md bg-background-level-3 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="h-5 w-5 text-warning-200" />
              <h4 className="text-text-icon-01 font-medium">Key Insights</h4>
            </div>
            <ul className="space-y-2 text-sm text-text-icon-02">
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>Most common cause: Wind Speed (60% of failures)</span>
              </li>
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>Most affected mission: Site Survey (40% of failures)</span>
              </li>
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>Failure threshold: Wind &gt; 12 m/s, GPS &lt; 4 satellites</span>
              </li>
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>Time pattern: 80% of failures occurred between 9am-12pm</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FailedFlightsPopup;
