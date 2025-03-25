
import React from 'react';
import { Eye, FileText, Loader } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

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

const getStatusText = (status: FlightStatus) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'warning':
      return 'Warning';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const RecentFlightsTable: React.FC<RecentFlightsTableProps> = ({ isLoading = false }) => {
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
            <TableHead className="text-text-icon-02 fb-body4-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockFlights.map((flight) => (
            <TableRow 
              key={flight.id}
              className="hover:bg-surface-states-hover cursor-pointer border-b border-outline-primary last:border-0"
            >
              <TableCell>
                <span className={`px-200 py-50 rounded-full text-tiny1-medium inline-block ${getStatusBadgeClass(flight.status)}`}>
                  {getStatusText(flight.status)}
                </span>
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
              <TableCell className="text-right">
                <div className="flex justify-end space-x-200">
                  <button className="p-100 rounded-full hover:bg-surface-states-hover transition-colors" title="View Details">
                    <Eye className="w-4 h-4 text-text-icon-02 hover:text-text-icon-01" />
                  </button>
                  <button className="p-100 rounded-full hover:bg-surface-states-hover transition-colors" title="View Report">
                    <FileText className="w-4 h-4 text-text-icon-02 hover:text-text-icon-01" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentFlightsTable;
