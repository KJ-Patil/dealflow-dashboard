'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '@/src/store/hooks';
import { CHART_COLORS, getTooltipStyle, AXIS_STROKE, GRID_STROKE } from './palette';

interface BarConfig {
  dataKey: string;
  name: string;
}

interface BarChartProps {
  data: Record<string, unknown>[];
  bars: BarConfig[];
  xKey: string;
  height?: number;
  stacked?: boolean;
  yFormatter?: (v: number) => string;
  yLabel?: string;
  ariaLabel?: string;
}

export default function BarChartComponent({
  data,
  bars,
  xKey,
  height = 300,
  stacked = false,
  yFormatter,
  yLabel,
  ariaLabel = 'Bar chart',
}: BarChartProps) {
  const theme = useAppSelector((s) => s.ui.theme);
  const colors = CHART_COLORS[theme];

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <defs>
            {bars.map((bar, i) => (
              <linearGradient key={bar.dataKey} id={`barGrad-${bar.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.5} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: AXIS_STROKE }}
            stroke={GRID_STROKE}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: AXIS_STROKE }}
            stroke={GRID_STROKE}
            axisLine={false}
            tickLine={false}
            tickFormatter={yFormatter}
            width={70}
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: 11, fill: AXIS_STROKE } } : undefined}
          />
          <Tooltip contentStyle={getTooltipStyle()} cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} />
          <Legend />
          {bars.map((bar, i) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={`url(#barGrad-${bar.dataKey})`}
              stackId={stacked ? 'stack' : undefined}
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
