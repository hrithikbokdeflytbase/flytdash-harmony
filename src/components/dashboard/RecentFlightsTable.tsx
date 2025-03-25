
import React from 'react';
import { Eye, FileText, Tag, Loader } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecentFlightsTableProps {
  isLoading?: boolean;
}

type FlightStatus = 'successful' | 'failed' | 'aborted';

interface Flight {
  id: string;
  drone: string;
  location: string;
  startTime: string;
  duration: string;
  status: FlightStatus;
  operator: string;
}

// Mock data for recent flights
const mockFlights: Flight[] = [
  {
    id: 'FLT-1234',
    drone: 'DJI Mavic 3',
    location: 'Site Alpha',
    startTime: '10:30 AM, Today',
    duration: '12m 45s',
    status: 'successful',
    operator: 'John Doe',
  },
  {
    id: 'FLT-1235',
    drone: 'DJI Phantom 4',
    location: 'Site Bravo',
    startTime: '11:45 AM, Today',
    duration: '8m 20s',
    status: 'failed',
    operator: 'Jane Smith',
  },
  {
    id: 'FLT-1236',
    drone: 'Autel EVO II',
    location: 'Site Charlie',
    startTime: '2:15 PM, Today',
    duration: '15m 10s',
    status: 'successful',
    operator: 'Mike Johnson',
  },
  {
    id: 'FLT-1237',
    drone: 'Skydio 2',
    location: 'Site Delta',
    startTime: '3:30 PM, Today',
    duration: '20m 30s',
    status: 'aborted',
    operator: 'Sarah Williams',
  },
  {
    id: 'FLT-1238',
    drone: 'DJI Mavic Air',
    location: 'Site Echo',
    startTime: '9:00 AM, Yesterday',
    duration: '10m 15s',
    status: 'successful',
    operator: 'Alex Chen',
  },
];

const getStatusBadgeClass = (status: FlightStatus) => {
  switch (status) {
    case 'successful':
      return 'bg-container-success text-success-200';
    case 'failed':
      return 'bg-container-error text-error-200';
    case 'aborted':
      return 'bg-container-warning text-warning-200';
    default:
      return 'bg-container-info text-info-200';
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-text-icon-02 fb-body4-medium">Flight ID</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Drone</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Location</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Start Time</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Duration</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Status</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium">Operator</TableHead>
            <TableHead className="text-text-icon-02 fb-body4-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockFlights.map((flight) => (
            <TableRow 
              key={flight.id}
              className="hover:bg-surface-states-hover cursor-pointer"
            >
              <TableCell className="font-medium text-text-icon-01">{flight.id}</TableCell>
              <TableCell className="text-text-icon-01">{flight.drone}</TableCell>
              <TableCell className="text-text-icon-01">{flight.location}</TableCell>
              <TableCell className="text-text-icon-02">{flight.startTime}</TableCell>
              <TableCell className="text-text-icon-01">{flight.duration}</TableCell>
              <TableCell>
                <span className={`px-200 py-50 rounded-full text-tiny1-medium ${getStatusBadgeClass(flight.status)}`}>
                  {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                </span>
              </TableCell>
              <TableCell className="text-text-icon-02">{flight.operator}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-200">
                  <button className="p-100 rounded-full hover:bg-surface-states-hover transition-colors" title="View Details">
                    <Eye className="w-4 h-4 text-text-icon-02 hover:text-text-icon-01" />
                  </button>
                  <button className="p-100 rounded-full hover:bg-surface-states-hover transition-colors" title="View Report">
                    <FileText className="w-4 h-4 text-text-icon-02 hover:text-text-icon-01" />
                  </button>
                  <button className="p-100 rounded-full hover:bg-surface-states-hover transition-colors" title="Add Tags">
                    <Tag className="w-4 h-4 text-text-icon-02 hover:text-text-icon-01" />
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
