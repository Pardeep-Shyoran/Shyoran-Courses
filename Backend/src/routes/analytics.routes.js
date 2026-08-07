import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getLearningAnalytics, getAIInsights } from "../controller/analytics.controller.js";

const router = Router();

// Secure all analytics routes with JWT authentication middleware
router.use(authenticate);

router.get("/", getLearningAnalytics);
router.get("/ai-insights", getAIInsights);

export default router;
