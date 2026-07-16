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
    // Map and join the text pieces
    return transcriptPieces
      .map(item => {
        // Decode HTML entities that might be in YouTube captions (like &amp;, &#39;, &quot;)
        return item.text
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
      })
      .join(" ");
  } catch (error) {
    console.error(`Error fetching transcript for video ${videoId}:`, error.message);
    throw new Error(`Could not retrieve transcript: ${error.message}`);
  }
}
