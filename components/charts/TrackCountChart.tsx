'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrackCountDistribution } from '@/lib/types';

interface Props {
  data: TrackCountDistribution[];
}

export default function TrackCountChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
        <XAxis
          dataKey="range"
          stroke="#787774"
          label={{ value: 'Track Count Range', position: 'insideBottom', offset: -5 }}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#787774"
          label={{ value: 'Albums', angle: -90, position: 'insideLeft' }}
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAEAEA',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`${value} albums`, 'Count']}
        />
        <Bar dataKey="count" fill="#9F2F2D" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
