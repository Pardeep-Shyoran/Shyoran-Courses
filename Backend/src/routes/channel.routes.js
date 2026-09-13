import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getUserChannels,
  addChannel,
  deleteChannel,
  updateChannel,
  getAggregatedFeed,
  getPresets,
  saveVideoAsCourse
} from "../controller/channel.controller.js";

const router = Router();

// Require authentication for all channel endpoints
router.use(authenticate);

router.route("/")
  .get(getUserChannels)
  .post(addChannel);

router.route("/feed")
  .get(getAggregatedFeed);

router.route("/presets")
  .get(getPresets);

router.route("/save-to-course")
  .post(saveVideoAsCourse);

router.route("/:id")
  .put(updateChannel)
  .delete(deleteChannel);

export default router;
