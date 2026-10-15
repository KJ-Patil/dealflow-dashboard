'use client';

import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { useAppSelector } from '@/src/store/hooks';
import { CHART_COLORS, getTooltipStyle, AXIS_STROKE, GRID_STROKE } from './palette';

interface ScatterChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  zKey?: string;
  xLabel?: string;
  yLabel?: string;
  xFormatter?: (v: number) => string;
  xTicks?: number[];
  xDomain?: [number, number];
  height?: number;
  ariaLabel?: string;
}

export default function ScatterChartComponent({
  data,
  xKey,
  yKey,
  zKey,
  xLabel,
  yLabel,
  xFormatter,
  xTicks,
  xDomain,
  height = 300,
  ariaLabel = 'Scatter chart',
}: ScatterChartProps) {
  const theme = useAppSelector((s) => s.ui.theme);
  const colors = CHART_COLORS[theme];

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis
            dataKey={xKey}
            name={xLabel ?? xKey}
            type="number"
            domain={xDomain ?? ['auto', 'auto']}
            ticks={xTicks}
            tick={{ fontSize: 12, fill: AXIS_STROKE }}
            stroke={AXIS_STROKE}
            tickFormatter={xFormatter}
          />
          <YAxis
            dataKey={yKey}
            name={yLabel ?? yKey}
            tick={{ fontSize: 12, fill: AXIS_STROKE }}
            stroke={AXIS_STROKE}
          />
          {zKey && <ZAxis dataKey={zKey} range={[40, 400]} />}
          <Tooltip
            contentStyle={getTooltipStyle()}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter
            data={data}
            fill={colors[0]}
            animationDuration={800}
          />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
