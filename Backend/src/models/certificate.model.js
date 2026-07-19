import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    xpAwarded: {
      type: Number,
      default: 250,
    },
  },
  { timestamps: true }
);

// A user gets exactly one certificate per course
CertificateSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Certificate", CertificateSchema);
