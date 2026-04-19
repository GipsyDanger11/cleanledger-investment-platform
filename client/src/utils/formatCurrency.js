export const formatCurrency = (num, compact = false) => {
  if (num === null || num === undefined) return '—';
  if (compact && num >= 10_00_00_000) {
    return '₹' + (num / 10_00_00_000).toFixed(1).replace(/\.0$/, '') + 'Cr';
  }
  if (compact && num >= 1_00_000) {
    return '₹' + (num / 1_00_000).toFixed(1).replace(/\.0$/, '') + 'L';
  }
  if (compact && num >= 1_000) {
    return '₹' + (num / 1_000).toFixed(0) + 'K';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatPercent = (value, total) => {
  if (!total) return '0%';
  return Math.round((value / total) * 100) + '%';
};
