
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { X, ChevronDown, AlertTriangle, FileText, Activity } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

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
    flights: [
      { id: 'Flight #1204', date: 'Mar 19', type: 'Site Survey', details: 'Aircraft Detected: 1.8km NE, 380ft above' },
      { id: 'Flight #1198', date: 'Mar 18', type: 'Perimeter Scan', details: 'Restricted Airspace: 800m ahead' },
      { id: 'Flight #1187', date: 'Mar 16', type: 'Equipment Check', details: 'Aircraft Approaching: 2.5km SW, 600ft above' },
    ]
  },
  {
    cause: 'Weather Conditions',
    count: 3,
    flights: [
      { id: 'Flight #1201', date: 'Mar 20', type: 'Inspection', details: 'High Wind Speed: 13.4 m/s, gusting to 16 m/s' },
      { id: 'Flight #1195', date: 'Mar 17', type: 'Site Survey', details: 'Rain Detected in operation area' },
      { id: 'Flight #1183', date: 'Mar 15', type: 'GTL', details: 'Lightning Risk: detected within 8km' },
    ]
  },
  {
    cause: 'Zone Violations',
    count: 3,
    flights: [
      { id: 'Flight #1192', date: 'Mar 17', type: 'Manual Flight', details: 'NFZ Breach: 40m from No-Fly Zone boundary' },
      { id: 'Flight #1185', date: 'Mar 16', type: 'Mission', details: 'Geofence Breach: 80m from boundary' },
      { id: 'Flight #1176', date: 'Mar 14', type: 'Perimeter Scan', details: 'Max Altitude Limit: Exceeded by 15m' },
    ]
  },
  {
    cause: 'Navigation Issues',
    count: 2,
    flights: [
      { id: 'Flight #1178', date: 'Mar 14', type: 'Infrastructure', details: 'GPS Signal Loss (8/14 satellites)' },
      { id: 'Flight #1177', date: 'Mar 14', type: 'Inspection', details: 'Compass Interference Detected' },
    ]
  },
  {
    cause: 'Battery Issues',
    count: 2,
    flights: [
      { id: 'Flight #1190', date: 'Mar 16', type: 'GTL', details: 'Critical Battery Level (12%)' },
      { id: 'Flight #1186', date: 'Mar 15', type: 'Site Survey', details: 'Battery Cell Imbalance (0.4V)' },
    ]
  },
  {
    cause: 'System Failures',
    count: 2,
    flights: [
      { id: 'Flight #1188', date: 'Mar 16', type: 'Mission', details: 'IMU Calibration Error' },
      { id: 'Flight #1182', date: 'Mar 15', type: 'Manual Flight', details: 'Flight Controller Malfunction' },
    ]
  }
];

const FailedFlightsPopup = ({ open, onOpenChange, failedCount, totalCount }: FailedFlightsPopupProps) => {
  const failureRate = totalCount > 0 ? ((failedCount / totalCount) * 100).toFixed(1) : '0';

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

        <div className="py-4 border-b border-outline-primary">
          <h3 className="text-sm font-semibold text-text-icon-02 mb-3">FAILED FLIGHTS BY CAUSE</h3>
          
          <Accordion type="single" collapsible className="w-full">
            {failureData.map((category, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-outline-primary last:border-0"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex justify-between items-center w-full pr-2">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-error-200 mr-3"></div>
                      <span className="text-text-icon-01">{category.cause}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-error-200 font-medium mr-6">{category.count}</span>
                      <ChevronDown className="h-4 w-4 text-text-icon-02 shrink-0 transition-transform duration-200" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 pt-1">
                  <div className="rounded-md bg-background-level-3 p-3">
                    <div className="space-y-3">
                      {category.flights.map((flight, flightIndex) => (
                        <div key={flightIndex} className="flex flex-col">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-text-icon-01">{flight.id}</span>
                            <span className="text-sm text-text-icon-02">{flight.date}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-text-icon-02">Type: {flight.type}</span>
                          </div>
                          <div className="flex items-start">
                            <FileText className="h-4 w-4 text-text-icon-02 mt-0.5 mr-2" />
                            <span className="text-sm text-text-icon-02">{flight.details}</span>
                          </div>
                          {flightIndex < category.flights.length - 1 && (
                            <div className="border-t border-outline-primary my-2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="py-4">
          <h3 className="text-sm font-semibold text-text-icon-02 mb-3">FAILURE PATTERN ANALYSIS</h3>
          
          <div className="rounded-md bg-background-level-3 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="h-5 w-5 text-warning-200" />
              <h4 className="text-text-icon-01 font-medium">Key Findings</h4>
            </div>
            <ul className="space-y-2 text-sm text-text-icon-02">
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>Airspace and weather issues account for 35% of all flight failures</span>
              </li>
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>Zone violations are most common during manual flight operations</span>
              </li>
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>Navigation issues increased by 15% in areas with dense foliage</span>
              </li>
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>Battery issues most frequently occur after 15 minutes of operation</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FailedFlightsPopup;
