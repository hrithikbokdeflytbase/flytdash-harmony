
import React from 'react';
import { Thermometer, Wind, Droplet, Gauge } from 'lucide-react';
import SectionHeader from './SectionHeader';
import TelemetryMetricCard from './TelemetryMetricCard';

interface EnvironmentalDataSectionProps {
  environment: {
    wind: {
      speed: number;
      unit: string;
      direction: string;
    };
    temperature: number;
    pressure: number;
    humidity: number;
  };
}

const EnvironmentalDataSection: React.FC<EnvironmentalDataSectionProps> = ({
  environment
}) => {
  return (
    <div className="flex flex-col mb-400">
      <SectionHeader title="Environmental Data" icon={Thermometer} />
      
      <div className="px-4 py-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background-level-1 p-2 rounded-md border border-outline-primary">
            <div className="flex flex-col">
              <div className="mb-1">
                <span className="text-xs text-text-icon-02">Wind</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4 text-text-icon-02" />
                  <span className="text-lg text-text-icon-01 font-medium">{environment.wind.speed}</span>
                  <span className="text-sm text-text-icon-02">{environment.wind.unit}</span>
                </div>
                <div className="px-1.5 py-0.5 bg-background-level-2 rounded text-xs text-text-icon-02 font-medium">
                  {environment.wind.direction}
                </div>
              </div>
            </div>
          </div>
          
          <TelemetryMetricCard 
            label="Temperature" 
            value={environment.temperature} 
            unit="°C"
          />
          
          <TelemetryMetricCard 
            label="Pressure" 
            value={environment.pressure} 
            unit="hPa"
          />
          
          <TelemetryMetricCard 
            label="Humidity" 
            value={environment.humidity} 
            unit="%"
          />
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalDataSection;
