export const formatConfidence = (score) => {
  if (score == null) return 'N/A';
  return (score * 100).toFixed(1) + '%';
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};