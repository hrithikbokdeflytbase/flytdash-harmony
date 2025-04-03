
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
}

const ControlSection: React.FC<ControlSectionProps> = ({
  currentTimestamp,
  controlHistory,
  className
}) => {
  // Find the active controllers at the current timestamp
  const findActiveController = (controllers: Controller[]): string => {
    if (!controllers || controllers.length === 0) return "N/A";
    
    const currentTime = timeToSeconds(currentTimestamp);
    
    // Find the active controller at this timestamp
    const activeController = controllers.find(controller => {
      const startTime = timeToSeconds(controller.startTime);
      const endTime = timeToSeconds(controller.endTime);
      return currentTime >= startTime && currentTime <= endTime;
    });
    
    if (!activeController) return "N/A";
    
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
    
    // Format the display name based on whether there are additional controllers
    if (overlappingControllers.length === 0) {
      return activeController.name;
    } else {
      return `${activeController.name} +${overlappingControllers.length}`;
    }
  };
  
  const activePayloadController = findActiveController(controlHistory.payload);
  const activeDroneController = findActiveController(controlHistory.drone);
  
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
                  {activePayloadController}
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
                  {activeDroneController}
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
