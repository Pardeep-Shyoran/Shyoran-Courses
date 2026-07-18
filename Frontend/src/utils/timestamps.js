/**
 * Parses text and wraps raw or bracketed timestamps (e.g. 05:23, [12:34], 1:02:45)
 * into markdown seek links (e.g. [05:23](seek://323)) so they render as interactive buttons.
 * Avoids matching timestamps already formatted as links.
 * 
 * @param {string} text 
 * @returns {string}
 */
export function parseTimestamps(text) {
  if (!text) return "";
  
  // Regex matches optionally bracketed timestamps: [HH:MM:SS], [MM:SS], HH:MM:SS, MM:SS
  // Negative lookahead (?!\() ensures we don't re-match already formatted markdown links
  const regex = /\[?(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\]?(?!\()/g;
  
  return text.replace(regex, (match, hrs, mins, secs) => {
    const h = hrs ? parseInt(hrs, 10) : 0;
    const m = parseInt(mins, 10);
    const s = parseInt(secs, 10);
    const totalSeconds = h * 3600 + m * 60 + s;
    
    const display = `${hrs ? hrs + ':' : ''}${mins.padStart(2, '0')}:${secs.padStart(2, '0')}`;
    return `[${display}](seek://${totalSeconds})`;
  });
}
