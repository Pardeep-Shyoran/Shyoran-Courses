import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const roles = ["student", "mentor", "admin"];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: roles, default: "student" },
    xp: { type: Number, default: 0 },
    bio: { type: String, default: "" },
    avatarColor: { type: String, default: "#6366f1" },
    dailyGoal: { type: Number, default: 30 },
    interests: [{ type: String }],
    preferences: {
      autoplay: { type: Boolean, default: true },
      playbackSpeed: { type: Number, default: 1 },
      emailReminders: { type: Boolean, default: true },
      streakAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export { roles };
export default mongoose.model("User", UserSchema);
