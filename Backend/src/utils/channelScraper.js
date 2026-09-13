import config from "../config/config.js";

// Helper to extract handle or channel ID from various YouTube URL formats
export function parseChannelInput(input) {
  if (!input || typeof input !== "string") return { type: "unknown", value: "" };
  const trimmed = input.trim();

  // 1. Direct channel ID (starts with UC, ~24 characters)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: "id", value: trimmed };
  }

  // 2. Direct handle e.g. "@kurzgesagt" or "kurzgesagt"
  if (trimmed.startsWith("@")) {
    return { type: "handle", value: trimmed.replace(/^@/, "").trim() };
  }

  // 3. YouTube URLs
  try {
    const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const pathname = urlObj.pathname;

    // e.g. /@channelhandle or /@channelhandle/videos
    const handleMatch = pathname.match(/^\/@([^\/\?#]+)/);
    if (handleMatch) {
      return { type: "handle", value: handleMatch[1] };
    }

    // e.g. /channel/UCsXVk37bltHxD1rDPwtNM8Q
    const channelMatch = pathname.match(/^\/channel\/(UC[\w-]{22})/);
    if (channelMatch) {
      return { type: "id", value: channelMatch[1] };
    }

    // e.g. /c/ChannelName or /user/ChannelName
    const cMatch = pathname.match(/^\/(?:c|user)\/([^\/\?#]+)/);
    if (cMatch) {
      return { type: "custom", value: cMatch[1] };
    }
  } catch (e) {
    // Not a valid URL, treat as handle if alphanumeric
  }

  // Fallback: assume plain alphanumeric handle string
  const cleanStr = trimmed.replace(/[^\w.-]/g, "");
  return { type: "handle", value: cleanStr };
}

// Resolve channel metadata using YouTube Data API or public YouTube channel page fallback
export async function resolveChannel(input) {
  const parsed = parseChannelInput(input);
  if (!parsed.value) {
    throw new Error("Invalid YouTube channel link or handle provided.");
  }

  const apiKey = config.YOUTUBE_API_KEY;

  // Attempt 1: Official YouTube Data API v3
  if (apiKey) {
    try {
      let apiUrl = "";
      if (parsed.type === "id") {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${parsed.value}&key=${apiKey}`;
      } else if (parsed.type === "handle") {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&forHandle=${parsed.value}&key=${apiKey}`;
      } else if (parsed.type === "custom") {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&forUsername=${parsed.value}&key=${apiKey}`;
      }

      if (apiUrl) {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            const item = data.items[0];
            const channelId = item.id;
            const snippet = item.snippet || {};
            const channelTitle = snippet.title || "YouTube Channel";
            const channelHandle = snippet.customUrl ? (snippet.customUrl.startsWith("@") ? snippet.customUrl : `@${snippet.customUrl}`) : `@${parsed.value}`;
            const description = snippet.description || "";
            const avatarUrl =
              snippet.thumbnails?.high?.url ||
              snippet.thumbnails?.medium?.url ||
              snippet.thumbnails?.default?.url ||
              "";
            const uploadsPlaylist = item.contentDetails?.relatedPlaylists?.uploads || `UU${channelId.slice(2)}`;

            return {
              channelId,
              channelTitle,
              channelHandle,
              description,
              avatarUrl,
              uploadsPlaylist
            };
          }
        }
      }
    } catch (err) {
      console.warn("YouTube API resolveChannel warning:", err.message);
    }
  }

  // Attempt 2: Public YouTube HTML & RSS Fallback
  try {
    let targetUrl = "";
    if (parsed.type === "id") {
      targetUrl = `https://www.youtube.com/channel/${parsed.value}`;
    } else {
      targetUrl = `https://www.youtube.com/@${parsed.value}`;
    }

    const htmlRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    if (!htmlRes.ok) {
      throw new Error(`YouTube returned status ${htmlRes.status} for channel page.`);
    }

    const html = await htmlRes.text();

    // Extract Channel ID
    let channelId = parsed.type === "id" ? parsed.value : "";
    if (!channelId) {
      const idMatch =
        html.match(/<meta\s+itemprop="identifier"\s+content="(UC[\w-]{22})"/i) ||
        html.match(/<meta\s+itemprop="channelId"\s+content="(UC[\w-]{22})"/i) ||
        html.match(/"channelId":\s*"(UC[\w-]{22})"/i) ||
        html.match(/"browseId":\s*"(UC[\w-]{22})"/i);
      if (idMatch) {
        channelId = idMatch[1];
      }
    }

    if (!channelId) {
      throw new Error("Could not detect YouTube Channel ID. Please make sure the handle or URL is correct.");
    }

    // Extract Channel Title
    let channelTitle = "";
    const titleMatch =
      html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
      html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      channelTitle = titleMatch[1].replace(/ - YouTube$/, "").trim();
    }

    // Extract Avatar URL
    let avatarUrl = "";
    const avatarMatch =
      html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
      html.match(/"avatar":\s*\{\s*"thumbnails":\s*\[\s*\{\s*"url":\s*"([^"]+)"/i);
    if (avatarMatch) {
      avatarUrl = avatarMatch[1];
    }

    // Extract Description
    let description = "";
    const descMatch =
      html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
      html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (descMatch) {
      description = descMatch[1];
    }

    const channelHandle = parsed.type === "handle" ? `@${parsed.value}` : `@${channelTitle.replace(/\s+/g, "").toLowerCase()}`;
    const uploadsPlaylist = `UU${channelId.slice(2)}`;

    return {
      channelId,
      channelTitle: channelTitle || parsed.value,
      channelHandle,
      description,
      avatarUrl,
      uploadsPlaylist
    };
  } catch (err) {
    throw new Error(`Failed to resolve channel: ${err.message}`);
  }
}

// Helper to convert ISO 8601 duration (e.g. PT1H2M34S, PT54S) to mm:ss or hh:mm:ss
export function parseDuration(pt) {
  if (!pt) return "";
  const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1], 10) || 0;
  const m = parseInt(match[2], 10) || 0;
  const s = parseInt(match[3], 10) || 0;
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m}:${s.toString().padStart(2, "0")}`;
}

// Helper to convert mm:ss or hh:mm:ss to total seconds
export function parseDurationSeconds(durationStr) {
  if (!durationStr || typeof durationStr !== "string") return 0;
  const parts = durationStr.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

// Authoritative YouTube Short check via HEAD request (returns 200 for shorts, 303 for regular videos)
export async function checkIsYoutubeShort(videoId) {
  if (!videoId) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    clearTimeout(timeout);
    return res.status === 200;
  } catch {
    return false;
  }
}

// Detect video format: full video, short, or live stream
export function detectVideoFormat({
  duration = "",
  title = "",
  description = "",
  liveBroadcastContent = "",
  hasLiveStreamingDetails = false,
  tags = [],
  isShortAuthoritative = null
}) {
  // 1. Live stream detection (API authoritative or active status)
  if (
    hasLiveStreamingDetails ||
    liveBroadcastContent === "live" ||
    liveBroadcastContent === "upcoming"
  ) {
    return "live";
  }

  const lowerTitle = (title || "").toLowerCase();
  const lowerDesc = (description || "").toLowerCase();

  // Pattern-based Live detection (for RSS or concluded broadcasts)
  if (
    lowerTitle.includes("[live]") ||
    lowerTitle.includes("(live)") ||
    lowerTitle.includes("live stream") ||
    lowerTitle.includes("🔴 live") ||
    lowerTitle.includes("🔴") ||
    lowerTitle.includes("streamed live") ||
    lowerTitle.includes("the hindu analysis") ||
    lowerDesc.includes("streamed live") ||
    /\b(webinar|premiere)\b/i.test(lowerTitle)
  ) {
    return "live";
  }

  // 2. Authoritative Shorts detection (direct HEAD check result)
  if (isShortAuthoritative === true) {
    return "short";
  }

  // Pattern-based Shorts detection
  if (
    /#\w*short/i.test(lowerTitle) ||
    /#\w*short/i.test(lowerDesc) ||
    lowerTitle.includes("trendingshorts") ||
    lowerTitle.includes("ytshorts") ||
    (Array.isArray(tags) && tags.some(t => /short/i.test(t)))
  ) {
    return "short";
  }

  // Duration-based checks
  const totalSec = parseDurationSeconds(duration);
  if (totalSec > 0) {
    // Up to 60 seconds is always a short on YouTube
    if (totalSec <= 60) {
      return "short";
    }
    // Up to 180 seconds (3 mins) with hashtags or short-form characteristics
    if (totalSec <= 180 && (lowerTitle.includes("#") || isShortAuthoritative !== false)) {
      if (lowerTitle.includes("#") || isShortAuthoritative === true) {
        return "short";
      }
    }
  }

  return "video";
}

// Fetch latest videos for a channel with dual-engine (YouTube Data API + Atom RSS Fallback)
export async function fetchLatestChannelVideos(channelId, uploadsPlaylist, maxResults = 25) {
  if (!channelId) return [];
  const apiKey = config.YOUTUBE_API_KEY;
  const playlistId = uploadsPlaylist || `UU${channelId.slice(2)}`;

  // Engine 1: YouTube Data API (returns high-res thumbnails, durations, view counts, liveStreamingDetails)
  if (apiKey) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const videoIds = [];
          const videos = [];

          for (const item of data.items) {
            const snip = item.snippet;
            const vidId = item.contentDetails?.videoId || snip?.resourceId?.videoId;
            if (!vidId) continue;
            const title = snip.title || "Untitled Video";
            if (title === "Private video" || title === "Deleted video") continue;

            videoIds.push(vidId);
            videos.push({
              youtubeId: vidId,
              title,
              publishedAt: snip.publishedAt ? new Date(snip.publishedAt) : new Date(),
              thumbnail: snip.thumbnails?.high?.url || snip.thumbnails?.medium?.url || `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
              duration: "",
              viewCount: "",
              description: snip.description || "",
              channelTitle: snip.channelTitle || snip.videoOwnerChannelTitle || "",
              liveBroadcastContent: "",
              hasLiveStreamingDetails: false,
              tags: []
            });
          }

          // Enrich with duration, viewCount, snippet, and liveStreamingDetails in batch
          if (videoIds.length > 0) {
            try {
              const vRes = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,liveStreamingDetails&id=${videoIds.join(",")}&key=${apiKey}`
              );
              if (vRes.ok) {
                const vData = await vRes.json();
                const vMap = new Map();
                for (const vItem of vData.items || []) {
                  vMap.set(vItem.id, vItem);
                }

                for (const v of videos) {
                  const info = vMap.get(v.youtubeId);
                  if (info) {
                    if (info.contentDetails?.duration) {
                      v.duration = parseDuration(info.contentDetails.duration);
                    }
                    if (info.statistics?.viewCount) {
                      v.viewCount = info.statistics.viewCount;
                    }
                    if (info.snippet?.liveBroadcastContent) {
                      v.liveBroadcastContent = info.snippet.liveBroadcastContent;
                    }
                    if (info.liveStreamingDetails) {
                      v.hasLiveStreamingDetails = true;
                    }
                    if (info.snippet?.tags) {
                      v.tags = info.snippet.tags;
                    }
                  }
                }
              }
            } catch (vErr) {
              console.warn("Batch video metadata enrichment warning:", vErr.message);
            }
          }

          // Authoritative HEAD checks for candidate videos (<= 180s duration or empty duration)
          const shortCandidates = videos.filter(
            v => !v.hasLiveStreamingDetails && v.liveBroadcastContent !== "live" && parseDurationSeconds(v.duration) <= 180
          );

          const shortResults = await Promise.allSettled(
            shortCandidates.map(async v => {
              const isShort = await checkIsYoutubeShort(v.youtubeId);
              return { youtubeId: v.youtubeId, isShort };
            })
          );

          const shortMap = new Map();
          for (const res of shortResults) {
            if (res.status === "fulfilled" && res.value) {
              shortMap.set(res.value.youtubeId, res.value.isShort);
            }
          }

          // Assign final videoType format (video, short, live)
          for (const v of videos) {
            const isShortAuth = shortMap.has(v.youtubeId) ? shortMap.get(v.youtubeId) : null;
            v.videoType = detectVideoFormat({
              duration: v.duration,
              title: v.title,
              description: v.description,
              liveBroadcastContent: v.liveBroadcastContent,
              hasLiveStreamingDetails: v.hasLiveStreamingDetails,
              tags: v.tags,
              isShortAuthoritative: isShortAuth
            });
          }

          if (videos.length > 0) {
            return videos;
          }
        }
      }
    } catch (err) {
      console.warn("YouTube API fetchLatestChannelVideos warning:", err.message);
    }
  }

  // Engine 2: YouTube Official Public Atom RSS Feed (100% Free, Zero Quota)
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const rssRes = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/atom+xml,application/xml,text/xml;q=0.9"
      }
    });

    if (!rssRes.ok) {
      throw new Error(`YouTube RSS returned status ${rssRes.status}`);
    }

    const xmlText = await rssRes.text();

    // Parse channel author title if needed
    const authorMatch = xmlText.match(/<author>\s*<name>([^<]+)<\/name>/i);
    const feedChannelTitle = authorMatch ? authorMatch[1].trim() : "";

    // Parse all <entry> blocks
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const entries = [...xmlText.matchAll(entryRegex)];
    const rawVideos = [];

    for (const match of entries.slice(0, maxResults)) {
      const entryContent = match[1];

      const idMatch = entryContent.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
      const vidId = idMatch ? idMatch[1].trim() : null;
      if (!vidId) continue;

      const titleMatch = entryContent.match(/<title>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() : "Untitled Video";

      const pubMatch = entryContent.match(/<published>([^<]+)<\/published>/i);
      const publishedAt = pubMatch ? new Date(pubMatch[1]) : new Date();

      const thumbMatch = entryContent.match(/<media:thumbnail\s+url="([^"]+)"/i);
      const thumbnail = thumbMatch ? thumbMatch[1] : `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;

      const descMatch = entryContent.match(/<media:description>([\s\S]*?)<\/media:description>/i);
      const description = descMatch ? descMatch[1].trim() : "";

      const viewsMatch = entryContent.match(/<media:statistics\s+views="([^"]+)"/i);
      const viewCount = viewsMatch ? viewsMatch[1] : "";

      rawVideos.push({
        youtubeId: vidId,
        title,
        publishedAt,
        thumbnail,
        duration: "",
        viewCount,
        description,
        channelTitle: feedChannelTitle
      });
    }

    // Fast parallel HEAD checks to authoritatively distinguish Shorts in RSS feed
    const shortHeadResults = await Promise.allSettled(
      rawVideos.map(async v => {
        const isShort = await checkIsYoutubeShort(v.youtubeId);
        return { youtubeId: v.youtubeId, isShort };
      })
    );

    const rssShortMap = new Map();
    for (const res of shortHeadResults) {
      if (res.status === "fulfilled" && res.value) {
        rssShortMap.set(res.value.youtubeId, res.value.isShort);
      }
    }

    const videos = rawVideos.map(v => {
      const isShortAuth = rssShortMap.get(v.youtubeId);
      const videoType = detectVideoFormat({
        title: v.title,
        description: v.description,
        isShortAuthoritative: isShortAuth
      });
      return {
        ...v,
        videoType
      };
    });

    return videos;
  } catch (rssErr) {
    console.error("fetchLatestChannelVideos RSS Error:", rssErr.message);
    return [];
  }
}

// Curated high-value educational student channels
export const CURATED_STUDENT_PRESETS = [
  // ⚡ Motivation & Mindset
  {
    channelId: "UCJrnS31uWd_7bA8u0c27Z4Q",
    channelTitle: "Motiv2Study",
    channelHandle: "@Motiv2Study",
    category: "motivation",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_n_D4q4yZzUa5G_pB12mO9jK5k1=s176-c-k-c0x00ffffff-no-rj",
    description: "High-impact educational study motivation, morning discipline, and exam focus."
  },
  {
    channelId: "UCvXZzE7lF8XU1g1p74t87sw",
    channelTitle: "Be Inspired",
    channelHandle: "@BeInspiredChannel",
    category: "motivation",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_kM1oPz3lYqE5fQ6rN7tU8vW9x=s176-c-k-c0x00ffffff-no-rj",
    description: "Scientific mindset, resilience, and habits of top performers and scholars."
  },
  {
    channelId: "UCk1pmB6U5mXbQ0mGfJ8w8zg",
    channelTitle: "MulliganBrothers",
    channelHandle: "@MulliganBrothers",
    category: "motivation",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_l2nP3qR4sT5uV6wX7yZ8aB9cD=s176-c-k-c0x00ffffff-no-rj",
    description: "Stoicism, mental toughness, and focus speeches for deep work."
  },

  // 🧠 General Knowledge & Documentaries
  {
    channelId: "UCsXVk37bltHxD1rDPwtNM8Q",
    channelTitle: "Kurzgesagt – In a Nutshell",
    channelHandle: "@kurzgesagt",
    category: "knowledge",
    avatarUrl: "https://yt3.ggpht.com/ytc/AIdro_n1Ribd7LwdP_qKtqWL3ZDfIgv9M1d6g78VwpHGXVR2Ir4=s88-c-k-c0x00ffffff-no-rj",
    description: "Animated science, philosophy, history, and the universe explained in minutes."
  },
  {
    channelId: "UCHnyfMqiRRG1u-2MsSQLbXA",
    channelTitle: "Veritasium",
    channelHandle: "@veritasium",
    category: "knowledge",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_m8nP5qR7sT9uV2wX4yZ6aB8cD=s176-c-k-c0x00ffffff-no-rj",
    description: "An element of truth - breathtaking videos about physics, science, and curiosity."
  },
  {
    channelId: "UCW39zufHfSuG5y654VNPBLg",
    channelTitle: "DW Documentary",
    channelHandle: "@DWDocumentary",
    category: "knowledge",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_l5mN7oP9qR2sT4uV6wX8yZ1aB=s176-c-k-c0x00ffffff-no-rj",
    description: "In-depth international investigative documentaries covering society, science, and culture."
  },
  {
    channelId: "UC6107grRI4m0o2-emgoDnAA",
    channelTitle: "SmarterEveryDay",
    channelHandle: "@smartereveryday",
    category: "knowledge",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_k4mN6oP8qR1sT3uV5wX7yZ9aB=s176-c-k-c0x00ffffff-no-rj",
    description: "Exploring the world using science, engineering, and deep curiosity."
  },
  {
    channelId: "UCsooa4yRKGN_zEE8iknghZA",
    channelTitle: "TED-Ed",
    channelHandle: "@TEDEd",
    category: "knowledge",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_m3nP5qR7sT9uV1wX3yZ5aB7cD=s176-c-k-c0x00ffffff-no-rj",
    description: "Lessons worth sharing — captivating educational animations on every subject."
  },

  // 📰 Daily News & Current Affairs
  {
    channelId: "UCqhL_A2Yd0gM4c_UjQcQ9tQ",
    channelTitle: "StudyIQ IAS",
    channelHandle: "@StudyIQOfficial",
    category: "news",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_m2nP4qR6sT8uV0wX2yZ4aB6cD=s176-c-k-c0x00ffffff-no-rj",
    description: "Daily national and international current affairs, editorial breakdown, and exam analysis."
  },
  {
    channelId: "UCvmeL5Q_Uj8jA1zD3V_L3Yw",
    channelTitle: "World Affairs",
    channelHandle: "@WorldAffairsUnacademy",
    category: "news",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_n3oP5qR7sT9uV1wX3yZ5aB7cD=s176-c-k-c0x00ffffff-no-rj",
    description: "Global geopolitics, foreign policy, and international news simplified."
  },
  {
    channelId: "UCef1-8wXxV9Z0y8rD8o-r9g",
    channelTitle: "WION",
    channelHandle: "@WION",
    category: "news",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_l1nP3qR5sT7uV9wX1yZ3aB5cD=s176-c-k-c0x00ffffff-no-rj",
    description: "World Is One News — global news, diplomacy, and insightful world stories."
  },

  // 💻 Tech & AI / Computer Science
  {
    channelId: "UCsBjURrPoezykLs9EqgamOA",
    channelTitle: "Fireship",
    channelHandle: "@fireship",
    category: "tech",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_k6nP4qR8sT0uV2wX4yZ6aB8cD=s176-c-k-c0x00ffffff-no-rj",
    description: "High-intensity code tutorials, modern web development, and tech news simplified."
  },
  {
    channelId: "UC8butISFwT-Wl7EV0hUK0BQ",
    channelTitle: "freeCodeCamp.org",
    channelHandle: "@freecodecamp",
    category: "tech",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_l7nP5qR9sT1uV3wX5yZ7aB9cD=s176-c-k-c0x00ffffff-no-rj",
    description: "Full-length free computer science bootcamps, programming, and software engineering."
  },
  {
    channelId: "UCSHZKyawb77ixDdsGog4iWA",
    channelTitle: "Lex Fridman",
    channelHandle: "@lexfridman",
    category: "tech",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_m6nP4qR8sT0uV2wX4yZ6aB8cD=s176-c-k-c0x00ffffff-no-rj",
    description: "Conversations about AI, science, technology, robotics, and the future of humanity."
  },

  // 📚 Exam Prep & Academics
  {
    channelId: "UC4a-Gbdw7vOaccHmFo40b9g",
    channelTitle: "Khan Academy",
    channelHandle: "@khanacademy",
    category: "academics",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_n8nP6qR0sT2uV4wX6yZ8aB0cD=s176-c-k-c0x00ffffff-no-rj",
    description: "World-class academic education for anyone, anywhere (Math, Physics, Chemistry & Biology)."
  },
  {
    channelId: "UCYO_jab_esuFRV4b17AJtAw",
    channelTitle: "3Blue1Brown",
    channelHandle: "@3blue1brown",
    category: "academics",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_k1mN3oP5qR7sT9uV1wX3yZ5aB=s176-c-k-c0x00ffffff-no-rj",
    description: "Geometric and visual explanations of higher mathematics, linear algebra, and calculus."
  },

  // 💼 Finance, Case Studies & Productivity
  {
    channelId: "UCv2b_u2a_5b5w4c6d7e8f9g",
    channelTitle: "Think School",
    channelHandle: "@thinkschool",
    category: "finance",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_m9nP7qR1sT3uV5wX7yZ9aB1cD=s176-c-k-c0x00ffffff-no-rj",
    description: "Business case studies, geopolitics, and career wisdom broken down systematically."
  },
  {
    channelId: "UCoOae5nYA7VqaXzerajD0lg",
    channelTitle: "Ali Abdaal",
    channelHandle: "@aliabdaal",
    category: "finance",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_k8nP6qR0sT2uV4wX6yZ8aB0cD=s176-c-k-c0x00ffffff-no-rj",
    description: "Evidence-based productivity, study routines, personal finance, and lifestyle design."
  }
];
