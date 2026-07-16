import mongoose from "mongoose";

const VideoProgressSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, required: true },
  youtubeId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  watchedAt: { type: Date },
  notes: { type: String, default: "" }
});

const EnrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  notes: { type: String, default: "" }, // Course-wide student notes
  videoProgress: [VideoProgressSchema]
}, { timestamps: true });

// A user can only enroll once in a given course
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", EnrollmentSchema);
