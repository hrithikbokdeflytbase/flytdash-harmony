
import React from 'react';
import { Loader, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RecentFlightsTableProps {
  isLoading?: boolean;
}

type FlightStatus = 'completed' | 'warning' | 'failed';

interface Flight {
  id: string;
  missionName: string;
  operationType: string;
  pilotName: string;
  droneName: string;
  mediaCount: number;
  dateTime: string;
  status: FlightStatus;
}

// Mock data for recent flights
const mockFlights: Flight[] = [
  {
    id: 'FLT-1234',
    missionName: 'Site Inspection Alpha',
    operationType: 'Inspection',
    pilotName: 'John Doe',
    droneName: 'DJI Mavic 3',
    mediaCount: 24,
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
    dateTime: '9:00 AM, Yesterday',
    status: 'completed',
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
    default:
      return null;
  }
};

const RecentFlightsTable: React.FC<RecentFlightsTableProps> = ({ isLoading = false }) => {
  const navigate = useNavigate();

  const handleFlightClick = (flightId: string) => {
    navigate(`/flight-details/${flightId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-100" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-400">
      <Table className="w-full border-collapse">
        <TableHeader>
          <TableRow className="border-b border-outline-primary">
            <TableHead className="text-text-icon-02 fb-body4-medium">Status</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Mission Name</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Operation Type</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Pilot</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Drone</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Media</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Date & Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockFlights.map((flight) => (
            <TableRow 
              key={flight.id}
              className="hover:bg-surface-states-hover cursor-pointer border-b border-outline-primary last:border-0"
              onClick={() => handleFlightClick(flight.id)}
            >
              <TableCell>
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
              <TableCell className="font-medium text-text-icon-01">
                {flight.missionName}
              </TableCell>
              <TableCell className="text-text-icon-02">
                {flight.operationType}
              </TableCell>
              <TableCell className="text-text-icon-02">
                {flight.pilotName}
              </TableCell>
              <TableCell className="text-text-icon-01">
                {flight.droneName}
              </TableCell>
              <TableCell className="text-text-icon-01">
                {flight.mediaCount}
              </TableCell>
              <TableCell className="text-text-icon-02">
                {flight.dateTime}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentFlightsTable;
