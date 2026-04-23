export const formatLatency = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms.toFixed(0)}ms`;
};

export const formatPercent = (val: number): string => `${val.toFixed(2)}%`;

export const formatLargeNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
};
