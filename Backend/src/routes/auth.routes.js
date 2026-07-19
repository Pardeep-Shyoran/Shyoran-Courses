import express from "express";
import { register, login, updateProfile, getProfile } from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
