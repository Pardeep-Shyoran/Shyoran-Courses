import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import Enrollment from "../models/enrollment.model.js";
import StudyActivity from "../models/studyActivity.model.js";
import Certificate from "../models/certificate.model.js";

// Helpers for Indian Standard Time (IST - Asia/Kolkata) date string formatting
function getISTDateStr(date = new Date()) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

function getPrevISTDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const prev = new Date(Date.UTC(y, m - 1, d - 1));
  return prev.toISOString().split('T')[0];
}
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
    const { title, description, tags, notes, videos } = req.body;
    // Settings changes are restricted to the creator/owner of the course
    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });

    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized to update course settings" });
    }

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (tags !== undefined) course.tags = tags;
    if (notes !== undefined) course.notes = notes;
    if (videos !== undefined) course.videos = videos;

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
      let isCompletedNow = false;
      if (vp) {
        vp.completed = !vp.completed;
        vp.watchedAt = vp.completed ? new Date() : null;
        isCompletedNow = vp.completed;
      } else {
        enrollment.videoProgress.push({
          videoId: video._id,
          youtubeId: video.youtubeId,
          completed: true,
          watchedAt: new Date(),
          notes: ""
        });
        isCompletedNow = true;
      }

      await enrollment.save();

      // Log study activity
      const dateStr = getISTDateStr();
      if (isCompletedNow) {
        await StudyActivity.findOneAndUpdate(
          { user: userId, course: courseId, type: "video_completed", videoId, dateStr },
          { timestamp: new Date() },
          { upsert: true, new: true }
        );
      } else {
        await StudyActivity.deleteOne({ user: userId, course: courseId, type: "video_completed", videoId });
      }

      // Award/deduct XP (+10 / -10)
      const xpChange = isCompletedNow ? 10 : -10;
      await User.findByIdAndUpdate(userId, { $inc: { xp: xpChange } });
      await User.findOneAndUpdate({ _id: userId, xp: { $lt: 0 } }, { xp: 0 });

      // Check if course is 100% completed
      const totalVideos = (course.videos || []).length;
      const completedVideos = (enrollment.videoProgress || []).filter(vp => vp.completed).length;
      const isCourseFullyCompleted = totalVideos > 0 && completedVideos === totalVideos;

      let earnedCertificate = null;
      if (isCourseFullyCompleted) {
        const existingCert = await Certificate.findOne({ user: userId, course: courseId });
        if (!existingCert) {
          const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
          const timeStr = Date.now().toString().slice(-4);
          const certificateId = `CERT-${randStr}-${timeStr}`;

          earnedCertificate = await Certificate.create({
            user: userId,
            course: courseId,
            certificateId,
            completedAt: new Date(),
            xpAwarded: 250
          });

          await User.findByIdAndUpdate(userId, { $inc: { xp: 250 } });
        }
      }

      const mergedCourse = mergeEnrollmentProgress(course, enrollment.toObject(), userId, req.user);
      
      const responseData = {
        ...mergedCourse,
        earnedCertificate: earnedCertificate ? earnedCertificate.toObject() : null
      };

      return res.json(responseData);
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
    const isCompletedNow = video.completed;

    await course.save();

    // Log study activity
    const dateStr = getISTDateStr();
    if (isCompletedNow) {
      await StudyActivity.findOneAndUpdate(
        { user: userId, course: courseId, type: "video_completed", videoId, dateStr },
        { timestamp: new Date() },
        { upsert: true, new: true }
      );
    } else {
      await StudyActivity.deleteOne({ user: userId, course: courseId, type: "video_completed", videoId });
    }

    // Award/deduct XP (+10 / -10)
    const xpChange = isCompletedNow ? 10 : -10;
    await User.findByIdAndUpdate(userId, { $inc: { xp: xpChange } });
    await User.findOneAndUpdate({ _id: userId, xp: { $lt: 0 } }, { xp: 0 });

    // Check if course is 100% completed
    const totalVideos = (course.videos || []).length;
    const completedVideos = (course.videos || []).filter(v => v.completed).length;
    const isCourseFullyCompleted = totalVideos > 0 && completedVideos === totalVideos;

    let earnedCertificate = null;
    if (isCourseFullyCompleted) {
      const existingCert = await Certificate.findOne({ user: userId, course: courseId });
      if (!existingCert) {
        const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const timeStr = Date.now().toString().slice(-4);
        const certificateId = `CERT-${randStr}-${timeStr}`;

        earnedCertificate = await Certificate.create({
          user: userId,
          course: courseId,
          certificateId,
          completedAt: new Date(),
          xpAwarded: 250
        });

        await User.findByIdAndUpdate(userId, { $inc: { xp: 250 } });
      }
    }

    const populatedCourse = await Course.findById(courseId).populate("user", "name email role");
    
    const responseData = {
      ...populatedCourse.toObject(),
      earnedCertificate: earnedCertificate ? earnedCertificate.toObject() : null
    };

    res.json(responseData);
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

      // Log study activity
      if (notes && notes.trim().length > 0) {
        const dateStr = getISTDateStr();
        await StudyActivity.findOneAndUpdate(
          { user: userId, course: courseId, type: "notes_updated", videoId, dateStr },
          { timestamp: new Date() },
          { upsert: true, new: true }
        );
      }

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

    // Log study activity
    if (notes && notes.trim().length > 0) {
      const dateStr = getISTDateStr();
      await StudyActivity.findOneAndUpdate(
        { user: userId, course: courseId, type: "notes_updated", videoId, dateStr },
        { timestamp: new Date() },
        { upsert: true, new: true }
      );
    }

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

// Refresh/sync the course's playlist videos from YouTube
export async function refreshCoursePlaylist(req, res) {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.playlistId) {
      return res.status(400).json({ message: "This course is not linked to a YouTube playlist" });
    }

    const isOwner = course.user.toString() === userId.toString();
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });

    if (!isOwner && !enrollment) {
      return res.status(403).json({ message: "Unauthorized to refresh this course" });
    }

    // Scrape the latest playlist details from YouTube
    const scrapedData = await scrapePlaylist(course.playlistId);
    const scrapedVideos = scrapedData.videos || [];

    // Map existing videos by youtubeId to preserve IDs and progress
    const existingVideosMap = new Map();
    for (const v of course.videos) {
      existingVideosMap.set(v.youtubeId, v);
    }

    const updatedVideos = [];
    for (const sv of scrapedVideos) {
      const existing = existingVideosMap.get(sv.youtubeId);
      if (existing) {
        // Update details but keep subdocument object & progress
        existing.title = sv.title;
        existing.duration = sv.duration;
        updatedVideos.push(existing);
      } else {
        // New video found in the playlist
        updatedVideos.push({
          title: sv.title,
          youtubeId: sv.youtubeId,
          duration: sv.duration,
          completed: false,
          notes: ""
        });
      }
    }

    // Update course level details if scraped and sync videos array
    if (scrapedData.title) course.title = scrapedData.title;
    if (scrapedData.description) course.description = scrapedData.description;
    if (scrapedData.thumbnail) course.thumbnail = scrapedData.thumbnail;
    course.videos = updatedVideos;

    await course.save();

    // Fetch the updated populated/merged course model to return to frontend
    const freshCourse = await Course.findById(courseId).populate("user", "name email role").lean();

    if (enrollment) {
      const mergedCourse = mergeEnrollmentProgress(freshCourse, enrollment.toObject(), userId, req.user);
      return res.json(mergedCourse);
    }

    res.json(freshCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to refresh playlist", error: error.message });
  }
}


// Fetch consistency study stats (streak, heatmap)
export async function getStudyTrackerStats(req, res) {
  try {
    const userId = req.user._id;
    const clientTodayStr = req.query.today || getISTDateStr();

    // 1. Dynamic backfill if user has 0 activities but has completed videos
    const count = await StudyActivity.countDocuments({ user: userId });
    if (count === 0) {
      const enrollments = await Enrollment.find({ user: userId });
      const activitiesToCreate = [];

      for (const enrollment of enrollments) {
        for (const vp of enrollment.videoProgress || []) {
          if (vp.completed && vp.watchedAt) {
            const dateStr = getISTDateStr(vp.watchedAt);
            activitiesToCreate.push({
              user: userId,
              course: enrollment.course,
              type: "video_completed",
              videoId: vp.videoId,
              dateStr,
              timestamp: vp.watchedAt
            });
          }
        }
      }

      const ownedCourses = await Course.find({ user: userId });
      for (const course of ownedCourses) {
        for (const video of course.videos || []) {
          if (video.completed && video.watchedAt) {
            const dateStr = getISTDateStr(video.watchedAt);
            activitiesToCreate.push({
              user: userId,
              course: course._id,
              type: "video_completed",
              videoId: video._id,
              dateStr,
              timestamp: video.watchedAt
            });
          }
        }
      }

      if (activitiesToCreate.length > 0) {
        try {
          await StudyActivity.insertMany(activitiesToCreate, { ordered: false });
        } catch (err) {
          // Ignore duplicates
        }
      }
    }

    // 2. Fetch all activities for user
    const activities = await StudyActivity.find({ user: userId }).sort({ timestamp: 1 }).lean();

    // 3. Compute counts by date
    const dateCounts = {};
    const activeDatesSet = new Set();
    activities.forEach(act => {
      const dStr = act.dateStr;
      dateCounts[dStr] = (dateCounts[dStr] || 0) + 1;
      activeDatesSet.add(dStr);
    });

    // 4. Compute streak details (longest and current)
    const sortedDates = Array.from(activeDatesSet).sort(); // Ascending

    let longestStreak = 0;
    let currentRun = 0;
    let prevDate = null;

    for (const dateStr of sortedDates) {
      const curDate = new Date(dateStr);
      if (!prevDate) {
        currentRun = 1;
      } else {
        const diffTime = curDate - prevDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentRun++;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, currentRun);
          currentRun = 1;
        }
      }
      prevDate = curDate;
    }
    longestStreak = Math.max(longestStreak, currentRun);

    // Current streak relative to clientTodayStr (IST midnight boundaries)
    const clientYesterdayStr = getPrevISTDateStr(clientTodayStr);

    let currentStreak = 0;
    if (activeDatesSet.has(clientTodayStr) || activeDatesSet.has(clientYesterdayStr)) {
      let checkStr = activeDatesSet.has(clientTodayStr) ? clientTodayStr : clientYesterdayStr;
      while (activeDatesSet.has(checkStr)) {
        currentStreak++;
        checkStr = getPrevISTDateStr(checkStr);
      }
    }

    res.json({
      heatmap: dateCounts,
      currentStreak,
      longestStreak,
      totalActivities: activities.length
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load study tracker stats", error: error.message });
  }
}

