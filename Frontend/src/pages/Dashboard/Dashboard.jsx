import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCourses, deleteCourse, getStudyTrackerStats } from '../../services/api'
import { getISTDateStr, getPrevISTDateStr } from '../../utils/dateUtils'
import { useAuth } from '../../context/AuthContext'
import DashboardHeader from './components/DashboardHeader'
import DashboardOverview from './components/DashboardOverview'
import DashboardAnalytics from './components/DashboardAnalytics'
import DashboardChecklist from './components/DashboardChecklist'
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

  // Tab State: 'overview', 'checklist', 'rewards', 'profile'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam === 'courses') {
      navigate('/courses?tab=library', { replace: true })
      return 'overview'
    }
    if (tabParam === 'add-course') {
      navigate('/courses?tab=add', { replace: true })
      return 'overview'
    }
    return tabParam || 'overview'
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab === 'courses') {
      navigate('/courses?tab=library', { replace: true })
    } else if (tab === 'add-course') {
      navigate('/courses?tab=add', { replace: true })
    } else if (tab && ['overview', 'analytics', 'checklist', 'rewards', 'profile'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search, navigate])

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
      const todayStr = getISTDateStr()
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

  // Calculate Study Streak (using IST midnight boundaries)
  const calculateStreak = () => {
    const watchDates = new Set()
    courses.forEach(course => {
      course.videos.forEach(v => {
        if (v.completed && v.watchedAt) {
          watchDates.add(getISTDateStr(v.watchedAt))
        }
      })
    })

    if (watchDates.size === 0) return 0

    const todayStr = getISTDateStr()
    const yesterdayStr = getPrevISTDateStr(todayStr)

    let streak = 0
    if (watchDates.has(todayStr) || watchDates.has(yesterdayStr)) {
      let checkStr = watchDates.has(todayStr) ? todayStr : yesterdayStr
      while (watchDates.has(checkStr)) {
        streak++
        checkStr = getPrevISTDateStr(checkStr)
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

  return (
    <div className={styles.container}>
      <DashboardHeader user={user} />

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
            className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Learning Analytics</span>
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
                handleLogout={handleLogout}
              />
            )}

            {activeTab === 'analytics' && (
              <DashboardAnalytics />
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

