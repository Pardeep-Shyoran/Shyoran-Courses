import jwt from "jsonwebtoken";
import User, { roles as roleList } from "../models/user.model.js";
import config from "../config/config.js";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    xp: user.xp || 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: config.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const roleToSet = roleList.includes(role) ? role : "student";

    const user = await User.create({ name, email, password, role: roleToSet });
    const token = signToken(user);

    res.cookie("token", token, getCookieOptions());
    res.status(201).json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Failed to register user", error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.cookie("token", token, getCookieOptions());
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Failed to login" });
  }
}

export function logout(_req, res) {
  const { maxAge, ...clearOptions } = getCookieOptions();
  res.clearCookie("token", clearOptions);
  res.json({ message: "Logged out successfully" });
}

export async function updateProfile(req, res) {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      user.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password" });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }
      user.password = newPassword;
    }

    await user.save();
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Failed to get profile" });
  }
}
