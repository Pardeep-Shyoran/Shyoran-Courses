import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { handleGetSummary, handleChatWithTutor } from "../controller/ai.controller.js";

const router = Router();

// Secure all AI endpoints using JWT authenticate middleware
router.use(authenticate);

router.post("/video/:videoId/summary", handleGetSummary);
router.post("/video/:videoId/chat", handleChatWithTutor);

export default router;
