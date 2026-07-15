import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import { extractPlaylistId, scrapePlaylist } from "../utils/youtubeScraper.js";

// Fetch all courses for the authenticated user
export async function getCourses(req, res) {
  try {
    // Find all users who are admin or mentor
    const publicUsers = await User.find({ role: { $in: ["admin", "mentor"] } }).select("_id");
    const publicUserIds = publicUsers.map(u => u._id);

    // Find courses created by the user themselves OR any admin/mentor
    const courses = await Course.find({
      $or: [
        { user: req.user._id },
        { user: { $in: publicUserIds } }
      ]
    }).populate("user", "name email role").sort({ updatedAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve courses", error: error.message });
  }
}

// Fetch a single course by ID
export async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id).populate("user", "name email role");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the current user owns it, or if it is a public course created by admin/mentor
    const isOwner = course.user && course.user._id.toString() === req.user._id.toString();
    const isPublic = course.user && ["admin", "mentor"].includes(course.user.role);

    if (!isOwner && !isPublic) {
      return res.status(403).json({ message: "Unauthorized access to this course" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve course details", error: error.message });
  }
}

// Create a new course (manual entry or saving a previewed import)
export async function createCourse(req, res) {
  try {
    const { title, description, playlistId, thumbnail, videos, tags, notes } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Course title is required" });
    }

    const courseData = {
      user: req.user._id,
      title,
      description: description || "",
      playlistId: playlistId || "",
      thumbnail: thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60`, // beautiful default thumbnail if none
      videos: videos || [],
      tags: tags || [],
      notes: notes || ""
    };

    const newCourse = new Course(courseData);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to create course", error: error.message });
  }
}

// Scrape YouTube playlist metadata and video lists for previewing before save
export async function importPlaylistPreview(req, res) {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "YouTube Playlist URL or ID is required" });
    }

    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      return res.status(400).json({ message: "Invalid YouTube Playlist URL or ID" });
    }

    const scrapedData = await scrapePlaylist(playlistId);
    res.json(scrapedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update general course details (title, description, tags, notes)
export async function updateCourse(req, res) {
  try {
    const { title, description, tags, notes } = req.body;
    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (tags !== undefined) course.tags = tags;
    if (notes !== undefined) course.notes = notes;

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course", error: error.message });
  }
}

// Delete a course
export async function deleteCourse(req, res) {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course successfully deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
}

// Toggle completion status of a video in a course
export async function toggleVideoCompleted(req, res) {
  try {
    const { id, videoId } = req.params;
    const course = await Course.findOne({ _id: id, user: req.user._id });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found in this course" });
    }

    video.completed = !video.completed;
    video.watchedAt = video.completed ? new Date() : null;

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle video status", error: error.message });
  }
}

// Update notes for a specific video in a course
export async function updateVideoNotes(req, res) {
  try {
    const { id, videoId } = req.params;
    const { notes } = req.body;
    
    const course = await Course.findOne({ _id: id, user: req.user._id });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found in this course" });
    }

    video.notes = notes || "";
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to update video notes", error: error.message });
  }
}

// Fetch public courses (accessible by guest users)
export async function getPublicCourses(req, res) {
  try {
    const publicUsers = await User.find({ role: { $in: ["admin", "mentor"] } }).select("_id");
    const publicUserIds = publicUsers.map(u => u._id);

    const courses = await Course.find({ user: { $in: publicUserIds } })
      .populate("user", "name email role")
      .sort({ updatedAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve public courses", error: error.message });
  }
}

// Enroll a student in a public course (clones the course structure)
export async function enrollCourse(req, res) {
  try {
    const courseId = req.params.id;
    const originalCourse = await Course.findById(courseId).populate("user");
    
    if (!originalCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify creator is an admin or mentor
    if (!originalCourse.user) {
      return res.status(400).json({ message: "Course creator not found or inactive" });
    }

    if (!["admin", "mentor"].includes(originalCourse.user.role)) {
      return res.status(403).json({ message: "Only courses created by mentors or admins can be enrolled" });
    }

    // Check if the user is already enrolled (already cloned)
    const query = {
      user: req.user._id,
    };

    if (originalCourse.playlistId) {
      query.playlistId = originalCourse.playlistId;
    } else {
      query.title = originalCourse.title;
      query.playlistId = "";
    }

    const existingEnrollment = await Course.findOne(query);

    if (existingEnrollment) {
      return res.status(200).json({
        message: "Already enrolled",
        course: existingEnrollment,
        alreadyEnrolled: true
      });
    }

    // Clone the course metadata and videos list (clearing video completion & user-specific notes)
    const clonedCourseData = {
      user: req.user._id,
      title: originalCourse.title,
      description: originalCourse.description,
      playlistId: originalCourse.playlistId,
      thumbnail: originalCourse.thumbnail,
      tags: originalCourse.tags,
      notes: originalCourse.notes,
      videos: originalCourse.videos.map(v => ({
        title: v.title,
        youtubeId: v.youtubeId,
        duration: v.duration,
        completed: false,
        notes: ""
      }))
    };

    const newCourse = new Course(clonedCourseData);
    await newCourse.save();

    res.status(201).json({
      message: "Successfully enrolled in course",
      course: newCourse
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to enroll in course", error: error.message });
  }
}
