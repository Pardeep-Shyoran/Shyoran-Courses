import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getCourses,
  getCourseById,
  createCourse,
  importPlaylistPreview,
  updateCourse,
  deleteCourse,
  toggleVideoCompleted,
  updateVideoNotes,
  getPublicCourses,
  enrollCourse
} from "../controller/course.controller.js";

const router = Router();

// Public route accessible by guest users
router.route("/public").get(getPublicCourses);

// Apply authentication middleware to remaining course routes
router.use(authenticate);

router.route("/")
  .get(getCourses)
  .post(createCourse);

router.route("/import-playlist")
  .post(importPlaylistPreview);

router.route("/:id")
  .get(getCourseById)
  .put(updateCourse)
  .delete(deleteCourse);

router.route("/:id/enroll")
  .post(enrollCourse);

router.route("/:id/videos/:videoId/toggle")
  .patch(toggleVideoCompleted);

router.route("/:id/videos/:videoId/notes")
  .patch(updateVideoNotes);

export default router;
