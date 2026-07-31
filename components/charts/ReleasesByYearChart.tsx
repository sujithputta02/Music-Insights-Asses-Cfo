'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ReleaseYearData } from '@/lib/types';

interface Props {
  data: ReleaseYearData[];
}

export default function ReleasesByYearChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-text-muted">
        No release date data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorAlbums" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#346538" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#346538" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
        <XAxis
          dataKey="year"
          stroke="#787774"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#787774" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAEAEA',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`${value} albums`, 'Released']}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#346538"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorAlbums)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
