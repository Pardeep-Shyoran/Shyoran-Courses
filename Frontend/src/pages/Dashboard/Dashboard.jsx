import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { getCourses, deleteCourse, updateProfile, getStudyTrackerStats, getTodos, createTodo, toggleTodo, deleteTodo } from '../../services/api'
import CourseCard from '../../components/CourseCard/CourseCard'
import PlaylistImportForm from '../../components/PlaylistImportForm/PlaylistImportForm'
import CustomCourseForm from '../../components/CustomCourseForm/CustomCourseForm'
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

  // My Courses Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'in-progress', 'completed'

  // Add Course Mode: 'import' or 'custom'
  const [addCourseMode, setAddCourseMode] = useState('import')

  // Profile Form State
  const [profileName, setProfileName] = useState(storedUser?.name || '')
  const [profileEmail, setProfileEmail] = useState(storedUser?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(null)

  // Consistency Tracker & Todo List state
  const [trackerStats, setTrackerStats] = useState(null)
  const [trackerLoading, setTrackerLoading] = useState(true)
  const [todos, setTodos] = useState([])
  const [todoLoading, setTodoLoading] = useState(true)
  const [newTodoText, setNewTodoText] = useState('')
  const [todoSubmitting, setTodoSubmitting] = useState(false)

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

      setTodoLoading(true)
      const todoData = await getTodos()
      setTodos(todoData)
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
      setTrackerLoading(false)
      setTodoLoading(false)
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

  // Calculate statistics
  const totalCourses = courses.length
  let totalVideos = 0
  let completedVideosCount = 0
  let completedCoursesCount = 0

  courses.forEach(course => {
    const courseVideos = course.videos || []
    totalVideos += courseVideos.length
    
    const completedInCourse = courseVideos.filter(v => v.completed).length
    completedVideosCount += completedInCourse

    if (courseVideos.length > 0 && completedInCourse === courseVideos.length) {
      completedCoursesCount++
    }
  })

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


  // Generate day items for consistency calendar heatmap
  const generateHeatmapDays = () => {
    const days = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364)

    // Pad the start to align weekdays (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = startDate.getDay()
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ isPadding: true })
    }

    const curDate = new Date(startDate)
    while (curDate <= today) {
      const dateStr = curDate.toISOString().split('T')[0]
      days.push({
        date: new Date(curDate),
        dateStr,
        dayOfWeek: curDate.getDay(),
        month: curDate.toLocaleString('default', { month: 'short' }),
        count: trackerStats?.heatmap?.[dateStr] || 0
      })
      curDate.setDate(curDate.getDate() + 1)
    }
    return days
  }

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

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError(null)
    setProfileSuccess(null)
    try {
      const payload = { name: profileName, email: profileEmail }
      if (newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }
      const data = await updateProfile(payload)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      setProfileSuccess('Profile updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  // Add a new Todo task
  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!newTodoText || !newTodoText.trim()) return
    setTodoSubmitting(true)
    try {
      const addedTodo = await createTodo(newTodoText.trim())
      setTodos([addedTodo, ...todos])
      setNewTodoText('')
    } catch (err) {
      alert(err.message || 'Failed to add task.')
    } finally {
      setTodoSubmitting(false)
    }
  }

  // Toggle Todo completion status
  const handleToggleTodo = async (id) => {
    try {
      const updatedTodo = await toggleTodo(id)
      setTodos(todos.map(t => t._id === id ? { ...t, completed: updatedTodo.completed } : t))
    } catch (err) {
      alert(err.message || 'Failed to toggle task.')
    }
  }

  // Delete Todo task
  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id)
      setTodos(todos.filter(t => t._id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete task.')
    }
  }

  // Filter My Courses based on query and tabs
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())

    const total = course.videos.length
    const completed = course.videos.filter(v => v.completed).length
    const isCompleted = total > 0 && completed === total
    const isInProgress = total > 0 && completed > 0 && completed < total

    if (filterType === 'completed') {
      return matchesSearch && isCompleted
    }
    if (filterType === 'in-progress') {
      return matchesSearch && (isInProgress || (total > 0 && completed === 0))
    }
    return matchesSearch
  })

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.userGreeting}>
          <div className={styles.avatar}>
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h1 className={styles.greetingTitle}>Welcome back, {user.name.split(' ')[0]}</h1>
            <p className={styles.greetingSubtitle}>Track your studies, manage courses, and master new skills.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => setActiveTab('add-course')} className={styles.btnPrimary}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Course</span>
          </button>
        </div>
      </header>

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
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className={styles.tabPane}>
                {/* Stats Grid */}
                <section className={styles.statsSection}>
                  <div className={styles.statsGrid}>
                    <div className={styles.statsCard}>
                      <span className={styles.statLabel}>Enrolled Courses</span>
                      <h3 className={styles.statValue}>{totalCourses}</h3>
                    </div>

                    <div className={styles.statsCard}>
                      <span className={styles.statLabel}>Completed Courses</span>
                      <h3 className={styles.statValue}>{completedCoursesCount}</h3>
                    </div>

                    <div className={styles.statsCard}>
                      <span className={styles.statLabel}>Videos Watched</span>
                      <h3 className={styles.statValue}>{completedVideosCount} / {totalVideos}</h3>
                    </div>

                    <div className={styles.statsCard}>
                      <span className={styles.statLabel}>Study Streak</span>
                      <h3 className={styles.statValue}>{streak} {streak === 1 ? 'day' : 'days'}</h3>
                    </div>
                  </div>
                </section>
                <div className={styles.dashboardSplit}>
                  {/* Left Column */}
                  <div className={styles.dashboardLeft}>
                    {resumeTarget ? (
                      <section className={styles.resumeSection}>
                        <h2 className={styles.sectionTitle}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          Resume Learning
                        </h2>
                        <div className={styles.resumeCard}>
                          <div className={styles.resumeThumbnail}>
                            <img 
                              src={resumeTarget.course.thumbnail || `https://img.youtube.com/vi/${resumeTarget.video.youtubeId}/hqdefault.jpg`} 
                              alt={resumeTarget.course.title} 
                            />
                            <span className={styles.resumeBadge}>In Progress</span>
                          </div>
                          <div className={styles.resumeDetails}>
                            <span className={styles.courseSubtitle}>{resumeTarget.course.title}</span>
                            <h3>{resumeTarget.video.title}</h3>
                            <p>Continue where you left off and complete your learning milestones.</p>
                            <Link 
                              to={`/courses/${resumeTarget.course._id}?videoId=${resumeTarget.video._id}`}
                              className={styles.resumeBtn}
                            >
                              ▶ Resume Video
                            </Link>
                          </div>
                        </div>
                      </section>
                    ) : (
                      <section className={styles.resumeSection}>
                        <h2 className={styles.sectionTitle}>Ready to Study</h2>
                        <div className={styles.emptyCourses}>
                          <p>Ready to start? Import a course or custom track to begin tracking your progress!</p>
                          <button onClick={() => setActiveTab('add-course')} className={styles.createCourseBtn}>
                            Create a Course
                          </button>
                        </div>
                      </section>
                    )}

                    <section className={styles.recentSection}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent Course Progress</h2>
                        <button onClick={() => setActiveTab('courses')} className={styles.viewAllLink}>
                          View All Courses →
                        </button>
                      </div>
                      
                      {courses.length === 0 ? (
                        <div className={styles.emptyCourses}>
                          <p>You haven't enrolled in any courses yet.</p>
                          <button onClick={() => setActiveTab('add-course')} className={styles.createCourseBtn}>
                            Add Your First Course
                          </button>
                        </div>
                      ) : (
                        <div className={styles.progressList}>
                          {courses.slice(0, 3).map(course => {
                            const completed = course.videos.filter(v => v.completed).length
                            const total = course.videos.length
                            const pct = total > 0 ? Math.round((completed / total) * 100) : 0
                            return (
                              <div key={course._id} className={styles.progressCard}>
                                <div className={styles.progressInfo}>
                                  <div>
                                    <h4>{course.title}</h4>
                                    <span className={styles.progressRatio}>{completed} / {total} videos completed</span>
                                  </div>
                                  <span className={styles.progressPercentage}>{pct}%</span>
                                </div>
                                <div className={styles.progressBarWrapper}>
                                  <div 
                                    className={styles.progressBar} 
                                    style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--primary-color)' }}
                                  ></div>
                                </div>
                                <div className={styles.progressActions}>
                                  <Link to={`/courses/${course._id}`} className={styles.studyBtn}>
                                    Study Course
                                  </Link>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className={styles.dashboardRight}>
                    <section className={styles.profileSummaryCard}>
                      <h2 className={styles.sectionTitle}>Your Profile</h2>
                      <div className={styles.profileSummaryHeader}>
                        <div className={styles.profileSummaryAvatar}>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className={styles.profileSummaryInfo}>
                          <h4>{user.name}</h4>
                          <p>{user.email}</p>
                        </div>
                      </div>

                      <div className={styles.profileInfoGrid}>
                        <div className={styles.profileInfoCard}>
                          <div className={styles.infoIcon}>🛡️</div>
                          <div className={styles.infoContent}>
                            <h4>Role Type</h4>
                            <p>{user.role.toUpperCase()}</p>
                          </div>
                        </div>

                        <div className={styles.profileInfoCard}>
                          <div className={styles.infoIcon}>📅</div>
                          <div className={styles.infoContent}>
                            <h4>Member Since</h4>
                            <p>
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'Recently'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <button className={styles.logoutBtn} onClick={handleLogout}>
                        🚪 Logout from Account
                      </button>
                    </section>

                  </div>
                </div>
              </div>
            )}

            {/* CHECKLIST & STREAKS TAB */}
            {activeTab === 'checklist' && (
              <div className={styles.tabPane}>
                <div className={styles.paneHeader}>
                  <div>
                    <h2 className={styles.paneTitle}>Consistency Tracker & Tasks</h2>
                    <p className={styles.paneSubtitle}>Build daily study habits, track your streak, and manage tasks.</p>
                  </div>
                </div>

                {/* 1. Full-Width Heatmap Row */}
                <section className={styles.heatmapFullRow}>
                  <div className={styles.heatmapCardFull}>
                    <div className={styles.heatmapHeader}>
                      <span>Contribution Grid (Past 365 Days)</span>
                      <div className={styles.heatmapLegend}>
                        <span>Less</span>
                        <div className={`${styles.legendBox} ${styles.lvl0}`}></div>
                        <div className={`${styles.legendBox} ${styles.lvl1}`}></div>
                        <div className={`${styles.legendBox} ${styles.lvl2}`}></div>
                        <div className={`${styles.legendBox} ${styles.lvl3}`}></div>
                        <div className={`${styles.legendBox} ${styles.lvl4}`}></div>
                        <span>More</span>
                      </div>
                    </div>

                    {trackerLoading ? (
                      <div className={styles.trackerLoading}>
                        <div className={styles.miniSpinner}></div>
                        <p>Loading activity grid...</p>
                      </div>
                    ) : (
                      <div className={styles.heatmapGridWrapper}>
                        <div className={styles.heatmapRowLabels}>
                          <span>Mon</span>
                          <span>Wed</span>
                          <span>Fri</span>
                        </div>

                        <div className={styles.heatmapGrid}>
                          {generateHeatmapDays().map((day, idx) => {
                            if (day.isPadding) {
                              return <div key={`pad-${idx}`} className={styles.heatmapCellPad}></div>
                            }
                            
                            let lvlClass = styles.lvl0
                            if (day.count === 1) lvlClass = styles.lvl1
                            else if (day.count === 2) lvlClass = styles.lvl2
                            else if (day.count === 3) lvlClass = styles.lvl3
                            else if (day.count >= 4) lvlClass = styles.lvl4

                            const formattedDate = day.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })

                            return (
                              <div 
                                key={day.dateStr} 
                                className={`${styles.heatmapCell} ${lvlClass}`}
                                title={`${formattedDate}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'} logged`}
                              ></div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. Split Row: Checklist (60%) & Streak Stats (40%) */}
                <div className={styles.checklistSplitRow}>
                  {/* Left Column: Checklist */}
                  <div className={styles.checklistColumn}>
                    <section className={styles.todoSection}>
                      <h3 className={styles.columnTitle}>📋 Daily Checklist / To-Do List</h3>
                      <div className={styles.todoCard}>
                        <form onSubmit={handleAddTodo} className={styles.todoForm}>
                          <input 
                            type="text" 
                            placeholder="Add a study task..." 
                            value={newTodoText}
                            onChange={(e) => setNewTodoText(e.target.value)}
                            className={styles.todoInput}
                            disabled={todoSubmitting}
                            maxLength={80}
                          />
                          <button 
                            type="submit" 
                            disabled={todoSubmitting || !newTodoText.trim()} 
                            className={styles.btnTodoAdd}
                          >
                            {todoSubmitting ? '+' : 'Add'}
                          </button>
                        </form>

                        {todoLoading ? (
                          <div className={styles.todoLoading}>
                            <div className={styles.miniSpinner}></div>
                            <p>Loading checklist...</p>
                          </div>
                        ) : todos.length === 0 ? (
                          <p className={styles.todoEmpty}>No tasks remaining! Add some goals to stay focused today.</p>
                        ) : (
                          <div className={styles.todoList}>
                            {todos.map(todo => (
                              <div key={todo._id} className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}>
                                <label className={styles.todoCheckboxContainer}>
                                  <input 
                                    type="checkbox" 
                                    checked={todo.completed} 
                                    onChange={() => handleToggleTodo(todo._id)}
                                    className={styles.todoCheckbox}
                                  />
                                  <span className={styles.todoText}>{todo.text}</span>
                                </label>
                                <button 
                                  onClick={() => handleDeleteTodo(todo._id)} 
                                  className={styles.btnTodoDelete}
                                  title="Delete task"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Streak Stats */}
                  <div className={styles.statsColumn}>
                    <section className={styles.streaksSection}>
                      <h3 className={styles.columnTitle}>🔥 Streak & Uptime Stats</h3>
                      <div className={styles.streaksContainer}>
                        <div className={styles.streakSubCard}>
                          <span className={styles.streakEmoji}>🔥</span>
                          <div>
                            <span className={styles.streakVal}>{streak}</span>
                            <span className={styles.streakLbl}>Current Streak</span>
                          </div>
                        </div>
                        <div className={styles.streakSubCard}>
                          <span className={styles.streakEmoji}>🏆</span>
                          <div>
                            <span className={styles.streakVal}>{trackerStats?.longestStreak || 0}</span>
                            <span className={styles.streakLbl}>Longest Streak</span>
                          </div>
                        </div>
                        <div className={styles.streakSubCard}>
                          <span className={styles.streakEmoji}>📚</span>
                          <div>
                            <span className={styles.streakVal}>{trackerStats?.totalActivities || 0}</span>
                            <span className={styles.streakLbl}>Total Activities</span>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}

            {/* MY COURSES TAB */}
            {activeTab === 'courses' && (
              <div className={styles.tabPane}>
                <div className={styles.paneHeader}>
                  <div>
                    <h2 className={styles.paneTitle}>Registered Courses</h2>
                    <p className={styles.paneSubtitle}>Search, monitor progress, and manage your learning items.</p>
                  </div>
                  <button onClick={() => setActiveTab('add-course')} className={styles.actionBtnPrimary}>
                    📥 Add New Course
                  </button>
                </div>

                {/* Toolbar */}
                <div className={styles.toolbar}>
                  <div className={styles.searchWrapper}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search courses..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>
                  <div className={styles.filterTabs}>
                    <button 
                      className={`${styles.filterTab} ${filterType === 'all' ? styles.activeFilter : ''}`}
                      onClick={() => setFilterType('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`${styles.filterTab} ${filterType === 'in-progress' ? styles.activeFilter : ''}`}
                      onClick={() => setFilterType('in-progress')}
                    >
                      In Progress
                    </button>
                    <button 
                      className={`${styles.filterTab} ${filterType === 'completed' ? styles.activeFilter : ''}`}
                      onClick={() => setFilterType('completed')}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                {/* Courses Listing using CourseCard */}
                {filteredCourses.length === 0 ? (
                  <div className={styles.emptyGrid}>
                    <div className={styles.emptyIcon}>📚</div>
                    <h3>No courses match your filter</h3>
                    <p>Try searching for something else or import a new course.</p>
                  </div>
                ) : (
                  <div className={styles.coursesGrid}>
                    {filteredCourses.map(course => (
                      <CourseCard
                        key={course._id}
                        course={course}
                        activeMainTab="library"
                        onDelete={handleDeleteCourse}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADD COURSE TAB */}
            {activeTab === 'add-course' && (
              <div className={styles.tabPane}>
                <div className={styles.paneHeader}>
                  <div>
                    <h2 className={styles.paneTitle}>Add New Course</h2>
                    <p className={styles.paneSubtitle}>Import automated tracks from YouTube playlists or create modular manual tracks.</p>
                  </div>
                </div>

                {/* Sub-mode selector */}
                <div className={styles.addCourseTabs}>
                  <button 
                    className={`${styles.addCourseTabBtn} ${addCourseMode === 'import' ? styles.activeAddCourseTab : ''}`}
                    onClick={() => setAddCourseMode('import')}
                  >
                    📥 YouTube Playlist Import
                  </button>
                  <button 
                    className={`${styles.addCourseTabBtn} ${addCourseMode === 'custom' ? styles.activeAddCourseTab : ''}`}
                    onClick={() => setAddCourseMode('custom')}
                  >
                    ➕ Build Custom Course
                  </button>
                </div>

                <div className={styles.formContainer}>
                  {addCourseMode === 'import' ? (
                    <PlaylistImportForm 
                      onSuccess={() => {
                        fetchDashboardData()
                        setActiveTab('courses')
                      }}
                    />
                  ) : (
                    <CustomCourseForm 
                      onSuccess={() => {
                        fetchDashboardData()
                        setActiveTab('courses')
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* PROFILE DETAILS TAB */}
            {activeTab === 'profile' && (
              <div className={styles.tabPane}>
                <div className={styles.paneHeader}>
                  <div>
                    <h2 className={styles.paneTitle}>Account Settings</h2>
                    <p className={styles.paneSubtitle}>Manage your profile details and update security configurations.</p>
                  </div>
                </div>

                <div className={styles.profileLayoutGrid}>
                  {/* Left side details */}
                  <div className={styles.profileCardFull}>
                    <h3>Overview</h3>
                    <div className={styles.avatarSection}>
                      <div className={styles.profileAvatarLarge}>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className={styles.avatarMeta}>
                        <h4>{user.name}</h4>
                        <span className={styles.roleBadge}>{user.role}</span>
                      </div>
                    </div>

                    <div className={styles.detailsList}>
                      <div className={styles.detailsItem}>
                        <span className={styles.detailsLabel}>Registered Email</span>
                        <span className={styles.detailsValue}>{user.email}</span>
                      </div>
                      <div className={styles.detailsItem}>
                        <span className={styles.detailsLabel}>Account Status</span>
                        <span className={`${styles.detailsValue} ${styles.statusActive}`}>Active</span>
                      </div>
                      <div className={styles.detailsItem}>
                        <span className={styles.detailsLabel}>Member Since</span>
                        <span className={styles.detailsValue}>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side form */}
                  <div className={styles.profileFormCard}>
                    <h3>Update Profile Info</h3>
                    
                    {profileError && <div className={styles.formError}>{profileError}</div>}
                    {profileSuccess && <div className={styles.formSuccess}>{profileSuccess}</div>}

                    <form onSubmit={handleUpdateProfile} className={styles.profileEditForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.fieldLabel}>Full Name</label>
                        <input 
                          type="text" 
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className={styles.formInput}
                          required
                          disabled={profileLoading}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.fieldLabel}>Email Address</label>
                        <input 
                          type="email" 
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className={styles.formInput}
                          required
                          disabled={profileLoading}
                        />
                      </div>

                      <div className={styles.passwordDivider}>
                        <span>🔒 Change Password (optional)</span>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.fieldLabel}>Current Password</label>
                        <input 
                          type="password" 
                          placeholder="Required only to set a new password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={styles.formInput}
                          disabled={profileLoading}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.fieldLabel}>New Password</label>
                        <input 
                          type="password" 
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={styles.formInput}
                          disabled={profileLoading}
                        />
                      </div>

                      <button 
                        type="submit" 
                        className={styles.saveProfileBtn}
                        disabled={profileLoading}
                      >
                        {profileLoading ? 'Saving Profile...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
