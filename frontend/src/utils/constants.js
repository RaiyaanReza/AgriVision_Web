export const getSeverityColor = (severity) => {
  const map = {
    healthy: 'success',
    mild: 'warning',
    severe: 'error',
    info: 'info'
  };
  return map[severity?.toLowerCase()] || 'info';
};