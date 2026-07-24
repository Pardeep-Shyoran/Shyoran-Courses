import config from "../config/config.js";

export function extractPlaylistId(url) {
  if (!url) return null;
  const match = url.match(/[?&]list=([^#\&\?]+)/);
  return match ? match[1] : url.trim();
}

export function extractVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Convert ISO 8601 duration (e.g. PT15M24S) to mm:ss or hh:mm:ss
function parseISODuration(isoDuration) {
  if (!isoDuration) return "";
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function fetchFromOfficialApi(playlistId, apiKey) {
  try {
    // 1. Fetch Playlist details (Title, Description, Thumbnail)
    const metaUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
    const metaRes = await fetch(metaUrl);
    if (!metaRes.ok) {
      throw new Error(`YouTube API returned status ${metaRes.status} for playlist metadata.`);
    }
    const metaData = await metaRes.json();
    if (!metaData.items || metaData.items.length === 0) {
      throw new Error("Playlist not found or is private.");
    }
    
    const playlistSnippet = metaData.items[0].snippet;
    const title = playlistSnippet.title || "Imported Playlist";
    const description = playlistSnippet.description || "";
    const thumbnail = playlistSnippet.thumbnails?.high?.url || 
                      playlistSnippet.thumbnails?.medium?.url || 
                      playlistSnippet.thumbnails?.default?.url || "";

    // 2. Fetch ALL Playlist Items using pagination tokens (no limit of 100)
    let videos = [];
    let nextPageToken = "";
    const maxPages = 200; // Cap at ~10,000 videos as safety limit
    let pageCount = 0;
    
    do {
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;
      const itemsRes = await fetch(itemsUrl);
      if (!itemsRes.ok) {
        break; 
      }
      const itemsData = await itemsRes.json();
      if (!itemsData.items || itemsData.items.length === 0) {
        break;
      }

      const pageVideoIds = [];
      const pageVideos = [];
      
      for (const item of itemsData.items) {
        const vSnippet = item.snippet;
        const vDetails = item.contentDetails;
        if (!vSnippet || !vSnippet.resourceId?.videoId) continue;
        
        const vTitle = vSnippet.title || "Untitled Video";
        // Ignore deleted or private video entries in playlist
        if (vTitle === "Private video" || vTitle === "Deleted video") continue;

        const youtubeId = vSnippet.resourceId.videoId;
        let duration = vDetails?.duration ? parseISODuration(vDetails.duration) : "";

        pageVideoIds.push(youtubeId);
        pageVideos.push({
          title: vTitle,
          youtubeId,
          duration,
          completed: false,
          notes: ""
        });
      }

      // If durations are missing (playlistItems API does not provide ISO duration), batch query videos API
      const missingDurationIds = pageVideos.filter(v => !v.duration).map(v => v.youtubeId);
      if (missingDurationIds.length > 0) {
        try {
          const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${missingDurationIds.join(',')}&key=${apiKey}`);
          if (videoRes.ok) {
            const videoData = await videoRes.json();
            const durationMap = new Map();
            if (videoData.items) {
              for (const vItem of videoData.items) {
                if (vItem.contentDetails?.duration) {
                  durationMap.set(vItem.id, parseISODuration(vItem.contentDetails.duration));
                }
              }
            }
            for (const v of pageVideos) {
              if (!v.duration && durationMap.has(v.youtubeId)) {
                v.duration = durationMap.get(v.youtubeId);
              }
            }
          }
        } catch (err) {
          console.warn("Batch video duration fetch warning:", err.message);
        }
      }

      videos.push(...pageVideos);
      
      nextPageToken = itemsData.nextPageToken;
      pageCount++;
    } while (nextPageToken && pageCount < maxPages);
    
    return {
      title,
      description,
      thumbnail,
      playlistId,
      videos
    };
  } catch (error) {
    throw new Error(`YouTube API Error: ${error.message}`);
  }
}

export async function scrapePlaylist(playlistId) {
  // If user has configured a Google API Key, use the official API
  const apiKey = config.YOUTUBE_API_KEY;
  if (apiKey) {
    console.log("Using YouTube Data API Key for secure import...");
    return fetchFromOfficialApi(playlistId, apiKey);
  }

  // Fallback to HTML scraper if no key is configured
  console.log("No API Key configured. Falling back to public scraper...");
  const url = `https://www.youtube.com/playlist?list=${playlistId}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache"
      }
    });

    if (!response.ok) {
      throw new Error(`YouTube returned status ${response.status}`);
    }

    const html = await response.text();
    
    // Look for ytInitialData JSON object in the page HTML
    const regex = /(?:window\["ytInitialData"\]|ytInitialData)\s*=\s*({[\s\S]*?});/m;
    const match = html.match(regex);
    
    if (!match) {
      throw new Error("Could not find playlist data. Make sure it is public.");
    }

    let data;
    try {
      data = JSON.parse(match[1]);
    } catch (e) {
      throw new Error("Failed to parse YouTube playlist data payload.");
    }

    // Check if the scraper was blocked (YouTube outputs only responseContext due to bot challenge)
    if (!data.contents || Object.keys(data).length <= 2) {
      throw new Error("YouTube blocked the automated scraper (reCAPTCHA triggered). To import playlists instantly, please add a free YOUTUBE_API_KEY to your backend .env file, or create a custom course manually.");
    }

    const sidebar = data.sidebar?.playlistSidebarRenderer?.items;
    const primaryInfo = sidebar?.[0]?.playlistSidebarPrimaryInfoRenderer;
    
    const title = data.metadata?.playlistMetadataRenderer?.title || 
                  primaryInfo?.title?.runs?.[0]?.text || 
                  primaryInfo?.title?.simpleText || 
                  "Imported Playlist";
                  
    const description = primaryInfo?.description?.simpleText || 
                        primaryInfo?.description?.runs?.map(r => r.text).join("") || 
                        "No description provided.";
                        
    let thumbnail = primaryInfo?.thumbnailRenderer?.playlistVideoThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url || "";
    if (thumbnail && thumbnail.startsWith("//")) {
      thumbnail = "https:" + thumbnail;
    }

    const sectionList = data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer;
    const contents = sectionList?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;
    
    if (!contents || !Array.isArray(contents)) {
      throw new Error("No videos found in this playlist. Ensure it contains public videos.");
    }

    const videos = [];
    let continuationToken = null;

    for (const item of contents) {
      if (item.playlistVideoRenderer) {
        const v = item.playlistVideoRenderer;
        if (!v || !v.videoId) continue;

        const vTitle = v.title?.runs?.[0]?.text || v.title?.simpleText || "Untitled Video";
        if (vTitle === "Private video" || vTitle === "Deleted video") continue;
        const youtubeId = v.videoId;
        const duration = v.lengthText?.simpleText || v.lengthText?.runs?.[0]?.text || "";
        
        videos.push({
          title: vTitle,
          youtubeId,
          duration,
          completed: false,
          notes: ""
        });
      } else if (item.continuationItemRenderer) {
        continuationToken = item.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
      }
    }

    // Follow continuation tokens if playlist has more than ~100 items
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":\s*"([^"]+)"/) || html.match(/"apiKey":\s*"([^"]+)"/);
    const innertubeApiKey = apiKeyMatch ? apiKeyMatch[1] : "";

    let continuationCount = 0;
    const maxContinuations = 100; // Cap at ~10,000 items

    while (continuationToken && continuationCount < maxContinuations) {
      continuationCount++;
      try {
        const contUrl = `https://www.youtube.com/youtubei/v1/browse?key=${innertubeApiKey}`;
        const contRes = await fetch(contUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          body: JSON.stringify({
            continuation: continuationToken,
            context: {
              client: {
                clientName: "WEB",
                clientVersion: "2.20240101.00.00"
              }
            }
          })
        });

        if (!contRes.ok) break;
        const contData = await contRes.json();
        const actions = contData.onResponseReceivedActions;
        if (!actions || !Array.isArray(actions)) break;

        let newItems = [];
        for (const action of actions) {
          if (action.appendContinuationItemsAction?.continuationItems) {
            newItems = action.appendContinuationItemsAction.continuationItems;
          }
        }

        if (newItems.length === 0) break;

        continuationToken = null;

        for (const item of newItems) {
          if (item.playlistVideoRenderer) {
            const v = item.playlistVideoRenderer;
            if (!v || !v.videoId) continue;

            const vTitle = v.title?.runs?.[0]?.text || v.title?.simpleText || "Untitled Video";
            if (vTitle === "Private video" || vTitle === "Deleted video") continue;
            const youtubeId = v.videoId;
            const duration = v.lengthText?.simpleText || v.lengthText?.runs?.[0]?.text || "";

            videos.push({
              title: vTitle,
              youtubeId,
              duration,
              completed: false,
              notes: ""
            });
          } else if (item.continuationItemRenderer) {
            continuationToken = item.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
          }
        }
      } catch (e) {
        console.warn("Failed to fetch continuation page:", e.message);
        break;
      }
    }

    if (!thumbnail && videos.length > 0) {
      thumbnail = `https://img.youtube.com/vi/${videos[0].youtubeId}/hqdefault.jpg`;
    }

    return {
      title,
      description,
      thumbnail,
      playlistId,
      videos
    };
  } catch (error) {
    console.error("Scraper Error:", error);
    if (apiKey) {
      throw error;
    }
    if (error.message.includes("blocked") || error.message.includes("reCAPTCHA")) {
      throw error;
    }
    throw new Error(`YouTube blocked the automated scraper (reCAPTCHA/Bot check triggered). Please add a free YOUTUBE_API_KEY to your backend .env file for instant, reliable playlist imports.`);
  }
}
