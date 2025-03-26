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

// Mock data for the timeline - updated to use daily data (Monday-Sunday) for daily range
const generateMockData = (dateRange: DateRangeType, viewType: ViewType) => {
  if (viewType === 'total') {
    switch (dateRange) {
      case 'monthly':
        // Monthly data showing each month
        return [
          { name: 'Jan', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Feb', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Mar', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Apr', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'May', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Jun', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Jul', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Aug', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Sep', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Oct', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Nov', flights: Math.floor(Math.random() * 70) + 30 },
          { name: 'Dec', flights: Math.floor(Math.random() * 70) + 30 },
        ];
      case 'weekly':
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
      case 'daily':
        // Daily data - showing individual days instead of weekly aggregates
        return [
          { name: 'Monday', flights: Math.floor(Math.random() * 25) + 5 },
          { name: 'Tuesday', flights: Math.floor(Math.random() * 25) + 5 },
          { name: 'Wednesday', flights: Math.floor(Math.random() * 25) + 5 },
          { name: 'Thursday', flights: Math.floor(Math.random() * 25) + 5 },
          { name: 'Friday', flights: Math.floor(Math.random() * 25) + 5 },
          { name: 'Saturday', flights: Math.floor(Math.random() * 25) + 5 },
          { name: 'Sunday', flights: Math.floor(Math.random() * 25) + 5 },
        ];
    }
  } else {
    // Status view
    switch (dateRange) {
      case 'monthly':
        // Monthly data showing each month with status breakdown
        return [
          {
            name: 'Jan',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Feb',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Mar',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Apr',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'May',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Jun',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Jul',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Mathrandom() * 8),
          },
          {
            name: 'Aug',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Sep',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Oct',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Nov',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
          {
            name: 'Dec',
            successful: Math.floor(Math.random() * 60) + 20,
            failed: Math.floor(Math.random() * 15),
            aborted: Math.floor(Math.random() * 8),
          },
        ];
      case 'weekly':
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
      case 'daily':
        // Daily data - showing individual days instead of weekly aggregates
        return [
          {
            name: 'Monday',
            successful: Math.floor(Math.random() * 20) + 5,
            failed: Math.floor(Math.random() * 4),
            aborted: Math.floor(Math.random() * 2),
          },
          {
            name: 'Tuesday',
            successful: Math.floor(Math.random() * 20) + 5,
            failed: Math.floor(Math.random() * 4),
            aborted: Math.floor(Math.random() * 2),
          },
          {
            name: 'Wednesday',
            successful: Math.floor(Math.random() * 20) + 5,
            failed: Math.floor(Math.random() * 4),
            aborted: Math.floor(Math.random() * 2),
          },
          {
            name: 'Thursday',
            successful: Math.floor(Math.random() * 20) + 5,
            failed: Math.floor(Math.random() * 4),
            aborted: Math.floor(Math.random() * 2),
          },
          {
            name: 'Friday',
            successful: Math.floor(Math.random() * 20) + 5,
            failed: Math.floor(Math.random() * 4),
            aborted: Math.floor(Math.random() * 2),
          },
          {
            name: 'Saturday',
            successful: Math.floor(Math.random() * 20) + 5,
            failed: Math.floor(Math.random() * 4),
            aborted: Math.floor(Math.random() * 2),
          },
          {
            name: 'Sunday',
            successful: Math.floor(Math.random() * 20) + 5,
            failed: Math.floor(Math.random() * 4),
            aborted: Math.floor(Math.random() * 2),
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
