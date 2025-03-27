
import React from 'react';
import { Wifi } from 'lucide-react';
import SectionHeader from './SectionHeader';
import ConnectionStatusCard from './ConnectionStatusCard';

interface NetworkStatusSectionProps {
  connections: {
    rfLink: {
      status: 'active' | 'inactive' | 'poor';
      details: string;
    };
    ethernet: {
      status: 'active' | 'inactive' | 'poor';
      details: string;
    };
    dockCellular: {
      status: 'active' | 'inactive' | 'poor';
      details: string;
    };
    droneCellular: {
      status: 'active' | 'inactive' | 'poor';
      details: string;
    };
  };
}

const NetworkStatusSection: React.FC<NetworkStatusSectionProps> = ({
  connections
}) => {
  return (
    <>
      <SectionHeader title="Network Status" icon={Wifi} />
      
      <div className="px-4 py-2">
        <div className="bg-background-level-1 border border-outline-primary rounded-md overflow-hidden">
          <ConnectionStatusCard 
            label="RF Link"
            status={connections.rfLink.status}
            details={connections.rfLink.details}
          />
          
          <ConnectionStatusCard 
            label="Dock Ethernet"
            status={connections.ethernet.status}
            details={connections.ethernet.details}
          />
          
          <ConnectionStatusCard 
            label="Dock 4G"
            status={connections.dockCellular.status}
            details={connections.dockCellular.details}
          />
          
          <ConnectionStatusCard 
            label="Drone 4G"
            status={connections.droneCellular.status}
            details={connections.droneCellular.details}
          />
        </div>
      </div>
    </>
  );
};

export default NetworkStatusSection;
