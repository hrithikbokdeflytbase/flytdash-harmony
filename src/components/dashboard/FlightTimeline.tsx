
import React from 'react';
import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Loader } from 'lucide-react';

type DateRangeType = 'today' | 'this-week' | 'this-month' | 'custom';
type ViewType = 'total' | 'status';

interface FlightTimelineProps {
  viewType: ViewType;
  dateRange: DateRangeType;
  isLoading: boolean;
}

// Mock data for the timeline
const generateMockData = (dateRange: DateRangeType, viewType: ViewType) => {
  if (viewType === 'total') {
    switch (dateRange) {
      case 'today':
        return Array.from({ length: 24 }, (_, i) => ({
          name: `${i}:00`,
          flights: Math.floor(Math.random() * 10),
        }));
      case 'this-week':
        return [
          { name: 'Mon', flights: Math.floor(Math.random() * 30) + 10 },
          { name: 'Tue', flights: Math.floor(Math.random() * 30) + 10 },
          { name: 'Wed', flights: Math.floor(Math.random() * 30) + 10 },
          { name: 'Thu', flights: Math.floor(Math.random() * 30) + 10 },
          { name: 'Fri', flights: Math.floor(Math.random() * 30) + 10 },
          { name: 'Sat', flights: Math.floor(Math.random() * 30) + 10 },
          { name: 'Sun', flights: Math.floor(Math.random() * 30) + 10 },
        ];
      case 'this-month':
      case 'custom':
        return Array.from({ length: 30 }, (_, i) => ({
          name: `${i + 1}`,
          flights: Math.floor(Math.random() * 20) + 5,
        }));
    }
  } else {
    switch (dateRange) {
      case 'today':
        return Array.from({ length: 24 }, (_, i) => ({
          name: `${i}:00`,
          successful: Math.floor(Math.random() * 8),
          failed: Math.floor(Math.random() * 2),
          aborted: Math.floor(Math.random() * 1),
        }));
      case 'this-week':
        return [
          { 
            name: 'Mon', 
            successful: Math.floor(Math.random() * 25) + 10,
            failed: Math.floor(Math.random() * 5),
            aborted: Math.floor(Math.random() * 3),
          },
          { 
            name: 'Tue', 
            successful: Math.floor(Math.random() * 25) + 10,
            failed: Math.floor(Math.random() * 5),
            aborted: Math.floor(Math.random() * 3),
          },
          { 
            name: 'Wed', 
            successful: Math.floor(Math.random() * 25) + 10,
            failed: Math.floor(Math.random() * 5),
            aborted: Math.floor(Math.random() * 3),
          },
          { 
            name: 'Thu', 
            successful: Math.floor(Math.random() * 25) + 10,
            failed: Math.floor(Math.random() * 5),
            aborted: Math.floor(Math.random() * 3),
          },
          { 
            name: 'Fri', 
            successful: Math.floor(Math.random() * 25) + 10,
            failed: Math.floor(Math.random() * 5),
            aborted: Math.floor(Math.random() * 3),
          },
          { 
            name: 'Sat', 
            successful: Math.floor(Math.random() * 25) + 10,
            failed: Math.floor(Math.random() * 5),
            aborted: Math.floor(Math.random() * 3),
          },
          { 
            name: 'Sun', 
            successful: Math.floor(Math.random() * 25) + 10,
            failed: Math.floor(Math.random() * 5),
            aborted: Math.floor(Math.random() * 3),
          },
        ];
      case 'this-month':
      case 'custom':
        return Array.from({ length: 30 }, (_, i) => ({
          name: `${i + 1}`,
          successful: Math.floor(Math.random() * 15) + 5,
          failed: Math.floor(Math.random() * 4),
          aborted: Math.floor(Math.random() * 2),
        }));
    }
  }
  return [];
};

const FlightTimeline: React.FC<FlightTimelineProps> = ({ viewType, dateRange, isLoading }) => {
  const data = React.useMemo(() => generateMockData(dateRange, viewType), [dateRange, viewType]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="flybase-card p-200 border border-outline-primary">
          <p className="fb-body1-medium text-text-icon-01">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={`item-${index}`} 
              className="fb-body2-regular" 
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-100" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'rgba(255,255,255,0.54)' }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            />
            <YAxis 
              tick={{ fill: 'rgba(255,255,255,0.54)' }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {viewType === 'total' ? (
              <Bar dataKey="flights" fill="#3399FF" name="Flights" radius={[4, 4, 0, 0]} />
            ) : (
              <>
                <Legend />
                <Bar dataKey="successful" stackId="a" fill="#1EAE6D" name="Successful" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" stackId="a" fill="#F8473A" name="Failed" />
                <Bar dataKey="aborted" stackId="a" fill="#FDB022" name="Aborted" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default FlightTimeline;
