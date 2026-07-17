import mongoose from "mongoose";

const StudyActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    type: { type: String, enum: ["video_completed", "notes_updated"], required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId },
    dateStr: { type: String, required: true }, // Format "YYYY-MM-DD"
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Optimize query for heatmap and streak extraction
StudyActivitySchema.index({ user: 1, dateStr: 1 });

// Ensure unique entry per specific event on a given calendar date to prevent duplicate counts
StudyActivitySchema.index({ user: 1, course: 1, type: 1, videoId: 1, dateStr: 1 }, { unique: true });

export default mongoose.model("StudyActivity", StudyActivitySchema);
