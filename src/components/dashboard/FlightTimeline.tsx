
import React from 'react';
import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Loader } from 'lucide-react';
import { DateRangeType } from './DateRangeFilter';

type ViewType = 'total' | 'status';

interface FlightTimelineProps {
  viewType: ViewType;
  dateRange: DateRangeType;
  isLoading: boolean;
}

// Mock data for the timeline - simplified to use daily data for all ranges
const generateMockData = (dateRange: DateRangeType, viewType: ViewType) => {
  if (viewType === 'total') {
    switch (dateRange) {
      case 'today':
        // Single day data - just show the total for today
        return [
          { name: 'Today', flights: Math.floor(Math.random() * 30) + 10 }
        ];
      case 'this-week':
        // Weekly data
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
        // Monthly data - showing weekly aggregates instead of daily
        return [
          { name: 'Week 1', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Week 2', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Week 3', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Week 4', flights: Math.floor(Math.random() * 70) + 30 },
        ];
    }
  } else {
    // Status view
    switch (dateRange) {
      case 'today':
        // Single day data - just show the total for today
        return [
          { 
            name: 'Today', 
            successful: Math.floor(Math.random() * 25) + 10,
            failed: Math.floor(Math.random() * 5),
            aborted: Math.floor(Math.random() * 3),
          }
        ];
      case 'this-week':
        // Weekly data
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
        // Monthly data - showing weekly aggregates
        return [
          {
            name: 'Week 1',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Week 2',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Week 3',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Week 4',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          }
        ];
    }
  }
  return [];
};

const FlightTimeline: React.FC<FlightTimelineProps> = ({ viewType, dateRange, isLoading }) => {
  const data = React.useMemo(() => generateMockData(dateRange, viewType), [dateRange, viewType]);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="flybase-card p-200 border border-outline-primary bg-background-level-2">
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

  // Custom cursor for the chart to create a better hover effect
  const CustomCursor = ({ x, y, width, height }: any) => {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(73, 109, 200, 0.15)"
        fillOpacity={0.3}
        style={{ pointerEvents: 'none' }}
      />
    );
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
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={<CustomCursor />}
              wrapperStyle={{ outline: 'none' }}
            />
            {viewType === 'total' ? (
              <Bar 
                dataKey="flights" 
                fill="#3399FF" 
                name="Flights" 
                radius={[4, 4, 0, 0]} 
                animationDuration={500}
                activeBar={{ fill: '#33BBFF', stroke: '#77DDFF', strokeWidth: 2 }}
              />
            ) : (
              <>
                <Legend />
                <Bar 
                  dataKey="successful" 
                  stackId="a" 
                  fill="#1EAE6D" 
                  name="Successful" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={500}
                  activeBar={{ fill: '#25D684', stroke: '#77DDFF', strokeWidth: 1 }}
                />
                <Bar 
                  dataKey="failed" 
                  stackId="a" 
                  fill="#F8473A" 
                  name="Failed" 
                  animationDuration={500}
                  activeBar={{ fill: '#FF5F52', stroke: '#77DDFF', strokeWidth: 1 }}
                />
                <Bar 
                  dataKey="aborted" 
                  stackId="a" 
                  fill="#FDB022" 
                  name="Aborted" 
                  animationDuration={500}
                  activeBar={{ fill: '#FFCC44', stroke: '#77DDFF', strokeWidth: 1 }}
                />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default FlightTimeline;
