const Cr = 1_00_00_000;
const L = 1_00_000;

export function formatINR(amount: number): string {
  if (amount >= Cr) {
    const val = amount / Cr;
    return `₹${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} Cr`;
  }
  if (amount >= L) {
    const val = amount / L;
    return `₹${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export function formatINRShort(amount: number): string {
  if (amount >= Cr) {
    const val = amount / Cr;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} Cr`;
  }
  if (amount >= L) {
    const val = amount / L;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} L`;
  }
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return String(amount);
}
