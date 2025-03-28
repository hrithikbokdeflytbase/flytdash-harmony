import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X, ChevronRight, AlertTriangle, Activity, Wind, MapPin, AlertCircle, Shield, Battery, Cpu, Eye, EyeOff, Circle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
interface FailedFlightsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  failedCount: number;
  totalCount: number;
}

// Define error severity types
type ErrorSeverity = 'critical' | 'warning';
interface FlightError {
  id: string;
  date: string;
  missionName: string;
  missionType: string;
  isManualControl: boolean;
  details: string;
  severity: ErrorSeverity;
}
interface ErrorCategory {
  cause: string;
  count: number;
  icon: React.ElementType;
  flights: FlightError[];
}

// Updated failure data with new format and generic error messages
const failureData: ErrorCategory[] = [{
  cause: 'Airspace Issues',
  count: 3,
  icon: AlertCircle,
  flights: [{
    id: '1204',
    date: 'Mar 19, 9:30 AM',
    missionName: 'Site Survey',
    missionType: 'GTL',
    isManualControl: false,
    details: 'Aircraft Detected',
    severity: 'critical'
  }, {
    id: '1198',
    date: 'Mar 18, 11:15 AM',
    missionName: 'Perimeter Inspection',
    missionType: 'Mission',
    isManualControl: false,
    details: 'Restricted Airspace',
    severity: 'critical'
  }, {
    id: '1187',
    date: 'Mar 16, 2:20 PM',
    missionName: 'Equipment Check',
    missionType: 'Manual',
    isManualControl: true,
    details: 'Aircraft Approaching',
    severity: 'warning'
  }]
}, {
  cause: 'Weather Conditions',
  count: 3,
  icon: Wind,
  flights: [{
    id: '1201',
    date: 'Mar 20, 10:45 AM',
    missionName: 'Facility Inspection',
    missionType: 'GTL',
    isManualControl: true,
    details: 'High Wind Speed',
    severity: 'warning'
  }, {
    id: '1195',
    date: 'Mar 17, 8:30 AM',
    missionName: 'Site Survey',
    missionType: 'Mission',
    isManualControl: false,
    details: 'Rain Detected',
    severity: 'critical'
  }, {
    id: '1183',
    date: 'Mar 15, 4:10 PM',
    missionName: 'Tower Inspection',
    missionType: 'GTL',
    isManualControl: false,
    details: 'Lightning Risk',
    severity: 'critical'
  }]
}, {
  cause: 'Zone Violations',
  count: 3,
  icon: Shield,
  flights: [{
    id: '1192',
    date: 'Mar 17, 1:25 PM',
    missionName: 'Boundary Survey',
    missionType: 'Manual',
    isManualControl: true,
    details: 'NFZ Breach',
    severity: 'critical'
  }, {
    id: '1185',
    date: 'Mar 16, 11:50 AM',
    missionName: 'Perimeter Check',
    missionType: 'Mission',
    isManualControl: false,
    details: 'Geofence Breach',
    severity: 'warning'
  }, {
    id: '1176',
    date: 'Mar 14, 9:20 AM',
    missionName: 'Site Mapping',
    missionType: 'GTL',
    isManualControl: false,
    details: 'Max Altitude Limit',
    severity: 'warning'
  }]
}, {
  cause: 'Navigation Issues',
  count: 2,
  icon: MapPin,
  flights: [{
    id: '1178',
    date: 'Mar 14, 3:35 PM',
    missionName: 'Infrastructure Check',
    missionType: 'Mission',
    isManualControl: false,
    details: 'GPS Signal Loss',
    severity: 'warning'
  }, {
    id: '1177',
    date: 'Mar 14, 10:15 AM',
    missionName: 'Area Inspection',
    missionType: 'GTL',
    isManualControl: false,
    details: 'Compass Interference',
    severity: 'warning'
  }]
}, {
  cause: 'Battery Issues',
  count: 2,
  icon: Battery,
  flights: [{
    id: '1190',
    date: 'Mar 16, 5:10 PM',
    missionName: 'Emergency Assessment',
    missionType: 'GTL',
    isManualControl: true,
    details: 'Critical Battery Level',
    severity: 'critical'
  }, {
    id: '1186',
    date: 'Mar 15, 1:45 PM',
    missionName: 'Site Survey',
    missionType: 'Mission',
    isManualControl: false,
    details: 'Battery Cell Imbalance',
    severity: 'warning'
  }]
}, {
  cause: 'System Failures',
  count: 2,
  icon: Cpu,
  flights: [{
    id: '1188',
    date: 'Mar 16, 8:30 AM',
    missionName: 'Structure Inspection',
    missionType: 'Mission',
    isManualControl: false,
    details: 'IMU Calibration Error',
    severity: 'critical'
  }, {
    id: '1182',
    date: 'Mar 15, 11:05 AM',
    missionName: 'Equipment Test',
    missionType: 'Manual',
    isManualControl: true,
    details: 'Flight Controller Malfunction',
    severity: 'critical'
  }]
}];
const LOCAL_STORAGE_KEY = 'viewed_flights';
const FailedFlightsPopup = ({
  open,
  onOpenChange,
  failedCount,
  totalCount
}: FailedFlightsPopupProps) => {
  const failureRate = totalCount > 0 ? (failedCount / totalCount * 100).toFixed(1) : '0';
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    toast
  } = useToast();
  const [viewedFlights, setViewedFlights] = useState<string[]>([]);
  const [showUnreviewedOnly, setShowUnreviewedOnly] = useState(false);
  const [isPatternCollapsed, setIsPatternCollapsed] = useState(false);

  // Calculate critical and warning counts
  const criticalCount = failureData.flatMap(category => category.flights.filter(flight => flight.severity === 'critical')).length;
  const warningCount = failureData.flatMap(category => category.flights.filter(flight => flight.severity === 'warning')).length;
  useEffect(() => {
    // Load viewed flights from localStorage
    const storedViewedFlights = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedViewedFlights) {
      setViewedFlights(JSON.parse(storedViewedFlights));
    }

    // Prevent body scrolling when modal is open
    if (open) {
      document.body.style.overflow = 'hidden';
      // Reset scroll position when popup opens
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Function to mark a flight as viewed
  const markFlightAsViewed = (flightId: string) => {
    if (!viewedFlights.includes(flightId)) {
      const updatedViewedFlights = [...viewedFlights, flightId];
      setViewedFlights(updatedViewedFlights);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedViewedFlights));
    }
  };

  // Function to get the appropriate color class based on severity
  const getSeverityColorClass = (severity: ErrorSeverity): string => {
    return severity === 'critical' ? 'text-error-200' : 'text-caution-200';
  };
  const handleFlightClick = (flightId: string) => {
    markFlightAsViewed(flightId);

    // Show toast notification
    toast({
      title: "Flight details",
      description: `Viewing details for flight`
    });

    // Navigate to flight details page
    navigate(`/flight-details/${flightId}`);
    onOpenChange(false);
  };
  const filteredCategories = failureData.map(category => ({
    ...category,
    flights: showUnreviewedOnly ? category.flights.filter(flight => !viewedFlights.includes(flight.id)) : category.flights
  }));
  const toggleShowUnreviewed = () => {
    setShowUnreviewedOnly(!showUnreviewedOnly);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-3xl bg-background-level-2 border-outline-primary p-3 flex flex-col max-h-[80vh]", isMobile && "h-[90vh]")}>
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-outline-primary mb-2 sticky top-0 z-10 bg-background-level-2">
          <DialogTitle className="text-text-icon-01 text-xl">
            Failed Flights ({failedCount} of {totalCount} total)
          </DialogTitle>
          <DialogClose className="rounded-full p-1 hover:bg-background-level-3">
            <X className="h-5 w-5 text-text-icon-02" />
          </DialogClose>
        </DialogHeader>

        <div className="py-2 border-b border-outline-primary mb-2 sticky top-12 z-10 bg-background-level-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-error-200" />
              <h3 className="text-md font-medium text-text-icon-01">
                {failedCount} flights failed ({failureRate}% failure rate)
              </h3>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Circle className="h-3 w-3 text-error-200 fill-error-200" />
                <span className="text-xs text-text-icon-02">{criticalCount} critical</span>
              </div>
              <div className="flex items-center gap-1">
                <Circle className="h-3 w-3 text-caution-200 fill-caution-200" />
                <span className="text-xs text-text-icon-02">{warningCount} warnings</span>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleShowUnreviewed} className="text-xs h-8 px-2 flex items-center gap-1">
                {showUnreviewedOnly ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {showUnreviewedOnly ? 'Show all' : 'Unreviewed only'}
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className={cn("flex-grow overflow-y-auto", isMobile ? "max-h-[calc(90vh-180px)]" : "max-h-[calc(80vh-180px)]")}>
          <div className="pr-3">
            <h3 className="text-sm font-semibold text-text-icon-02 mb-2">FAILED FLIGHTS BY CAUSE</h3>
            
            <div className="space-y-2">
              {filteredCategories.map((category, index) => {
              const IconComponent = category.icon;

              // Skip empty categories when filtering
              if (category.flights.length === 0) return null;
              return <Collapsible key={index} defaultOpen={true} className="w-full border border-outline-primary rounded-md overflow-hidden">
                    <CollapsibleTrigger className="w-full p-2 bg-background-level-3 flex justify-between items-center hover:bg-background-level-4 transition-colors">
                      <div className="flex items-center">
                        <IconComponent className="h-4 w-4 text-error-200 mr-2" />
                        <span className="text-sm text-text-icon-01">{category.cause} ({category.flights.length})</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-text-icon-02 transform transition-all duration-200 data-[state=open]:rotate-90" />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="bg-background-level-3 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up transition-all duration-300 ease-in-out">
                      {category.flights.map((flight, flightIndex) => {
                    const isViewed = viewedFlights.includes(flight.id);
                    return <div key={flightIndex} className={cn("p-2 cursor-pointer hover:bg-background-level-4 transition-colors active:bg-background-level-3 group", flightIndex > 0 && "border-t border-t-outline-primary border-opacity-50")} onClick={() => handleFlightClick(flight.id)}>
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col flex-grow">
                                <div className="flex items-center gap-2">
                                  <Circle className={cn("h-2.5 w-2.5 fill-current", flight.severity === 'critical' ? "text-error-200" : "text-caution-200")} />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium text-text-icon-01">{flight.missionName}</span>
                                    {isViewed && <div className="flex items-center gap-1 bg-background-level-4 px-1 py-0.5 rounded-sm mt-1">
                                        <Eye className="h-3 w-3 text-text-icon-02 opacity-70" />
                                        <span className="text-[10px] text-text-icon-02 opacity-70">Viewed</span>
                                      </div>}
                                    <div className="flex items-center">
                                      <span className="text-xs text-text-icon-02">{flight.missionType}</span>
                                      <span className="text-xs text-text-icon-02 ml-1">(Manual control: {flight.isManualControl ? 'Yes' : 'No'})</span>
                                    </div>
                                    <span className="text-xs text-text-icon-02">{flight.date}</span>
                                    <div className={cn("text-xs mt-1", getSeverityColorClass(flight.severity))}>
                                      {flight.details}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center mt-1">
                                <Button variant="ghost" size="sm" className="h-6 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[10px]">View Details</span>
                                </Button>
                                <ChevronRight className="h-3.5 w-3.5 text-text-icon-02 transform group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>;
                  })}
                    </CollapsibleContent>
                  </Collapsible>;
            })}
            </div>
          </div>
        </ScrollArea>

        <Collapsible defaultOpen={!isPatternCollapsed} onOpenChange={isOpen => setIsPatternCollapsed(!isOpen)} className="rounded-md bg-background-level-3 overflow-hidden mt-2 sticky bottom-0">
          
          
          <CollapsibleContent>
            
          </CollapsibleContent>
        </Collapsible>
      </DialogContent>
    </Dialog>;
};
export default FailedFlightsPopup;