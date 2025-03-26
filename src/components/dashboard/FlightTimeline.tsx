import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DateRangeType } from './DateRangeFilter';

interface FlightTimelineProps {
  viewType: 'total' | 'status';
  dateRange: DateRangeType;
  isLoading: boolean;
}

interface TimelineData {
  name: string;
  flights: number;
  successful?: number;
  failed?: number;
  aborted?: number;
}

const FlightTimeline: React.FC<FlightTimelineProps> = ({ viewType, dateRange, isLoading }) => {
  // Mock data generation function
  const generateMockData = (): TimelineData[] => {
    if (viewType === 'total') {
      // Total flights data
      return [
        { name: 'Jan', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Feb', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Mar', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Apr', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'May', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Jun', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Jul', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Aug', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Sep', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Oct', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Nov', flights: Math.floor(Math.random() * 200) + 50 },
        { name: 'Dec', flights: Math.floor(Math.random() * 200) + 50 },
      ];
    } else {
      // Status breakdown data
      return [
        {
          name: 'Jan',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Feb',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Mar',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Apr',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'May',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Jun',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Jul',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Aug',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Sep',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Oct',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Nov',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
        {
          name: 'Dec',
          successful: Math.floor(Math.random() * 60) + 20,
          failed: Math.floor(Math.random() * 15),
          aborted: Math.floor(Math.random() * 8),
          flights: 0
        },
      ];
    }
  };

  const data = generateMockData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
        <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.64)" />
        <YAxis stroke="rgba(255, 255, 255, 0.64)" />
        <Tooltip
          contentStyle={{ background: '#1E293B', border: 'none', color: 'rgba(255, 255, 255, 0.84)' }}
          labelStyle={{ color: 'rgba(255, 255, 255, 0.84)' }}
          itemStyle={{ color: 'rgba(255, 255, 255, 0.84)' }}
        />
        {viewType === 'total' ? (
          <Area type="monotone" dataKey="flights" stroke="#8884d8" fill="#496DC8" />
        ) : (
          <>
            <Area type="monotone" dataKey="successful" stackId="1" stroke="#82ca9d" fill="#34D399" />
            <Area type="monotone" dataKey="failed" stackId="1" stroke="#E46262" fill="#F87171" />
            <Area type="monotone" dataKey="aborted" stackId="1" stroke="#ffc658" fill="#FBBF24" />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default FlightTimeline;
