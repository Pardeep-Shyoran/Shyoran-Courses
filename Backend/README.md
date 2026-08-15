# ⚙️ Shyoran Courses - Backend Service

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)

The **Shyoran Courses Backend Service** is a high-performance RESTful API built on **Node.js**, **Express 5**, and **MongoDB (Mongoose 9)**, integrated with **Google Gemini AI** and automated YouTube transcript extraction pipelines.

---

## 🚀 Key Architectural Responsibilities

- **Authentication & Security**: JWT-based session management delivered via HTTP-only cookies and Bearer tokens, with password encryption via `bcryptjs`.
- **YouTube Playlist & Video Parser Engine**: Custom scraper (`youtubeScraper.js`) and API integration (`youtube-transcript`) to automatically fetch playlist metadata, structure chapters into course modules, calculate video durations, and handle real-time playlist refresh actions.
- **AI Study Assistant Engine**: Automatic YouTube transcript extraction paired with structured prompts via `@google/generative-ai` to generate comprehensive lecture notes, key summaries, interactive Q&A tutor responses, self-assessment quizzes, and flashcards.
- **Gamified 365-Day Streak & Activity Engine**: Tracks daily learning progress with timezone-aligned midnight reset logic (12:00 AM IST) and calculates streak counts, active learning hours, and milestone badge qualifications.
- **Productivity APIs**: Full CRUD operations for weekly study timetables and daily study todo checklists with tag categorizations and completion toggling.
- **Analytics & Learning Insights**: Dynamic aggregate queries returning weekly study time trends, course progress completion percentages, category breakdowns, and AI-driven personalized study recommendations.
- **Certificate Verification Engine**: Instant validation and automated generation of verifiable course completion certificates.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime**: Node.js (`v18+`)
- **Web Framework**: Express 5 (`express`)
- **Database & Object Modeling**: MongoDB via Mongoose (`mongoose` v9)
- **Security & Authorization**: `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`
- **AI & External Integrations**: `@google/generative-ai` (Gemini Flash / Pro), `youtube-transcript`, `dotenv`
- **Development Tooling**: `nodemon` for auto-reloading development server

---

## 📁 Directory Structure

```
Backend/
├── server.js                        # Server entry point (binds Express app to PORT)
├── package.json                     # NPM dependencies and scripts definition
├── .env                             # Environment configuration (git-ignored)
└── src/
    ├── App.js                       # Express app setup, CORS, body parsers, routes mounting
    ├── config/
    │   └── config.js                # Centralized environment configuration loader
    ├── controller/
    │   ├── ai.controller.js         # Gemini AI notes, tutor chat, quiz, & flashcard generators
    │   ├── analytics.controller.js  # Dashboard analytics & AI study insight aggregations
    │   ├── auth.controller.js       # User registration, login, logout, profile update handlers
    │   ├── certificate.controller.js# Certificate generation & public verification handler
    │   ├── course.controller.js     # Course CRUD, playlist importer, video completion & personal notes
    │   ├── timetable.controller.js  # Study timetable slot CRUD & date toggle handlers
    │   └── todo.controller.js       # Daily study checklist task CRUD & toggle handlers
    ├── db/
    │   └── db.js                    # MongoDB Mongoose connection client
    ├── middleware/
    │   └── auth.js                  # JWT token authentication and validation middleware
    ├── models/
    │   ├── user.model.js            # User schema (credentials, display info, total streak stats)
    │   ├── course.model.js          # Course schema (modules, lesson video structures, metadata)
    │   ├── enrollment.model.js      # User course enrollment & lesson progress tracking schema
    │   ├── studyActivity.model.js   # Daily study duration & streak tracking activity logs
    │   ├── timetable.model.js       # Weekly study schedule slots schema
    │   ├── todo.model.js            # Daily study task checklist schema
    │   └── certificate.model.js     # Verifiable course completion certificate schema
    ├── routes/
    │   ├── ai.routes.js             # Express router mounting `/api/ai`
    │   ├── analytics.routes.js      # Express router mounting `/api/analytics`
    │   ├── auth.routes.js           # Express router mounting `/api/auth`
    │   ├── certificate.routes.js    # Express router mounting `/api/certificates`
    │   ├── course.routes.js         # Express router mounting `/api/courses`
    │   ├── timetable.routes.js      # Express router mounting `/api/timetable`
    │   └── todo.routes.js           # Express router mounting `/api/todos`
    └── utils/
        ├── ai.js                    # Gemini AI client helpers & structured prompt builders
        ├── aiPrompts.js             # Markdown prompt templates for notes, quizzes & tutors
        ├── transcript.js            # YouTube transcript extraction utility
        └── youtubeScraper.js        # YouTube playlist HTML/API scraper utility
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the `Backend/` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/shyoran-courses

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Google Gemini AI Integration
GEMINI_API_KEY=your_google_gemini_api_key_here

# YouTube API Integration (Optional / Scraper Fallback)
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

---

## 🚦 Available Scripts

Run the following commands inside the `Backend/` directory:

- `npm start`: Runs the server in production mode (`node server.js`).
- `npm run dev`: Runs the development server with hot-reload (`nodemon server.js`).

---

## 📡 Complete API Endpoints Specification

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account with email, password, name | ❌ |
| `POST` | `/api/auth/login` | Authenticate user credentials & issue JWT auth cookie/token | ❌ |
| `POST` | `/api/auth/logout` | Revoke current user session and clear authentication cookie | ✅ |
| `GET` | `/api/auth/me` | Fetch authenticated user profile, avatar, preferences & stats | ✅ |
| `PUT` | `/api/auth/profile` | Update user name, avatar, bio, or target study goals | ✅ |

### 📚 Courses & Playlists (`/api/courses`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/courses` | Get all enrolled courses for the authenticated user | ✅ |
| `GET` | `/api/courses/public` | Get catalog of public preset courses | ❌ |
| `POST` | `/api/courses` | Create custom course or save imported YouTube playlist | ✅ |
| `POST` | `/api/courses/import-playlist` | Parse & preview structure of a YouTube playlist URL | ✅ |
| `GET` | `/api/courses/:id` | Fetch detailed course metadata, modules, and user progress | ✅ |
| `POST` | `/api/courses/:id/enroll` | Enroll current user in a course | ✅ |
| `PUT` | `/api/courses/:id` | Update course details (title, description, tags) | ✅ |
| `DELETE` | `/api/courses/:id` | Remove a course from user library | ✅ |
| `POST` | `/api/courses/:id/refresh` | Re-sync YouTube playlist metadata & new videos | ✅ |
| `PATCH` | `/api/courses/:id/videos/:videoId/toggle` | Toggle lesson video completion state & record study time | ✅ |
| `PATCH` | `/api/courses/:id/videos/:videoId/notes` | Save personal GFM markdown notes for a video lesson | ✅ |
| `GET` | `/api/courses/stats/study-tracker` | Get 365-day streak metrics & daily activity heatmap data | ✅ |

### 🤖 AI Study Assistant (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/video/:videoId/summary` | Generate complete structured AI lecture notes from transcript | ✅ |
| `POST` | `/api/ai/video/:videoId/chat` | Send question to AI video tutor based on lesson transcript | ✅ |
| `POST` | `/api/ai/video/:videoId/flashcards` | Generate AI flashcards for active recall study | ✅ |
| `POST` | `/api/ai/video/:videoId/quiz` | Generate interactive multiple-choice quiz questions | ✅ |

### 📊 Analytics & Insights (`/api/analytics`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/analytics` | Retrieve learning hours, category distribution & completion rates | ✅ |
| `GET` | `/api/analytics/ai-insights` | Generate personalized AI study recommendations & study focus | ✅ |

### 📅 Study Timetable (`/api/timetable`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/timetable` | Get user's weekly study schedule slots | ✅ |
| `POST` | `/api/timetable` | Create a new study schedule slot | ✅ |
| `PUT` | `/api/timetable/:id` | Edit study schedule slot details | ✅ |
| `DELETE` | `/api/timetable/:id` | Remove study schedule slot | ✅ |
| `PATCH` | `/api/timetable/:id/toggle` | Toggle schedule slot completion state for today | ✅ |

### ✅ Study Todo Checklist (`/api/todos`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/todos` | Fetch user's study todo task list | ✅ |
| `POST` | `/api/todos` | Add a new task to study checklist | ✅ |
| `PATCH` | `/api/todos/:id/toggle` | Toggle task completion status | ✅ |
| `DELETE` | `/api/todos/:id` | Delete task from study checklist | ✅ |

### 📜 Certificates (`/api/certificates`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/certificates` | Retrieve list of all course completion certificates earned by user | ✅ |
| `GET` | `/api/certificates/:id` | Public verification endpoint to fetch specific certificate details | ❌ |

### 🏥 System Health
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Server uptime check returning timestamp and service health status | ❌ |

---

## 💾 Database Schemas Summary

1. **User Schema (`user.model.js`)**: `name`, `email`, `password`, `avatar`, `currentStreak`, `longestStreak`, `lastStudyDate`, `preferences`.
2. **Course Schema (`course.model.js`)**: `title`, `description`, `thumbnail`, `category`, `level`, `modules` (array of titles and `videos`), `duration`, `isPreset`.
3. **Enrollment Schema (`enrollment.model.js`)**: `userId`, `courseId`, `completedVideos` (array of video IDs), `personalNotes` (map of videoId -> markdown text), `progressPercentage`, `enrolledAt`, `lastAccessedAt`.
4. **Study Activity Schema (`studyActivity.model.js`)**: `userId`, `date` (YYYY-MM-DD), `durationMinutes`, `completedCount`, `streakCount`.
5. **Timetable Schema (`timetable.model.js`)**: `userId`, `subject`, `dayOfWeek`, `startTime`, `endTime`, `color`, `completedDates`.
6. **Todo Schema (`todo.model.js`)**: `userId`, `text`, `completed`, `category`, `dueDate`.
7. **Certificate Schema (`certificate.model.js`)**: `certificateId`, `userId`, `courseId`, `issueDate`, `studentName`, `courseTitle`, `totalDuration`.

---

## 📜 License

This project is licensed under the **ISC License**.

