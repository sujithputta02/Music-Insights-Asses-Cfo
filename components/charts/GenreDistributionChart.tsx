'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GenreDistribution } from '@/lib/types';

interface Props {
  data: GenreDistribution[];
}

const COLORS = [
  '#9F2F2D', // accent-red-text
  '#1F6C9F', // accent-blue-text
  '#346538', // accent-green-text
  '#956400', // accent-yellow-text
  '#787774', // text-muted
  '#2F3437', // text-secondary
  '#111111', // text-primary
  '#EAEAEA', // border
];

export default function GenreDistributionChart({ data }: Props) {
  const chartData = data.map((item) => ({
    name: item.genre,
    value: item.count,
    percentage: item.percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAEAEA',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value} albums (${props.payload.percentage.toFixed(1)}%)`,
            name,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
