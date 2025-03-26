
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

// Sample failure data - in a real app, this would come from props or an API
const failureData = [
  {
    cause: 'Battery Failure',
    count: 2,
    flights: [
      { id: 'F-2023-05', date: '2023-09-15', drone: 'DJI-001', details: 'Battery depleted mid-flight' },
      { id: 'F-2023-12', date: '2023-09-22', drone: 'DJI-003', details: 'Battery connection issue' },
    ]
  },
  {
    cause: 'GPS Signal Loss',
    count: 2,
    flights: [
      { id: 'F-2023-08', date: '2023-09-18', drone: 'DJI-002', details: 'Lost GPS signal in urban canyon' },
      { id: 'F-2023-15', date: '2023-09-25', drone: 'DJI-005', details: 'Weak GPS signal in heavy foliage' },
    ]
  },
  {
    cause: 'Software Malfunction',
    count: 1,
    flights: [
      { id: 'F-2023-21', date: '2023-09-30', drone: 'DJI-004', details: 'Autopilot error during waypoint navigation' },
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
                            <span className="text-sm text-text-icon-02">Drone: {flight.drone}</span>
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
                <span>Battery failures account for 40% of all flight failures</span>
              </li>
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>GPS signal issues are most common in heavily forested areas</span>
              </li>
              <li className="flex items-start">
                <span className="text-warning-200 mr-2">•</span>
                <span>Software malfunctions increased by 15% after the latest firmware update</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FailedFlightsPopup;
