# 🎨 Shyoran Courses - Frontend Client

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.0-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-Latest-F56565?style=for-the-badge&logo=lucide&logoColor=white)](https://lucide.dev/)

The **Shyoran Courses Frontend** is a modern Single Page Application (SPA) client built with **React 19**, **Vite 7**, and **Vanilla CSS Modules**. Designed with a glassmorphic dark-mode UI aesthetic, rich interactive markdown rendering, real-time AI study interfaces, and gamified streak tracking.

For overall repository overview and backend installation, visit the [Root README](../README.md).

---

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `Frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   > 🚀 The frontend client will run locally at `http://localhost:5173`.

---

## 🖥️ Core User Interface Modules

### 🎥 Course Player Suite (`/courses/:id`)
An immersive video learning environment featuring:
- **Responsive Player**: Integrated video player with custom playback controls and lesson completion toggling.
- **Interactive Module Sidebar**: Hierarchical module list showing completion checkmarks, durations, and active lesson tracking.
- **Tabbed Workspace**:
  - 📖 **About**: Course syllabus, instructor profile, overall course statistics, and category tags.
  - 🤖 **AI Assistant**: 
    - **AI Notes**: Structured AI lecture notes parsed directly from video transcripts.
    - **AI Tutor Chat**: Live Q&A chat assistant scoped to the active lesson transcript.
    - **AI Quiz & Flashcards**: Auto-generated assessment questions and flashcards.
  - 📝 **Personal Notes Editor**: Full Markdown editor supporting GitHub Flavored Markdown (GFM), syntax highlighting, code copying, and clickable timestamp links (`[02:15]`) that auto-seek the video.
  - 🎯 **Practice & Flashcards**: Active recall quiz view and interactive flip-card study mode.
  - ⚙️ **Player Settings**: Playback rate defaults, auto-advance preferences, and interface controls.

### 📊 Gamified Dashboard Ecosystem (`/dashboard`)
A centralized learning hub with dedicated sub-views:
- **Overview**: Current 365-day streak counter, quick resume for recent courses, active learning statistics.
- **My Courses**: Grid view of enrolled courses with progress bars, filters, and custom playlist import tools.
- **Study Timetable Scheduler**: Interactive calendar to schedule subject study blocks and log daily completions.
- **Daily Todo Checklist**: Task checklist manager supporting category tags, due dates, and completion status.
- **Learning Analytics**: Visual charts for active study hours, category breakdowns, and AI-driven study recommendations.
- **Rewards & Badge Gallery**: Gamified streak tracker (1-day to 365-day milestone tiers) and verifiable completion certificates.
- **User Profile**: Account details, study goal preferences, and theme settings.

### ⌨️ Universal Command Palette (`Cmd+K` / `Ctrl+K`)
Global keyboard modal available on any screen allowing instant search across courses, page navigation, quick actions, and keyboard shortcuts.

### 📜 Certificate Engine
Modal & page view rendering official completion certificates upon 100% course finish, complete with unique verification hash, issue date, and student credentials.

---

## 📁 Directory Structure

```
Frontend/
├── index.html                       # Entry HTML document with fonts and metadata
├── vite.config.js                   # Vite configuration (plugins, dev server ports)
├── package.json                     # Frontend dependencies and scripts
└── src/
    ├── main.jsx                     # React DOM root entry point
    ├── App.jsx                      # App root component with global providers
    ├── index.css                    # Base CSS design tokens, reset, & theme variables
    │
    ├── assets/                      # Static branding logos & icons
    ├── context/
    │   └── AuthContext.jsx          # User authentication state provider
    ├── data/
    │   └── presets.js               # Pre-configured course presets data catalog
    ├── hooks/
    │   ├── useAuth.js               # Custom hook for accessing AuthContext
    │   └── useFetch.js              # API data fetching custom hook with caching
    │
    ├── routes/
    │   └── AppRoutes.jsx            # React Router v7 routes definition
    ├── services/
    │   ├── api.js                   # Centralized Axios/Fetch HTTP client configuration
    │   ├── auth.service.js          # Auth API requests (login, register, logout, profile)
    │   ├── course.service.js        # Course & playlist API requests
    │   ├── ai.service.js            # Gemini AI endpoints (summary, tutor chat, quiz)
    │   ├── timetable.service.js     # Schedule API requests
    │   └── todo.service.js          # Study checklist API requests
    │
    ├── utils/
    │   ├── formatters.js            # Duration, date, and text formatting helpers
    │   └── timestampParser.js       # Video timestamp parser for clickable notes
    │
    ├── components/                  # Global reusable UI components
    │   ├── Breadcrumbs/             # Path navigation header links
    │   ├── Certificate/             # Verifiable visual certificate rendering component
    │   ├── CommandPalette/          # Keyboard action modal (Cmd+K)
    │   ├── CourseCard/              # Course card grid item component
    │   ├── CustomCourseForm/        # Custom manual course creation modal
    │   ├── Footer/                  # App footer component
    │   ├── GatewayLogo/             # Brand logo SVG component
    │   ├── Layout/                  # Main page layout wrapper with Header & Sidebar
    │   ├── Modal/                   # Generic modal dialog container
    │   ├── NotesRenderer/           # Markdown & syntax highlight renderer for lesson notes
    │   ├── PlaylistImportForm/      # YouTube playlist URL import modal
    │   └── QuickImportGrid/         # Preset course catalog grid picker
    │
    └── pages/                       # Application view routes
        ├── Home/                    # Landing page with hero banner & feature matrix
        ├── Auth/                    # Login and Registration split forms
        ├── Courses/                 # Courses catalog page & CoursePlayer suite
        ├── Dashboard/               # Dashboard workspace (Overview, Analytics, Rewards, etc.)
        ├── About/                   # Platform mission and features overview page
        └── Contact/                 # Support and feedback contact form
```

---

## 🛠️ Scripts & Tools

Inside the `Frontend/` directory:

- `npm run dev`: Starts local Vite dev server with Hot Module Replacement (HMR).
- `npm run build`: Bundles optimized production production build assets into `dist/`.
- `npm run preview`: Previews the production build locally.

---

## ⚙️ Environment Configuration

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base REST API URL pointing to backend server | `http://localhost:3000/api` |

---

## 📜 License

This project is licensed under the **ISC License**.

