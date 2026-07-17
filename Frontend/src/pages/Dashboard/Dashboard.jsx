import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCourses, deleteCourse, getStudyTrackerStats } from '../../services/api'
import DashboardHeader from './components/DashboardHeader'
import DashboardOverview from './components/DashboardOverview'
import DashboardChecklist from './components/DashboardChecklist'
import DashboardCourses from './components/DashboardCourses'
import DashboardAddCourse from './components/DashboardAddCourse'
import DashboardProfile from './components/DashboardProfile'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const [user, setUser] = useState(storedUser)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Tab State: 'overview', 'courses', 'checklist', 'add-course', 'profile'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tab') || 'overview'
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab && ['overview', 'courses', 'checklist', 'add-course', 'profile'].includes(tab)) {
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
      const currentUserId = storedUser?._id || storedUser?.id
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
    if (!storedUser) return
    fetchDashboardData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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
            Overview
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'courses' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            My Courses ({courses.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'checklist' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            Checklist & Streaks
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'add-course' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('add-course')}
          >
            Add Course
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Account Settings
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
                setUser={setUser}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
