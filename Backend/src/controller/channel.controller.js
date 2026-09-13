import Channel from "../models/channel.model.js";
import Course from "../models/course.model.js";
import { resolveChannel, fetchLatestChannelVideos, detectVideoFormat, CURATED_STUDENT_PRESETS } from "../utils/channelScraper.js";

// Cache duration before refreshing channel video feed: 20 minutes
const CACHE_TTL_MS = 20 * 60 * 1000;

export const VALID_CATEGORIES = [
  "motivation",
  "knowledge",
  "news",
  "tech",
  "academics",
  "finance",
  "other"
];

// 1. Get all subscribed channels for authenticated user
export async function getUserChannels(req, res) {
  try {
    const userId = req.user._id;
    const { category } = req.query;

    const query = { user: userId };
    if (category && VALID_CATEGORIES.includes(category)) {
      query.category = category;
    }

    const channels = await Channel.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      channels,
      total: channels.length
    });
  } catch (error) {
    console.error("getUserChannels error:", error);
    res.status(500).json({ message: error.message || "Failed to load channels" });
  }
}

// 2. Add a new YouTube channel subscription
export async function addChannel(req, res) {
  try {
    const userId = req.user._id;
    const { input, category = "motivation", customTitle = "" } = req.body;

    if (!input || !input.trim()) {
      return res.status(400).json({ message: "Please provide a YouTube channel link, handle (@name), or channel ID." });
    }

    // Resolve channel details
    const resolved = await resolveChannel(input.trim());
    const { channelId, channelTitle, channelHandle, description, avatarUrl, uploadsPlaylist } = resolved;

    // Check if user has already subscribed
    const existing = await Channel.findOne({ user: userId, channelId });
    if (existing) {
      return res.status(400).json({ message: `You are already subscribed to "${existing.channelTitle}".` });
    }

    // Fetch initial latest videos for fast instant display
    const latestVideos = await fetchLatestChannelVideos(channelId, uploadsPlaylist, 25);

    const channel = await Channel.create({
      user: userId,
      channelId,
      channelTitle,
      channelHandle,
      customTitle: customTitle.trim(),
      category: VALID_CATEGORIES.includes(category) ? category : "motivation",
      description,
      avatarUrl,
      uploadsPlaylist,
      cachedVideos: latestVideos,
      lastSyncedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${channelTitle}`,
      channel
    });
  } catch (error) {
    console.error("addChannel error:", error);
    res.status(400).json({ message: error.message || "Failed to add YouTube channel" });
  }
}

// 3. Delete a channel subscription
export async function deleteChannel(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const channel = await Channel.findOneAndDelete({ _id: id, user: userId });
    if (!channel) {
      return res.status(404).json({ message: "Channel subscription not found." });
    }

    res.json({
      success: true,
      message: `Unsubscribed from ${channel.channelTitle}`,
      id
    });
  } catch (error) {
    console.error("deleteChannel error:", error);
    res.status(500).json({ message: error.message || "Failed to delete channel" });
  }
}

// 4. Update channel (category, pin status, or custom alias)
export async function updateChannel(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { category, isPinned, customTitle } = req.body;

    const updates = {};
    if (category && VALID_CATEGORIES.includes(category)) {
      updates.category = category;
    }
    if (typeof isPinned === "boolean") {
      updates.isPinned = isPinned;
    }
    if (typeof customTitle === "string") {
      updates.customTitle = customTitle.trim();
    }

    const channel = await Channel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updates },
      { new: true }
    );

    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }

    res.json({
      success: true,
      message: "Channel updated successfully",
      channel
    });
  } catch (error) {
    console.error("updateChannel error:", error);
    res.status(500).json({ message: error.message || "Failed to update channel" });
  }
}

// 5. Get aggregated chronological distraction-free feed across all user channels
export async function getAggregatedFeed(req, res) {
  try {
    const userId = req.user._id;
    const { category, channelId, videoType, limit = 50 } = req.query;

    const query = { user: userId };
    if (channelId) {
      query.channelId = channelId;
    } else if (category && VALID_CATEGORIES.includes(category)) {
      query.category = category;
    }

    const channels = await Channel.find(query);
    if (channels.length === 0) {
      return res.json({
        success: true,
        videos: [],
        totalChannels: 0,
        message: "No channels found for this category."
      });
    }

    const now = Date.now();
    const refreshPromises = [];

    // Background or on-demand cache refresh for stale channels (> 20 mins)
    for (const ch of channels) {
      const isStale = !ch.lastSyncedAt || (now - new Date(ch.lastSyncedAt).getTime() > CACHE_TTL_MS);
      const hasNoVideos = !ch.cachedVideos || ch.cachedVideos.length === 0;

      if (isStale || hasNoVideos) {
        refreshPromises.push(
          fetchLatestChannelVideos(ch.channelId, ch.uploadsPlaylist || `UU${ch.channelId.slice(2)}`, 25)
            .then(async videos => {
              if (videos.length > 0) {
                ch.cachedVideos = videos;
                ch.lastSyncedAt = new Date();
                await Channel.updateOne(
                  { _id: ch._id },
                  { $set: { cachedVideos: videos, lastSyncedAt: new Date() } }
                );
              }
            })
            .catch(err => console.warn(`Feed sync warning for ${ch.channelTitle}:`, err.message))
        );
      }
    }

    // Wait for stale channels if any were completely empty
    if (refreshPromises.length > 0) {
      await Promise.allSettled(refreshPromises);
    }

    // Aggregate and deduplicate videos
    const allVideosMap = new Map();

    for (const ch of channels) {
      const channelLabel = ch.customTitle || ch.channelTitle;
      const channelAvatar = ch.avatarUrl;
      const channelCategory = ch.category;

      for (const vid of ch.cachedVideos || []) {
        if (!allVideosMap.has(vid.youtubeId)) {
          // Accurately verify video format (short, live, video)
          let type = vid.videoType;
          if (!type || type === "video") {
            const detected = detectVideoFormat({
              duration: vid.duration,
              title: vid.title,
              description: vid.description
            });
            if (detected !== "video") {
              type = detected;
            }
          }

          allVideosMap.set(vid.youtubeId, {
            youtubeId: vid.youtubeId,
            title: vid.title,
            publishedAt: vid.publishedAt,
            thumbnail: vid.thumbnail,
            duration: vid.duration,
            viewCount: vid.viewCount,
            description: vid.description,
            channelId: ch.channelId,
            channelDbId: ch._id,
            channelTitle: channelLabel,
            channelAvatar,
            category: channelCategory,
            isPinned: ch.isPinned,
            videoType: type || "video"
          });
        }
      }
    }

    // Filter by videoType if requested ('video', 'short', 'live')
    let aggregated = Array.from(allVideosMap.values());
    if (videoType && ["video", "short", "live"].includes(videoType)) {
      aggregated = aggregated.filter(v => v.videoType === videoType);
    }

    // Sort chronologically: newest published videos first
    aggregated.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });

    res.json({
      success: true,
      videos: aggregated.slice(0, parseInt(limit, 10) || 50),
      totalChannels: channels.length
    });
  } catch (error) {
    console.error("getAggregatedFeed error:", error);
    res.status(500).json({ message: error.message || "Failed to load video feed" });
  }
}

// 6. Get curated starter presets with subscription status
export async function getPresets(req, res) {
  try {
    const userId = req.user._id;

    // Get user's existing channel IDs to flag which ones are already subscribed
    const userChannels = await Channel.find({ user: userId }).select("channelId").lean();
    const subscribedSet = new Set(userChannels.map(c => c.channelId));

    const presetsWithStatus = CURATED_STUDENT_PRESETS.map(preset => ({
      ...preset,
      isSubscribed: subscribedSet.has(preset.channelId)
    }));

    res.json({
      success: true,
      presets: presetsWithStatus
    });
  } catch (error) {
    console.error("getPresets error:", error);
    res.status(500).json({ message: error.message || "Failed to load channel presets" });
  }
}

// 7. Save a feed video directly to user's courses (or create a custom course for it)
export async function saveVideoAsCourse(req, res) {
  try {
    const userId = req.user._id;
    const { youtubeId, title, channelTitle, description = "", notes = "", courseTitle = "" } = req.body;

    if (!youtubeId || !title) {
      return res.status(400).json({ message: "Missing youtubeId or title." });
    }

    // Target course title
    const finalCourseTitle = courseTitle.trim() || `Study: ${title.slice(0, 60)}`;
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

    // Create a new study track in user's library
    const newCourse = await Course.create({
      user: userId,
      title: finalCourseTitle,
      description: description || `Distraction-free study track from ${channelTitle || "YouTube"}`,
      thumbnail,
      channelTitle: channelTitle || "Student Channel Feed",
      tags: ["Saved from Feeds", "Distraction-Free"],
      notes: notes || "",
      videos: [
        {
          title,
          youtubeId,
          duration: "",
          completed: false,
          notes: notes || "",
          channelTitle: channelTitle || ""
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: `Saved "${title}" to your Courses Library!`,
      course: newCourse
    });
  } catch (error) {
    console.error("saveVideoAsCourse error:", error);
    res.status(500).json({ message: error.message || "Failed to save video to courses" });
  }
}
