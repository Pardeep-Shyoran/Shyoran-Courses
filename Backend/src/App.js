import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import todoRoutes from "./routes/todo.routes.js";

const App = express();


App.use(cors());

App.use(cookieParser());
App.use(express.json());

App.use("/api/auth", authRoutes);
App.use("/api/courses", courseRoutes);
App.use("/api/ai", aiRoutes);
App.use("/api/todos", todoRoutes);


// Basic health endpoint for uptime/keep-alive pings
App.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend-service', timestamp: new Date().toISOString() });
});

export default App;
