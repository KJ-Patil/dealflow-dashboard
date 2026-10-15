export const CHART_COLORS = {
  light: ['#6366f1', '#0891b2', '#059669', '#d97706', '#dc2626', '#8b5cf6'],
  dark: ['#818cf8', '#22d3ee', '#34d399', '#fbbf24', '#f87171', '#a78bfa'],
} as const;

export type Theme = 'light' | 'dark';

export function getTooltipStyle(): React.CSSProperties {
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: 'var(--text-primary)',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  };
}

export const AXIS_STROKE = '#94a3b8';
export const GRID_STROKE = 'rgba(148, 163, 184, 0.15)';
