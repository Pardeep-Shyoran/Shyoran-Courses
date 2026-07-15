import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeId: { type: String, required: true },
  duration: { type: String, default: "" },
  completed: { type: Boolean, default: false },
  watchedAt: { type: Date },
  notes: { type: String, default: "" } // Video-specific markdown notes
});

const CourseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  playlistId: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
  videos: [VideoSchema],
  tags: [{ type: String }],
  notes: { type: String, default: "" } // Course-wide notes
}, { timestamps: true });

export default mongoose.model("Course", CourseSchema);
