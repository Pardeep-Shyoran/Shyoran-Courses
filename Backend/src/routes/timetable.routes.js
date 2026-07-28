import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getTimetableSlots,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
  toggleTimetableSlotDate
} from "../controller/timetable.controller.js";

const router = Router();

router.use(authenticate);

router.route("/")
  .get(getTimetableSlots)
  .post(createTimetableSlot);

router.route("/:id")
  .put(updateTimetableSlot)
  .delete(deleteTimetableSlot);

router.route("/:id/toggle")
  .patch(toggleTimetableSlotDate);

export default router;
