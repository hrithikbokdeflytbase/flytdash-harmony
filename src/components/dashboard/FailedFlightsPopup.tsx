
import React, { useEffect, useState } from 'react';
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
  Cpu,
  Eye,
  EyeOff,
  Circle,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  type: string;
  details: string;
  severity: ErrorSeverity;
}

interface ErrorCategory {
  cause: string;
  count: number;
  icon: React.ElementType;
  flights: FlightError[];
}

// Updated failure data with generic error messages and severity levels
const failureData: ErrorCategory[] = [
  {
    cause: 'Airspace Issues',
    count: 3,
    icon: AlertCircle,
    flights: [
      { id: 'Flight #1204', date: 'Mar 19', type: 'Site Survey', details: 'Aircraft Detected', severity: 'critical' },
      { id: 'Flight #1198', date: 'Mar 18', type: 'Perimeter Scan', details: 'Restricted Airspace', severity: 'critical' },
      { id: 'Flight #1187', date: 'Mar 16', type: 'Equipment Check', details: 'Aircraft Approaching', severity: 'warning' },
    ]
  },
  {
    cause: 'Weather Conditions',
    count: 3,
    icon: Wind,
    flights: [
      { id: 'Flight #1201', date: 'Mar 20', type: 'Inspection', details: 'High Wind Speed', severity: 'warning' },
      { id: 'Flight #1195', date: 'Mar 17', type: 'Site Survey', details: 'Rain Detected', severity: 'critical' },
      { id: 'Flight #1183', date: 'Mar 15', type: 'GTL', details: 'Lightning Risk', severity: 'critical' },
    ]
  },
  {
    cause: 'Zone Violations',
    count: 3,
    icon: Shield,
    flights: [
      { id: 'Flight #1192', date: 'Mar 17', type: 'Manual Flight', details: 'NFZ Breach', severity: 'critical' },
      { id: 'Flight #1185', date: 'Mar 16', type: 'Mission', details: 'Geofence Breach', severity: 'warning' },
      { id: 'Flight #1176', date: 'Mar 14', type: 'Perimeter Scan', details: 'Max Altitude Limit', severity: 'warning' },
    ]
  },
  {
    cause: 'Navigation Issues',
    count: 2,
    icon: MapPin,
    flights: [
      { id: 'Flight #1178', date: 'Mar 14', type: 'Infrastructure', details: 'GPS Signal Loss', severity: 'warning' },
      { id: 'Flight #1177', date: 'Mar 14', type: 'Inspection', details: 'Compass Interference', severity: 'warning' },
    ]
  },
  {
    cause: 'Battery Issues',
    count: 2,
    icon: Battery,
    flights: [
      { id: 'Flight #1190', date: 'Mar 16', type: 'GTL', details: 'Critical Battery Level', severity: 'critical' },
      { id: 'Flight #1186', date: 'Mar 15', type: 'Site Survey', details: 'Battery Cell Imbalance', severity: 'warning' },
    ]
  },
  {
    cause: 'System Failures',
    count: 2,
    icon: Cpu,
    flights: [
      { id: 'Flight #1188', date: 'Mar 16', type: 'Mission', details: 'IMU Calibration Error', severity: 'critical' },
      { id: 'Flight #1182', date: 'Mar 15', type: 'Manual Flight', details: 'Flight Controller Malfunction', severity: 'critical' },
    ]
  }
];

const LOCAL_STORAGE_KEY = 'viewed_flights';

const FailedFlightsPopup = ({ open, onOpenChange, failedCount, totalCount }: FailedFlightsPopupProps) => {
  const failureRate = totalCount > 0 ? ((failedCount / totalCount) * 100).toFixed(1) : '0';
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [viewedFlights, setViewedFlights] = useState<string[]>([]);
  const [showUnreviewedOnly, setShowUnreviewedOnly] = useState(false);
  const [isPatternCollapsed, setIsPatternCollapsed] = useState(false);

  // Calculate critical and warning counts
  const criticalCount = failureData.flatMap(category => 
    category.flights.filter(flight => flight.severity === 'critical')
  ).length;
  
  const warningCount = failureData.flatMap(category => 
    category.flights.filter(flight => flight.severity === 'warning')
  ).length;

  useEffect(() => {
    // Load viewed flights from localStorage
    const storedViewedFlights = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedViewedFlights) {
      setViewedFlights(JSON.parse(storedViewedFlights));
    }
    
    // Prevent body scrolling when modal is open
    if (open) {
      document.body.style.overflow = 'hidden';
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
    console.log(`Navigating to flight detail: ${flightId}`);
    
    // Show toast notification
    toast({
      title: "Flight details",
      description: `Viewing details for ${flightId}`,
    });
    
    // Close the dialog after navigation
    // Uncomment this when flight detail page is ready
    // navigate(`/flights/${flightId.replace('Flight #', '')}`);
    // onOpenChange(false);
  };

  const filteredCategories = failureData.map(category => ({
    ...category,
    flights: showUnreviewedOnly 
      ? category.flights.filter(flight => !viewedFlights.includes(flight.id))
      : category.flights
  }));

  const toggleShowUnreviewed = () => {
    setShowUnreviewedOnly(!showUnreviewedOnly);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-3xl bg-background-level-2 border-outline-primary p-3",
          isMobile && "h-[90vh]"
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-outline-primary mb-2">
          <DialogTitle className="text-text-icon-01 text-xl">
            Failed Flights ({failedCount} of {totalCount} total)
          </DialogTitle>
          <DialogClose className="rounded-full p-1 hover:bg-background-level-3">
            <X className="h-5 w-5 text-text-icon-02" />
          </DialogClose>
        </DialogHeader>

        <div className="py-2 border-b border-outline-primary mb-2">
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleShowUnreviewed}
                className="text-xs h-8 px-2 flex items-center gap-1"
              >
                {showUnreviewedOnly ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {showUnreviewedOnly ? 'Show all' : 'Unreviewed only'}
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className={cn(
          "py-2 border-b border-outline-primary mb-2", 
          isMobile ? "max-h-[38vh]" : "max-h-[45vh]"
        )}>
          <div className="pr-3">
            <h3 className="text-sm font-semibold text-text-icon-02 mb-2">FAILED FLIGHTS BY CAUSE</h3>
            
            <div className="space-y-2">
              {filteredCategories.map((category, index) => {
                const IconComponent = category.icon;
                
                // Skip empty categories when filtering
                if (category.flights.length === 0) return null;
                
                return (
                  <Collapsible key={index} defaultOpen={true} className="w-full border border-outline-primary rounded-md overflow-hidden">
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
                        
                        return (
                          <div 
                            key={flightIndex}
                            className={cn(
                              "p-2 border-t border-outline-primary cursor-pointer hover:bg-background-level-4 transition-colors active:bg-background-level-3 group",
                              flightIndex > 0 && "border-t-outline-primary border-opacity-50"
                            )}
                            onClick={() => handleFlightClick(flight.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Circle className={cn(
                                  "h-2.5 w-2.5 fill-current", 
                                  flight.severity === 'critical' ? "text-error-200" : "text-caution-200"
                                )} />
                                <div className="flex items-center">
                                  <span className="text-xs font-medium text-text-icon-01">{flight.id}</span>
                                  <span className="text-xs text-text-icon-02 ml-2">{flight.date}</span>
                                  <span className="text-xs text-text-icon-02 ml-2">•</span>
                                  <span className="text-xs text-text-icon-02 ml-2">{flight.type}</span>
                                </div>
                                {isViewed && (
                                  <div className="flex items-center gap-1 bg-background-level-4 px-1 py-0.5 rounded-sm">
                                    <Eye className="h-3 w-3 text-text-icon-02 opacity-70" />
                                    <span className="text-[10px] text-text-icon-02 opacity-70">Viewed</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <span className="text-[10px]">View Details</span>
                                </Button>
                                <ChevronRight className="h-3.5 w-3.5 text-text-icon-02 transform group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                            <div className={cn(
                              "text-xs ml-5", 
                              getSeverityColorClass(flight.severity)
                            )}>
                              {flight.details}
                            </div>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <Collapsible defaultOpen={!isPatternCollapsed} onOpenChange={(isOpen) => setIsPatternCollapsed(!isOpen)} className="rounded-md bg-background-level-3 overflow-hidden">
          <CollapsibleTrigger className="w-full text-left p-2 hover:bg-background-level-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-icon-02">FAILURE PATTERN ANALYSIS</h3>
              <ChevronRight className="h-3.5 w-3.5 text-text-icon-02 transform transition-all duration-200 data-[state=open]:rotate-90" />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-warning-200" />
                <h4 className="text-sm text-text-icon-01 font-medium">Key Insights</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <ul className="space-y-1.5 text-xs text-text-icon-02">
                    <li className="flex items-start">
                      <span className="text-warning-200 mr-1.5">•</span>
                      <span>Most common cause: Wind Speed (60% of failures)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-warning-200 mr-1.5">•</span>
                      <span>Most affected mission: Site Survey (40% of failures)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-1.5 text-xs text-text-icon-02">
                    <li className="flex items-start">
                      <span className="text-warning-200 mr-1.5">•</span>
                      <span>Failure threshold: Wind &gt; 12 m/s, GPS &lt; 4 satellites</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-warning-200 mr-1.5">•</span>
                      <span>Time pattern: 80% of failures occurred between 9am-12pm</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </DialogContent>
    </Dialog>
  );
};

export default FailedFlightsPopup;
