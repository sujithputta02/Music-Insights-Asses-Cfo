'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArtistCount } from '@/lib/types';

interface Props {
  data: ArtistCount[];
}

export default function TopArtistsChart({ data }: Props) {
  const chartData = data.map((item) => ({
    name: item.artistName.length > 20 
      ? item.artistName.substring(0, 20) + '...' 
      : item.artistName,
    fullName: item.artistName,
    albums: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
        <XAxis type="number" stroke="#787774" />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#787774"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAEAEA',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value} albums`,
            props.payload.fullName,
          ]}
        />
        <Bar dataKey="albums" fill="#1F6C9F" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
