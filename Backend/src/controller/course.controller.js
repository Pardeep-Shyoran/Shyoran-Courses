import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import Enrollment from "../models/enrollment.model.js";
import { extractPlaylistId, scrapePlaylist } from "../utils/youtubeScraper.js";

// Helper function to merge enrollment progress and notes into a course object
function mergeEnrollmentProgress(course, enrollment, userId, user) {
  const videos = (course.videos || []).map(video => {
    const progress = (enrollment.videoProgress || []).find(vp => 
      (vp.videoId && vp.videoId.toString() === video._id.toString()) ||
      vp.youtubeId === video.youtubeId
    );
    return {
      ...video,
      completed: progress ? progress.completed : false,
      watchedAt: progress ? progress.watchedAt : null,
      notes: progress ? progress.notes : ""
    };
  });

  const virtualUser = {
    _id: userId,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return {
    ...course,
    user: virtualUser, // Trick the frontend to treat the student as owner/creator for UI controls
    notes: enrollment.notes || "", // User's course-wide study notes
    videos,
    isEnrolled: true,
    originalCreator: course.user
  };
}

// Fetch all courses for the authenticated user
export async function getCourses(req, res) {
  try {
    const userId = req.user._id;

    // 1. Find all users who are admin or mentor
    const publicUsers = await User.find({ role: { $in: ["admin", "mentor"] } }).select("_id");
    const publicUserIds = publicUsers.map(u => u._id);

    // 2. Find public courses
    const publicCourses = await Course.find({ user: { $in: publicUserIds } })
      .populate("user", "name email role")
      .lean();

    // 3. Find custom/imported courses created by the user themselves
    const userOwnedCourses = await Course.find({ user: userId })
      .populate("user", "name email role")
      .lean();

    // 4. Find all enrollments of the user
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: "course",
        populate: {
          path: "user",
          select: "name email role"
        }
      })
      .lean();

    // 5. Construct virtual courses from enrollments
    const enrolledCourses = enrollments.map(enrollment => {
      if (!enrollment.course) return null;
      return mergeEnrollmentProgress(enrollment.course, enrollment, userId, req.user);
    }).filter(Boolean);

    // Deduplicate and combine courses
    const result = [];
    const seenExplore = new Set();
    const seenLibrary = new Set();

    // Add public courses for Explore Catalog
    for (const c of publicCourses) {
      const creatorId = c.user?._id?.toString() || c.user?.toString();
      if (creatorId !== userId.toString()) {
        result.push(c);
        seenExplore.add(c._id.toString());
      }
    }

    // Add user owned courses (custom courses) for My Library
    for (const c of userOwnedCourses) {
      result.push(c);
      seenLibrary.add(c._id.toString());
    }

    // Add enrolled courses for My Library
    for (const c of enrolledCourses) {
      if (!seenLibrary.has(c._id.toString())) {
        result.push(c);
        seenLibrary.add(c._id.toString());
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve courses", error: error.message });
  }
}

// Fetch a single course by ID
export async function getCourseById(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).populate("user", "name email role").lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const userId = req.user._id;

    // Check if the user is enrolled in this course
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId }).lean();

    if (enrollment) {
      const mergedCourse = mergeEnrollmentProgress(course, enrollment, userId, req.user);
      return res.json(mergedCourse);
    }

    // Check if the current user owns it, or if it is a public course created by admin/mentor
    const isOwner = course.user && course.user._id.toString() === userId.toString();
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
      thumbnail: thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60`,
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
    // Settings changes are restricted to the creator/owner of the course
    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });

    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized to update course settings" });
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
    const courseId = req.params.id;
    const userId = req.user._id;

    // Check if the user is enrolled in this course, delete enrollment if so
    const enrollment = await Enrollment.findOneAndDelete({ user: userId, course: courseId });
    if (enrollment) {
      return res.json({ message: "Enrollment successfully removed", id: courseId });
    }

    // Otherwise, check if user is creator and delete original course
    const course = await Course.findOneAndDelete({ _id: courseId, user: userId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized to delete" });
    }
    res.json({ message: "Course successfully deleted", id: courseId });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
}

// Toggle completion status of a video in a course
export async function toggleVideoCompleted(req, res) {
  try {
    const { id: courseId, videoId } = req.params;
    const userId = req.user._id;

    // 1. Check if user is enrolled
    let enrollment = await Enrollment.findOne({ user: userId, course: courseId });

    if (enrollment) {
      const course = await Course.findById(courseId).populate("user", "name email role").lean();
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const video = (course.videos || []).find(v => v._id.toString() === videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found in this course" });
      }

      let vp = (enrollment.videoProgress || []).find(p => p.videoId.toString() === videoId);
      if (vp) {
        vp.completed = !vp.completed;
        vp.watchedAt = vp.completed ? new Date() : null;
      } else {
        enrollment.videoProgress.push({
          videoId: video._id,
          youtubeId: video.youtubeId,
          completed: true,
          watchedAt: new Date(),
          notes: ""
        });
      }

      await enrollment.save();

      const mergedCourse = mergeEnrollmentProgress(course, enrollment.toObject(), userId, req.user);
      return res.json(mergedCourse);
    }

    // 2. If not enrolled, check if owner
    const course = await Course.findOne({ _id: courseId, user: userId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized" });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found in this course" });
    }

    video.completed = !video.completed;
    video.watchedAt = video.completed ? new Date() : null;

    await course.save();

    const populatedCourse = await Course.findById(courseId).populate("user", "name email role");
    res.json(populatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle video status", error: error.message });
  }
}

// Update notes for a specific video in a course
export async function updateVideoNotes(req, res) {
  try {
    const { id: courseId, videoId } = req.params;
    const { notes } = req.body;
    const userId = req.user._id;

    // 1. Check if user is enrolled
    let enrollment = await Enrollment.findOne({ user: userId, course: courseId });

    if (enrollment) {
      const course = await Course.findById(courseId).populate("user", "name email role").lean();
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const video = (course.videos || []).find(v => v._id.toString() === videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found in this course" });
      }

      let vp = (enrollment.videoProgress || []).find(p => p.videoId.toString() === videoId);
      if (vp) {
        vp.notes = notes || "";
      } else {
        enrollment.videoProgress.push({
          videoId: video._id,
          youtubeId: video.youtubeId,
          completed: false,
          watchedAt: null,
          notes: notes || ""
        });
      }

      await enrollment.save();

      const mergedCourse = mergeEnrollmentProgress(course, enrollment.toObject(), userId, req.user);
      return res.json(mergedCourse);
    }

    // 2. If not enrolled, check if owner
    const course = await Course.findOne({ _id: courseId, user: userId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized" });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found in this course" });
    }

    video.notes = notes || "";
    await course.save();

    const populatedCourse = await Course.findById(courseId).populate("user", "name email role");
    res.json(populatedCourse);
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

// Enroll a student in a public course
export async function enrollCourse(req, res) {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    const originalCourse = await Course.findById(courseId).populate("user").lean();
    if (!originalCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify creator is admin or mentor
    if (!originalCourse.user) {
      return res.status(400).json({ message: "Course creator not found or inactive" });
    }

    if (!["admin", "mentor"].includes(originalCourse.user.role)) {
      return res.status(403).json({ message: "Only courses created by mentors or admins can be enrolled" });
    }

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({ user: userId, course: courseId });

    if (enrollment) {
      const enrolledCourse = mergeEnrollmentProgress(originalCourse, enrollment.toObject(), userId, req.user);
      return res.status(200).json({
        message: "Already enrolled",
        course: enrolledCourse,
        alreadyEnrolled: true
      });
    }

    // Create new enrollment
    enrollment = new Enrollment({
      user: userId,
      course: courseId,
      videoProgress: []
    });
    await enrollment.save();

    const enrolledCourse = mergeEnrollmentProgress(originalCourse, enrollment.toObject(), userId, req.user);

    res.status(201).json({
      message: "Successfully enrolled in course",
      course: enrolledCourse
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to enroll in course", error: error.message });
  }
}
