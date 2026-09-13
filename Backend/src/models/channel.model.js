import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    channelId: { 
      type: String, 
      required: true, 
      trim: true 
    },
    channelTitle: { 
      type: String, 
      required: true, 
      trim: true 
    },
    channelHandle: { 
      type: String, 
      default: "", 
      trim: true 
    },
    customTitle: { 
      type: String, 
      default: "", 
      trim: true 
    },
    category: {
      type: String,
      enum: ["motivation", "knowledge", "news", "tech", "academics", "finance", "other"],
      default: "motivation"
    },
    description: { 
      type: String, 
      default: "" 
    },
    avatarUrl: { 
      type: String, 
      default: "" 
    },
    uploadsPlaylist: {
      type: String,
      default: ""
    },
    isPinned: { 
      type: Boolean, 
      default: false 
    },
    tags: [{ 
      type: String 
    }],
    cachedVideos: [
      {
        youtubeId: { type: String, required: true },
        title: { type: String, required: true },
        publishedAt: { type: Date },
        thumbnail: { type: String, default: "" },
        duration: { type: String, default: "" },
        viewCount: { type: String, default: "" },
        description: { type: String, default: "" },
        channelTitle: { type: String, default: "" },
        videoType: {
          type: String,
          enum: ["video", "short", "live"],
          default: "video"
        }
      }
    ],
    lastSyncedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Prevent duplicate subscriptions to the exact same channel for the same user
ChannelSchema.index({ user: 1, channelId: 1 }, { unique: true });

export default mongoose.model("Channel", ChannelSchema);
