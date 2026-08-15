<div align="center">

# 🎓 Shyoran Courses

### *Turn Any YouTube Playlist Into an Interactive, AI-Powered Learning Hub*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](./LICENSE)

---

**Shyoran Courses** is an all-in-one, full-stack learning platform that converts any YouTube playlist or custom curriculum into structured video modules. Powered by **Google Gemini AI**, it provides automated lecture notes, real-time video transcript tutoring, self-assessment quizzes, interactive flashcards, markdown notes with timestamp video syncing, a 365-day gamified study streak tracker, daily timetable and todo checklist tools, and verifiable course completion certificates.

[⚡ Quick Start](#-quick-start) • [✨ Key Features](#-key-features) • [📦 Presets](#-preset-courses) • [🔌 API Overview](#-api-endpoints-summary) • [📁 Structure](#-repository-structure) • [📖 Documentation](#-sub-module-documentation)

</div>

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: `v18+` & **npm**: `v9+`
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas connection string
- **Google Gemini API Key** *(Optional, for AI study tools)*: Get one at [Google AI Studio](https://aistudio.google.com/)

### 1️⃣ Clone & Setup Backend
```bash
# Navigate into backend directory
cd Backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env  # or manually create .env
```

Configure `Backend/.env`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/shyoran-courses
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Optional AI & YouTube Keys
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

Start the Backend server:
```bash
npm run dev
```
> 📍 Backend REST API will be running at `http://localhost:3000`

---

### 2️⃣ Setup & Launch Frontend
In a separate terminal window:
```bash
# Navigate into frontend directory
cd Frontend

# Install dependencies
npm install
```

Configure `Frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

Launch the Frontend development server:
```bash
npm run dev
```
> 🚀 Web Application will be open at `http://localhost:5173`

---

## ✨ Key Features

| Feature Component | Description |
| :--- | :--- |
| 📹 **YouTube Playlist Importer** | Instant 1-click import of any public YouTube playlist into structured modules, lessons, and timestamps. |
| 🤖 **AI Lecture Notes** | Automatically extracts transcripts and compiles in-depth lecture notes, summaries, and key concepts via Gemini AI. |
| 💬 **AI Interactive Tutor** | Ask context-aware questions directly while watching video lectures to clarify concepts instantly. |
| 🧠 **AI Quiz & Flashcards** | Generates self-assessment multiple-choice quizzes and interactive study cards for active recall. |
| 📝 **Rich Markdown Notes** | Full markdown editor supporting GFM, code syntax highlighting, copy-code blocks, and clickable video timestamp links (`[02:15]`). |
| 📈 **365-Day Gamified Streak** | Daily consistency engine with IST midnight resets (12:00 AM IST), active learning heatmaps, and 7 milestone badge tiers. |
| 📅 **Study Timetable Scheduler** | Weekly study calendar tool to schedule sessions, assign subject blocks, and mark slots as completed. |
| ✅ **Study Todo Checklist** | Daily study task manager supporting tags, task filtering, progress tracking, and batch updates. |
| 📊 **Learning Analytics** | Comprehensive statistics showing active hours, category breakdown, course progress metrics, and AI study insights. |
| 📜 **Verifiable Certificates** | Beautiful visual certificates awarded automatically at 100% course completion with unique verification IDs. |
| ⌨️ **Command Palette (`Cmd+K`)** | Universal keyboard action bar for ultra-fast navigation across pages, courses, and search filters. |

---

## 📦 Preset Courses

Get started immediately with 1-click curated learning tracks without needing an external YouTube link:

| Course Preset | Difficulty Level | Estimated Duration | Category Focus |
| :--- | :---: | :---: | :--- |
| 🐙 **Git & GitHub Mastery** | Intermediate | 1.3 Hours | Version Control & Collaboration |
| 🎯 **Sigma Web Development** | Beginner | 72.5 Hours | Full-Stack Web Development |
| 💻 **Modern JavaScript Bootcamp** | Beginner - Intermediate | 11.5 Hours | JavaScript ES6+ & Async Programming |
| 📊 **Data Structures & Algorithms** | All Levels | 16.2 Hours | CS Fundamentals & Problem Solving |
| 🤖 **n8n AI Automation Full Course** | Intermediate | 4.5 Hours | AI Workflows & Business Automation |
| 🐍 **Python Core & Scripting** | Beginner | 48.0 Hours | Python Basics to Automation |

---

## 🔌 API Endpoints Summary

<details>
<summary><b>🔍 Click to view full backend API endpoint list</b></summary>

<br />

| Category | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register a new user account |
| | `POST` | `/api/auth/login` | Authenticate user & issue JWT cookie/token |
| | `POST` | `/api/auth/logout` | Terminate session & clear cookies |
| | `GET` | `/api/auth/me` | Fetch authenticated user profile & streak stats |
| | `PUT` | `/api/auth/profile` | Update user display name, avatar, or preferences |
| **Courses** | `GET` | `/api/courses` | List user enrolled courses & progress |
| | `GET` | `/api/courses/public` | Catalog of preset & public courses |
| | `POST` | `/api/courses` | Create custom course or save playlist import |
| | `POST` | `/api/courses/import-playlist` | Parse & preview YouTube playlist structure |
| | `GET` | `/api/courses/:id` | Get full course details, modules, & progress |
| | `POST` | `/api/courses/:id/enroll` | Enroll user in a course |
| | `PUT` / `DELETE` | `/api/courses/:id` | Update metadata or delete course |
| | `POST` | `/api/courses/:id/refresh` | Re-sync YouTube playlist metadata |
| | `PATCH` | `/api/courses/:id/videos/:videoId/toggle` | Toggle video completion & log activity |
| | `PATCH` | `/api/courses/:id/videos/:videoId/notes` | Save personal markdown lesson notes |
| | `GET` | `/api/courses/stats/study-tracker` | Retrieve study streak & activity heatmap data |
| **AI Assistant** | `POST` | `/api/ai/video/:videoId/summary` | Generate complete AI structured lecture notes |
| | `POST` | `/api/ai/video/:videoId/chat` | Contextual Q&A conversation with AI tutor |
| | `POST` | `/api/ai/video/:videoId/flashcards` | Generate AI recall flashcards from lesson |
| | `POST` | `/api/ai/video/:videoId/quiz` | Generate AI multiple-choice quiz questions |
| **Analytics** | `GET` | `/api/analytics` | Fetch overall learning stats & category metrics |
| | `GET` | `/api/analytics/ai-insights` | Get personalized AI learning recommendations |
| **Timetable** | `GET` / `POST` | `/api/timetable` | Get study schedule or add study time slot |
| | `PUT` / `DELETE` | `/api/timetable/:id` | Update or remove schedule slot |
| | `PATCH` | `/api/timetable/:id/toggle` | Toggle study slot completion for current date |
| **Todos** | `GET` / `POST` | `/api/todos` | Fetch study checklist or add new task |
| | `PATCH` | `/api/todos/:id/toggle` | Toggle todo task status |
| | `DELETE` | `/api/todos/:id` | Delete task from checklist |
| **Certificates**| `GET` | `/api/certificates` | Retrieve user earned completion certificates |
| | `GET` | `/api/certificates/:id` | Public verification endpoint for certificate |
| **System** | `GET` | `/health` | Server uptime and health status check |

</details>

---

## 📁 Repository Structure

```
Shyoran-Courses/
├── ⚙️ Backend/                   # Node.js + Express 5 REST API & AI Engine
│   ├── server.js                # HTTP server launcher
│   ├── src/
│   │   ├── App.js               # Express application initialization & middleware setup
│   │   ├── config/              # Centralized environment variables config
│   │   ├── controller/          # Auth, Course, AI, Analytics, Timetable, Todo controllers
│   │   ├── db/                  # MongoDB database connection handler
│   │   ├── middleware/          # JWT authentication and authorization middlewares
│   │   ├── models/              # Mongoose data schemas (User, Course, Activity, etc.)
│   │   ├── routes/              # Express API router definitions
│   │   └── utils/               # AI prompt generator, YouTube transcript & scraper utils
│   └── README.md                # Detailed Backend service documentation
│
└── 🎨 Frontend/                  # React 19 + Vite 7 SPA Client Application
    ├── src/
    │   ├── components/          # Reusable UI modules (CommandPalette, NotesRenderer, Modal, etc.)
    │   ├── context/             # AuthContext & global React application state
    │   ├── data/                # Presets catalog & static course definitions
    │   ├── hooks/               # Custom React hooks (useAuth, useFetch, etc.)
    │   ├── pages/               # Views (Home, Auth, Courses, CoursePlayer, Dashboard, etc.)
    │   ├── services/            # Axios / Fetch API integration layer
    │   └── utils/               # Formatting, date utilities, and video parsing helpers
    └── README.md                # Detailed Frontend client documentation
```

---

## 📖 Sub-Module Documentation

For specific setup guides, internal logic explanations, and component architectures:
- 📖 [Backend Service Documentation](./Backend/README.md)
- 📖 [Frontend Client Documentation](./Frontend/README.md)

---

<div align="center">

Crafted with ❤️ by **Pardeep Shyoran**

</div>

