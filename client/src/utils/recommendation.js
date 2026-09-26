export function recommendation(score) {
  if (score === undefined || score === null) return { label: 'Analysis pending', color: 'default' };
  if (score >= 85) return { label: 'Highly recommended', color: 'success' };
  if (score >= 70) return { label: 'Recommended', color: 'primary' };
  if (score >= 50) return { label: 'Review manually', color: 'warning' };
  return { label: 'Low fit', color: 'error' };
}

export async function downloadResume(api, applicationId, fileName = 'resume') {
  const response = await api.get(`/applications/${applicationId}/resume`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
