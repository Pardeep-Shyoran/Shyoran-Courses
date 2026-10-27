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

/**
 * Returns day difference between two YYYY-MM-DD strings (dateStr2 - dateStr1).
 */
export function getISTDayDiff(dateStr1, dateStr2) {
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Returns array of dates (YYYY-MM-DD) strictly between startDateStr and endDateStr.
 */
export function getDatesBetween(startDateStr, endDateStr) {
  const result = [];
  const [y, m, d] = startDateStr.split('-').map(Number);
  const cur = new Date(Date.UTC(y, m - 1, d + 1));
  while (cur.toISOString().split('T')[0] < endDateStr) {
    result.push(cur.toISOString().split('T')[0]);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return result;
}
