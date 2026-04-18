export const formatCurrency = (num, compact = false) => {
  if (num === null || num === undefined) return '—';
  if (compact && num >= 1_000_000) {
    return '$' + (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (compact && num >= 1_000) {
    return '$' + (num / 1_000).toFixed(0) + 'K';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatPercent = (value, total) => {
  if (!total) return '0%';
  return Math.round((value / total) * 100) + '%';
};
