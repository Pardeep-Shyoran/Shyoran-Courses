/**
 * Returns YYYY-MM-DD string formatted according to Indian Standard Time (Asia/Kolkata).
 * Day boundary starts at 12:00 AM (midnight) IST.
 */
export function getISTDateStr(date = new Date()) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

/**
 * Returns the YYYY-MM-DD string for the day preceding dateStr.
 */
export function getPrevISTDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const prev = new Date(Date.UTC(y, m - 1, d - 1));
  return prev.toISOString().split('T')[0];
}
