import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const App = express();


App.set("trust proxy", 1);

App.use(cors({
  origin: true,
  credentials: true
}));

App.use(cookieParser());
App.use(express.json());

App.use("/api/auth", authRoutes);
App.use("/api/courses", courseRoutes);
App.use("/api/ai", aiRoutes);
App.use("/api/todos", todoRoutes);
App.use("/api/certificates", certificateRoutes);
App.use("/api/timetable", timetableRoutes);
App.use("/api/analytics", analyticsRoutes);


// Basic health endpoint for uptime/keep-alive pings
App.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend-service', timestamp: new Date().toISOString() });
});

export default App;
