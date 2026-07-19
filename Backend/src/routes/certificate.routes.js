import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getCertificates, getCertificateById } from "../controller/certificate.controller.js";

const router = Router();

// Public route to view/verify a certificate
router.route("/:id").get(getCertificateById);

// Protected routes (require login)
router.use(authenticate);
router.route("/").get(getCertificates);

export default router;
