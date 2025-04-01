
import React from 'react';
import { Shield, Satellite, Radar, Video, Cpu, Eye } from 'lucide-react';
import SectionHeader from './SectionHeader';
interface SystemStatusSectionProps {
  gpsStatus?: {
    count: number;
    signal: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  rtkStatus: {
    count: number;
    signal: string;
    mode: 'Fixed' | 'Float' | 'None';
  };
  latency: {
    video: number;
    control: number;
  };
  visionSystem: {
    status: 'active' | 'inactive' | 'limited';
    details?: string;
  };
}
const SystemStatusSection: React.FC<SystemStatusSectionProps> = ({
  gpsStatus,
  rtkStatus,
  latency,
  visionSystem
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'active':
      case 'fixed':
        return 'bg-success-200';
      case 'good':
      case 'float':
        return 'bg-success-100';
      case 'fair':
      case 'limited':
        return 'bg-caution-200';
      case 'poor':
      case 'inactive':
      case 'none':
        return 'bg-error-200';
      default:
        return 'bg-text-icon-02';
    }
  };
  const getLatencyColor = (ms: number) => {
    if (ms < 100) return 'text-success-200';
    if (ms < 200) return 'text-caution-200';
    return 'text-error-200';
  };
  return <div className="flex flex-col mb-400">
      <SectionHeader title="System Status" icon={Shield} />
      
      <div className="px-4 py-2">
        <div className="bg-background-level-1 rounded-md border border-outline-primary divide-y divide-outline-primary overflow-hidden">
          {/* GPS Status */}
          {gpsStatus && (
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-text-icon-02" />
                <span className="text-sm text-text-icon-01">GPS Status</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-icon-02">
                  {gpsStatus.count} satellites
                </span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(gpsStatus.quality)}`}></div>
                  <span className="text-xs text-text-icon-02">{gpsStatus.signal}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* RTK Status */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-text-icon-02" />
              <span className="text-sm text-text-icon-01">RTK Status</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-icon-02">
                {rtkStatus.count} satellites
              </span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(rtkStatus.mode)}`}></div>
                <span className="text-xs text-text-icon-02">{rtkStatus.mode}</span>
              </div>
            </div>
          </div>
          
          {/* Latency */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-text-icon-02" />
              <span className="text-sm text-text-icon-01">Video Latency</span>
            </div>
            <span className={`text-sm font-medium ${getLatencyColor(latency.video)}`}>
              {latency.video} ms
            </span>
          </div>
          
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-text-icon-02" />
              <span className="text-sm text-text-icon-01">Control Latency</span>
            </div>
            <span className={`text-sm font-medium ${getLatencyColor(latency.control)}`}>
              {latency.control} ms
            </span>
          </div>
          
          {/* Vision System */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-text-icon-02" />
              <span className="text-sm text-text-icon-01">Collision avoidance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(visionSystem.status)}`}></div>
              <span className="text-xs text-text-icon-02 capitalize">{visionSystem.status}</span>
              {visionSystem.details && (
                <span className="text-xs text-text-icon-02"> - {visionSystem.details}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default SystemStatusSection;
