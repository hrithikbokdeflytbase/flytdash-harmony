
import React, { useState } from 'react';
import { Loader, CheckCircle, AlertTriangle, XCircle, RefreshCcw, Clock, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Flight, 
  FlightStatus, 
  MediaUploadStatus, 
  RecentFlightsTableProps, 
  TablePaginationState 
} from './DashboardTypes';

// Mock data for recent flights - let's expand to more than 10 for pagination testing
const mockFlights: Flight[] = [
  {
    id: 'FLT-1234',
    missionName: 'Site Inspection Alpha',
    operationType: 'Inspection',
    pilotName: 'John Doe',
    droneName: 'DJI Mavic 3',
    mediaCount: 24,
    mediaStatus: {
      photos: { total: 18, uploaded: 18 },
      videos: { total: 6, uploaded: 6 }
    },
    dateTime: '10:30 AM, Today',
    status: 'completed',
  },
  {
    id: 'FLT-1235',
    missionName: 'Construction Survey',
    operationType: 'Survey',
    pilotName: 'Jane Smith',
    droneName: 'DJI Phantom 4',
    mediaCount: 12,
    mediaStatus: {
      photos: { total: 10, uploaded: 2 },
      videos: { total: 2, uploaded: 0 }
    },
    dateTime: '11:45 AM, Today',
    status: 'failed',
  },
  {
    id: 'FLT-1236',
    missionName: 'Perimeter Security',
    operationType: 'Security',
    pilotName: 'Mike Johnson',
    droneName: 'Autel EVO II',
    mediaCount: 35,
    mediaStatus: {
      photos: { total: 20, uploaded: 20 },
      videos: { total: 15, uploaded: 15 }
    },
    dateTime: '2:15 PM, Today',
    status: 'completed',
  },
  {
    id: 'FLT-1237',
    missionName: 'Roof Inspection',
    operationType: 'Inspection',
    pilotName: 'Sarah Williams',
    droneName: 'Skydio 2',
    mediaCount: 18,
    mediaStatus: {
      photos: { total: 15, uploaded: 10 },
      videos: { total: 3, uploaded: 1 }
    },
    dateTime: '3:30 PM, Today',
    status: 'warning',
  },
  {
    id: 'FLT-1238',
    missionName: 'Agricultural Mapping',
    operationType: 'Mapping',
    pilotName: 'Alex Chen',
    droneName: 'DJI Mavic Air',
    mediaCount: 47,
    mediaStatus: {
      photos: { total: 40, uploaded: 30 },
      videos: { total: 7, uploaded: 3 }
    },
    dateTime: '9:00 AM, Yesterday',
    status: 'completed',
  },
  {
    id: 'FLT-1239',
    missionName: 'Bridge Inspection',
    operationType: 'Inspection',
    pilotName: 'Emily Roberts',
    droneName: 'DJI Inspire 2',
    mediaCount: 56,
    mediaStatus: {
      photos: { total: 36, uploaded: 36 },
      videos: { total: 20, uploaded: 20 }
    },
    dateTime: '1:30 PM, Yesterday',
    status: 'completed',
  },
  {
    id: 'FLT-1240',
    missionName: 'Solar Panel Survey',
    operationType: 'Survey',
    pilotName: 'David Miller',
    droneName: 'Autel EVO II Pro',
    mediaCount: 28,
    mediaStatus: {
      photos: { total: 22, uploaded: 15 },
      videos: { total: 6, uploaded: 2 }
    },
    dateTime: '3:45 PM, Yesterday',
    status: 'warning',
  },
  {
    id: 'FLT-1241',
    missionName: 'Warehouse Inventory',
    operationType: 'Mapping',
    pilotName: 'Lisa Johnson',
    droneName: 'DJI Mavic 3',
    mediaCount: 32,
    mediaStatus: {
      photos: { total: 25, uploaded: 25 },
      videos: { total: 7, uploaded: 7 }
    },
    dateTime: '9:15 AM, 2 days ago',
    status: 'completed',
  },
  {
    id: 'FLT-1242',
    missionName: 'Power Line Inspection',
    operationType: 'Inspection',
    pilotName: 'Tom Wilson',
    droneName: 'DJI Matrice 300',
    mediaCount: 74,
    mediaStatus: {
      photos: { total: 60, uploaded: 40 },
      videos: { total: 14, uploaded: 7 }
    },
    dateTime: '11:30 AM, 2 days ago',
    status: 'warning',
  },
  {
    id: 'FLT-1243',
    missionName: 'Forest Survey',
    operationType: 'Survey',
    pilotName: 'James Lee',
    droneName: 'DJI Phantom 4 RTK',
    mediaCount: 68,
    mediaStatus: {
      photos: { total: 50, uploaded: 50 },
      videos: { total: 18, uploaded: 18 }
    },
    dateTime: '2:00 PM, 2 days ago',
    status: 'completed',
  },
  {
    id: 'FLT-1244',
    missionName: 'Construction Progress',
    operationType: 'Documentation',
    pilotName: 'Anna Davis',
    droneName: 'DJI Mavic 3 Pro',
    mediaCount: 41,
    mediaStatus: {
      photos: { total: 30, uploaded: 30 },
      videos: { total: 11, uploaded: 11 }
    },
    dateTime: '4:20 PM, 2 days ago',
    status: 'completed',
  },
  {
    id: 'FLT-1245',
    missionName: 'Event Coverage',
    operationType: 'Photography',
    pilotName: 'Michael Torres',
    droneName: 'DJI Air 2S',
    mediaCount: 92,
    mediaStatus: {
      photos: { total: 80, uploaded: 0 },
      videos: { total: 12, uploaded: 0 }
    },
    dateTime: '10:15 AM, 3 days ago',
    status: 'failed',
  },
  {
    id: 'FLT-1246',
    missionName: 'Real Estate Photography',
    operationType: 'Photography',
    pilotName: 'Sophia Kim',
    droneName: 'DJI Mini 3 Pro',
    mediaCount: 30,
    mediaStatus: {
      photos: { total: 30, uploaded: 30 }
      // Only photos, no videos for this flight
    },
    dateTime: '1:45 PM, 3 days ago',
    status: 'completed',
  },
  {
    id: 'FLT-1247',
    missionName: 'Wildlife Documentary',
    operationType: 'Videography',
    pilotName: 'Carlos Rodriguez',
    droneName: 'DJI Inspire 2',
    mediaCount: 15,
    mediaStatus: {
      // Only videos, no photos for this flight
      videos: { total: 15, uploaded: 12 }
    },
    dateTime: '8:20 AM, 4 days ago',
    status: 'warning',
  },
];

const getStatusBadgeClass = (status: FlightStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-container-success text-success-200';
    case 'failed':
      return 'bg-container-error text-error-200';
    case 'warning':
      return 'bg-container-warning text-warning-200';
    case 'inProgress':
      return 'bg-container-info text-info-200';
    case 'scheduled':
      return 'bg-container-secondary text-text-icon-02';
    default:
      return 'bg-container-info text-info-200';
  }
};

const getStatusText = (status: FlightStatus): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'warning':
      return 'Warning';
    case 'inProgress':
      return 'In Progress';
    case 'scheduled':
      return 'Scheduled';
    default:
      // Since we've exhaustively checked all possible values of FlightStatus,
      // this default case should never execute. But to satisfy TypeScript,
      // we need to cast the status to string and then use string methods.
      return (status as unknown as string).charAt(0).toUpperCase() + 
             (status as unknown as string).slice(1);
  }
};

const getStatusIcon = (status: FlightStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'failed':
      return <XCircle className="w-4 h-4" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4" />;
    case 'inProgress':
      return <Clock className="w-4 h-4" />;
    case 'scheduled':
      return <CalendarClock className="w-4 h-4" />;
    default:
      return null;
  }
};

// Function to get the color for the media upload progress
const getMediaUploadProgressColor = (uploadedPercentage: number) => {
  if (uploadedPercentage === 100) return "bg-success-200";
  if (uploadedPercentage > 50) return "bg-primary-200";
  if (uploadedPercentage > 0) return "bg-caution-200";
  return "";
};

// Check if a media upload has failed
const isMediaUploadFailed = (uploadedPercentage: number) => {
  // Consider uploads failed if they're at 0%
  return uploadedPercentage === 0;
};

const RecentFlightsTable: React.FC<RecentFlightsTableProps> = ({ 
  isLoading = false,
  flights = mockFlights,
  itemsPerPage = 10,
  onFlightSelect
}) => {
  const navigate = useNavigate();
  const [paginationState, setPaginationState] = useState<TablePaginationState>({
    currentPage: 1,
    itemsPerPage,
    totalItems: flights.length
  });
  
  const handleRowClick = (flightId: string) => {
    if (onFlightSelect) {
      onFlightSelect(flightId);
    } else {
      navigate(`/flight-details/${flightId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-100" />
      </div>
    );
  }

  // Helper function to handle retry upload
  const handleRetryUpload = (e: React.MouseEvent, mediaType: string, flightId: string) => {
    e.stopPropagation(); // Prevent row click from triggering
    console.log(`Retrying ${mediaType} upload for flight ${flightId}`);
    // In a real app, this would initiate the upload retry process
  };

  // Updated minimalist approach for media display with fixed widths and better alignment
  const renderMediaStatus = (flight: Flight) => {
    // Calculate total upload percentage across all media
    const totalMedia = 
      (flight.mediaStatus.photos?.total || 0) + 
      (flight.mediaStatus.videos?.total || 0);
    
    const totalUploaded = 
      (flight.mediaStatus.photos?.uploaded || 0) + 
      (flight.mediaStatus.videos?.uploaded || 0);
    
    if (totalMedia === 0) {
      return <span className="text-sm text-text-icon-02">No media</span>;
    }
    
    const uploadPercentage = Math.round((totalUploaded / totalMedia) * 100);
    const isComplete = uploadPercentage === 100;
    const isFailed = totalUploaded === 0 && totalMedia > 0;
    
    return (
      <div className="flex items-center gap-3 w-[150px]">
        <div className="flex items-center min-w-[70px]">
          {isComplete ? (
            <CheckCircle size={14} className="text-success-200 mr-2" />
          ) : (
            <span className="text-sm font-medium w-[30px] text-right mr-1">{uploadPercentage}%</span>
          )}
          <span className="text-sm text-text-icon-02 ml-1">
            ({totalUploaded}/{totalMedia})
          </span>
        </div>
        
        <div className="w-[60px]">
          <Progress 
            value={uploadPercentage} 
            className="h-1.5 bg-background-level-2"
            failed={isFailed}
            onRetry={isFailed ? () => {
              const mediaType = flight.mediaStatus.photos?.total ? 'photos' : 'videos';
              handleRetryUpload(new MouseEvent('click') as unknown as React.MouseEvent, mediaType, flight.id);
            } : undefined}
          />
        </div>
      </div>
    );
  };

  // Calculate pagination values
  const { currentPage, itemsPerPage: itemsPerPageState } = paginationState;
  const totalPages = Math.ceil(flights.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const endIndex = Math.min(startIndex + itemsPerPageState, flights.length);
  const currentFlights = flights.slice(startIndex, endIndex);

  // Handle page change
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPaginationState(prev => ({ ...prev, currentPage: page }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-400">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="border-b border-outline-primary">
              <TableHead className="text-text-icon-02 fb-body4-medium w-[60px]">Status</TableHead>
              <TableHead className="text-text-icon-02 fb-body4-medium w-[180px]">Mission Name</TableHead>
              <TableHead className="text-text-icon-02 fb-body4-medium w-[120px]">Operation Type</TableHead>
              <TableHead className="text-text-icon-02 fb-body4-medium w-[140px]">Operator</TableHead>
              <TableHead className="text-text-icon-02 fb-body4-medium w-[140px]">Drone</TableHead>
              <TableHead className="text-text-icon-02 fb-body4-medium w-[150px]">Media</TableHead>
              <TableHead className="text-text-icon-02 fb-body4-medium w-[140px]">Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFlights.map((flight) => (
              <TableRow 
                key={flight.id}
                className="hover:bg-surface-states-hover cursor-pointer border-b border-outline-primary last:border-0"
                onClick={() => handleRowClick(flight.id)}
              >
                <TableCell className="w-[60px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`p-200 rounded-full flex items-center justify-center w-8 h-8 ${getStatusBadgeClass(flight.status)}`}>
                          {getStatusIcon(flight.status)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getStatusText(flight.status)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="font-medium text-text-icon-01 w-[180px]">
                  <div className="truncate max-w-[160px]" title={flight.missionName}>
                    {flight.missionName}
                  </div>
                </TableCell>
                <TableCell className="text-text-icon-02 w-[120px]">
                  <div className="truncate max-w-[100px]" title={flight.operationType}>
                    {flight.operationType}
                  </div>
                </TableCell>
                <TableCell className="text-text-icon-02 w-[140px]">
                  <div className="truncate max-w-[120px]" title={flight.pilotName}>
                    {flight.pilotName}
                  </div>
                </TableCell>
                <TableCell className="text-text-icon-01 w-[140px]">
                  <div className="truncate max-w-[120px]" title={flight.droneName}>
                    {flight.droneName}
                  </div>
                </TableCell>
                <TableCell className="text-text-icon-01 w-[150px]">
                  {renderMediaStatus(flight)}
                </TableCell>
                <TableCell className="text-text-icon-02 w-[140px]">
                  <div className="truncate max-w-[120px]" title={flight.dateTime}>
                    {flight.dateTime}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => goToPage(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink 
                  onClick={() => goToPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => goToPage(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default RecentFlightsTable;
