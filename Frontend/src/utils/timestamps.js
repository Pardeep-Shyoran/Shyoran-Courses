/**
 * Parses text and wraps raw or bracketed timestamps (e.g. 05:23, [12:34], 1:02:45, [1:02:45])
 * into markdown seek links (e.g. [05:23](seek://323)) so they render as interactive buttons.
 * Avoids matching timestamps already formatted as links or inside URLs.
 * 
 * @param {string} text 
 * @returns {string}
 */
export function parseTimestamps(text) {
  if (!text) return "";
  
  // Regex matches optionally bracketed timestamps: [HH:MM:SS], [MM:SS], HH:MM:SS, MM:SS
  // Negative lookahead (?!\() ensures we don't re-match already formatted markdown links like [05:23](seek://323)
  // Negative lookbehind (?<=\w) ensures we don't match middle of words/URLs
  const regex = /(?<![/\w])\[?(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\]?(?!\()/g;
  
  return text.replace(regex, (match, hrs, mins, secs) => {
    const h = hrs ? parseInt(hrs, 10) : 0;
    const m = parseInt(mins, 10);
    const s = parseInt(secs, 10);
    const totalSeconds = h * 3600 + m * 60 + s;
    
    const display = `${hrs ? hrs + ':' : ''}${mins.padStart(2, '0')}:${secs.padStart(2, '0')}`;
    return `[${display}](seek://${totalSeconds})`;
  });
}

/**
 * Format total seconds into a standard HH:MM:SS or MM:SS timestamp string
 * @param {number} totalSeconds 
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds)) return "00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

