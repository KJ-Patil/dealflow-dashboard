'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { useAppSelector } from '@/src/store/hooks';
import { CHART_COLORS, getTooltipStyle, AXIS_STROKE, GRID_STROKE } from './palette';

interface LineConfig {
  dataKey: string;
  name: string;
}

interface LineChartProps {
  data: Record<string, unknown>[];
  lines: LineConfig[];
  xKey: string;
  height?: number;
  yFormatter?: (v: number) => string;
  yLabel?: string;
  ariaLabel?: string;
}

export default function LineChartComponent({
  data,
  lines,
  xKey,
  height = 300,
  yFormatter,
  yLabel,
  ariaLabel = 'Line chart',
}: LineChartProps) {
  const theme = useAppSelector((s) => s.ui.theme);
  const colors = CHART_COLORS[theme];

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <defs>
            {lines.map((line, i) => (
              <linearGradient key={line.dataKey} id={`grad-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
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
          <Tooltip contentStyle={getTooltipStyle()} />
          <Legend />
          {lines.map((line, i) => (
            <Area
              key={`area-${line.dataKey}`}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              fill={`url(#grad-${line.dataKey})`}
              stroke="none"
              animationDuration={800}
              legendType="none"
            />
          ))}
          {lines.map((line, i) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={colors[i % colors.length]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: 'var(--bg-card)', stroke: colors[i % colors.length] }}
              animationDuration={800}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
