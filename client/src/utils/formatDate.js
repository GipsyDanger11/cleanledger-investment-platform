export const formatDate = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(d);
};

export const formatDateShort = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
  }).format(d);
};
