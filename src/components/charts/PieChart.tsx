'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '@/src/store/hooks';
import { CHART_COLORS, getTooltipStyle } from './palette';

interface PieDataItem {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieDataItem[];
  height?: number;
  innerRadius?: number;
  ariaLabel?: string;
}

export default function PieChartComponent({
  data,
  height = 300,
  innerRadius = 0,
  ariaLabel = 'Pie chart',
}: PieChartProps) {
  const theme = useAppSelector((s) => s.ui.theme);
  const colors = CHART_COLORS[theme];

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <defs>
            {data.map((_, i) => (
              <linearGradient key={i} id={`pieGrad-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.95} />
                <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.65} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="75%"
            paddingAngle={3}
            animationDuration={800}
            cornerRadius={4}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={`url(#pieGrad-${i})`}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value, name) => {
              const v = Number(value ?? 0);
              const total = data.reduce((s, d) => s + d.value, 0);
              const pct = total > 0 ? ((v / total) * 100).toFixed(0) : '0';
              return [`${v} (${pct}%)`, name];
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
