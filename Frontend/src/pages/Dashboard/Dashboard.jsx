import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCourses, deleteCourse, getStudyTrackerStats } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardHeader from './components/DashboardHeader'
import DashboardOverview from './components/DashboardOverview'
import DashboardChecklist from './components/DashboardChecklist'
import DashboardCourses from './components/DashboardCourses'
import DashboardAddCourse from './components/DashboardAddCourse'
import DashboardProfile from './components/DashboardProfile'
import DashboardRewards from './components/DashboardRewards'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const { user: authUser, logout, updateUser } = useAuth()
  const user = authUser
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const userId = authUser?._id || authUser?.id

  // Tab State: 'overview', 'courses', 'checklist', 'rewards', 'add-course', 'profile'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tab') || 'overview'
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab && ['overview', 'courses', 'checklist', 'rewards', 'add-course', 'profile'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])

  // Consistency Tracker state
  const [trackerStats, setTrackerStats] = useState(null)
  const [trackerLoading, setTrackerLoading] = useState(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCourses()
      const currentUserId = user?._id || user?.id
      const myCourses = data.filter(c => c.user?._id === currentUserId || c.user === currentUserId)
      setCourses(myCourses)
      
      setTrackerLoading(true)
      const todayStr = new Date().toISOString().split('T')[0]
      const trackerData = await getStudyTrackerStats(todayStr)
      setTrackerStats(trackerData)
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
      setTrackerLoading(false)
    }
  }

  useEffect(() => {
    if (!userId) return
    fetchDashboardData()
  }, [userId])

  const handleLogout = () => {
    logout()
    localStorage.removeItem('lastPlayed')
    navigate('/login')
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>User not found. Please login again.</div>
      </div>
    )
  }

  // Calculate Study Streak
  const calculateStreak = () => {
    const watchDates = []
    courses.forEach(course => {
      course.videos.forEach(v => {
        if (v.completed && v.watchedAt) {
          const dateStr = new Date(v.watchedAt).toDateString()
          if (!watchDates.includes(dateStr)) {
            watchDates.push(dateStr)
          }
        }
      })
    })

    if (watchDates.length === 0) return 0

    const parsedDates = watchDates.map(d => new Date(d)).sort((a, b) => b - a)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const latestDate = parsedDates[0]
    latestDate.setHours(0, 0, 0, 0)

    if (latestDate < yesterday) return 0

    let streak = 1
    let currentDate = latestDate

    for (let i = 1; i < parsedDates.length; i++) {
      const nextDate = parsedDates[i]
      nextDate.setHours(0, 0, 0, 0)
      
      const diffTime = Math.abs(currentDate - nextDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        streak++
        currentDate = nextDate
      } else if (diffDays > 1) {
        break
      }
    }

    return streak
  }

  const streak = trackerStats?.currentStreak !== undefined ? trackerStats.currentStreak : calculateStreak()

  // Find Resume Learning Target
  const getResumeTarget = () => {
    const lastPlayed = localStorage.getItem('lastPlayed') ? JSON.parse(localStorage.getItem('lastPlayed')) : null
    if (lastPlayed) {
      const course = courses.find(c => c._id === lastPlayed.courseId)
      if (course) {
        const video = course.videos.find(v => v._id === lastPlayed.videoId)
        if (video) {
          return { course, video }
        }
      }
    }

    let bestCourse = null
    let bestProgress = -1
    let bestVideo = null

    courses.forEach(c => {
      const total = c.videos.length
      if (total === 0) return

      const completed = c.videos.filter(v => v.completed).length
      const progress = completed / total

      if (progress < 1 && progress > bestProgress) {
        const firstIncomplete = c.videos.find(v => !v.completed)
        if (firstIncomplete) {
          bestCourse = c
          bestProgress = progress
          bestVideo = firstIncomplete
        }
      }
    })

    if (bestCourse && bestVideo) {
      return { course: bestCourse, video: bestVideo }
    }

    if (courses.length > 0 && courses[0].videos.length > 0) {
      return { course: courses[0], video: courses[0].videos[0] }
    }

    return null
  }

  const resumeTarget = getResumeTarget()

  // Delete Course
  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? All progress and notes will be permanently lost.`)) {
      return
    }
    try {
      await deleteCourse(id)
      setCourses(courses.filter(c => c._id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete course.')
    }
  }

  return (
    <div className={styles.container}>
      <DashboardHeader user={user} setActiveTab={setActiveTab} />

      {/* Dashboard Sub-Tabs Navbar */}
      <div className={styles.tabNavbarWrapper}>
        <div className={styles.tabNavbar}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Overview</span>
          </button>
          
          <button 
            className={`${styles.tabBtn} ${activeTab === 'courses' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>My Courses</span>
            <span className={styles.tabCountBadge}>{courses.length}</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'checklist' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Checklist & Streaks</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'rewards' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
            <span>Rewards & Certificates</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'add-course' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('add-course')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Course</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Account Settings</span>
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {loading && activeTab === 'overview' ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading stats and courses...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <DashboardOverview
                user={user}
                courses={courses}
                streak={streak}
                resumeTarget={resumeTarget}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
              />
            )}

            {activeTab === 'checklist' && (
              <DashboardChecklist
                streak={streak}
                trackerStats={trackerStats}
                trackerLoading={trackerLoading}
              />
            )}

            {activeTab === 'rewards' && (
              <DashboardRewards
                user={user}
                courses={courses}
                streak={streak}
              />
            )}

            {activeTab === 'courses' && (
              <DashboardCourses
                courses={courses}
                handleDeleteCourse={handleDeleteCourse}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'add-course' && (
              <DashboardAddCourse
                fetchDashboardData={fetchDashboardData}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'profile' && (
              <DashboardProfile
                user={user}
                setUser={updateUser}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
