import mongoose from "mongoose";

const TimetableSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    startTime: { type: String, required: true }, // Format "HH:mm" (24-hr format e.g., "08:30")
    endTime: { type: String, required: true },   // Format "HH:mm" (24-hr format e.g., "10:00")
    daysOfWeek: [
      {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
      }
    ],
    category: {
      type: String,
      enum: ["Study", "Revision", "Practice", "Break", "Exercise", "Other"],
      default: "Study"
    },
    colorTag: { type: String, default: "#6366f1" },
    notes: { type: String, trim: true, default: "" },
    completedDates: [{ type: String }] // Array of date strings "YYYY-MM-DD" when completed
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", TimetableSchema);
