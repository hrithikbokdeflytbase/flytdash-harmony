
import React from 'react';
import { User, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { timeToSeconds } from './timeline/timelineUtils';

// Define the controller types
export interface Controller {
  name: string;
  startTime: string;
  endTime: string;
}

// Define controller history for a flight
export interface ControlHistory {
  payload: Controller[];
  drone: Controller[];
}

interface ControlSectionProps {
  currentTimestamp: string;
  controlHistory: ControlHistory;
  className?: string;
  showAllControllers?: boolean; // New prop to determine display mode
}

const ControlSection: React.FC<ControlSectionProps> = ({
  currentTimestamp,
  controlHistory,
  className,
  showAllControllers = false // Default to showing only current controller
}) => {
  // Find the active controllers at the current timestamp
  const findActiveController = (controllers: Controller[]): { name: string, count: number } => {
    if (!controllers || controllers.length === 0) return { name: "N/A", count: 0 };
    
    const currentTime = timeToSeconds(currentTimestamp);
    
    // Find the active controller at this timestamp
    const activeController = controllers.find(controller => {
      const startTime = timeToSeconds(controller.startTime);
      const endTime = timeToSeconds(controller.endTime);
      return currentTime >= startTime && currentTime <= endTime;
    });
    
    if (!activeController) return { name: "N/A", count: 0 };
    
    // Check if this is the only controller, or if there are others with overlapping time
    const overlappingControllers = controllers.filter(controller => {
      if (controller === activeController) return false;
      
      const startTime = timeToSeconds(controller.startTime);
      const endTime = timeToSeconds(controller.endTime);
      const activeStartTime = timeToSeconds(activeController.startTime);
      const activeEndTime = timeToSeconds(activeController.endTime);
      
      return (
        (startTime <= currentTime && endTime >= currentTime) ||
        (activeStartTime <= endTime && activeEndTime >= startTime)
      );
    });
    
    return { 
      name: activeController.name,
      count: overlappingControllers.length
    };
  };
  
  const activePayloadController = findActiveController(controlHistory.payload);
  const activeDroneController = findActiveController(controlHistory.drone);
  
  // Format the display name based on whether to show additional controllers
  const formatControllerDisplay = (controller: { name: string, count: number }): string => {
    if (!showAllControllers || controller.count === 0) {
      return controller.name;
    } else {
      return `${controller.name} +${controller.count}`;
    }
  };

  return (
    <div className={cn("px-4 py-3", className)}>
      <div className="rounded-lg border border-outline-primary overflow-hidden">
        <Table>
          <TableBody>
            <TableRow className="border-b border-outline-primary hover:bg-transparent">
              <TableCell className="py-2 px-4 w-1/2">
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-4 w-4 text-text-icon-02" />
                  <span className="text-text-icon-02 font-medium">Payload Control</span>
                </div>
              </TableCell>
              <TableCell className="py-2 px-4 text-right">
                <span className="text-text-icon-01 font-medium text-sm">
                  {formatControllerDisplay(activePayloadController)}
                </span>
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell className="py-2 px-4 border-0">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="h-4 w-4 text-text-icon-02" />
                  <span className="text-text-icon-02 font-medium">Drone Control</span>
                </div>
              </TableCell>
              <TableCell className="py-2 px-4 text-right border-0">
                <span className="text-text-icon-01 font-medium text-sm">
                  {formatControllerDisplay(activeDroneController)}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ControlSection;
