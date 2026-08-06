import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Fetches the transcript for a given YouTube Video ID.
 * Concatenates the pieces into a single readable string.
 * @param {string} videoId 
 * @returns {Promise<string>}
 */
export async function getYoutubeTranscript(videoId) {
  try {
    if (!videoId) {
      throw new Error("Video ID is required");
    }
    const transcriptPieces = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcriptPieces || transcriptPieces.length === 0) {
      throw new Error("No transcript found for this video.");
    }
    // Map and join text pieces with timestamp markers every ~30 seconds
    let formattedTranscript = "";
    let lastTimestampSec = -30;

    transcriptPieces.forEach(item => {
      const cleanText = item.text
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

      // Convert offset (ms or s) to total seconds
      const rawOffset = Number(item.offset || 0);
      const offsetSec = Math.floor(rawOffset > 5000 ? rawOffset / 1000 : rawOffset);
      
      // Inject timestamp marker every 30 seconds
      if (offsetSec - lastTimestampSec >= 30 || lastTimestampSec === -30) {
        const hrs = Math.floor(offsetSec / 3600);
        const mins = Math.floor((offsetSec % 3600) / 60);
        const secs = offsetSec % 60;
        const timeStr = hrs > 0 
          ? `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
          : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        formattedTranscript += `\n[${timeStr}] `;
        lastTimestampSec = offsetSec;
      }
      
      formattedTranscript += `${cleanText} `;
    });

    return formattedTranscript.trim();
  } catch (error) {
    console.error(`Error fetching transcript for video ${videoId}:`, error.message);
    throw new Error(`Could not retrieve transcript: ${error.message}`);
  }
}
