import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCourses, deleteCourse, enrollInCourse } from '../../services/api'
import CourseCard from '../../components/CourseCard/CourseCard'
import Modal from '../../components/Modal/Modal'
import PlaylistImportForm from '../../components/PlaylistImportForm/PlaylistImportForm'
import CustomCourseForm from '../../components/CustomCourseForm/CustomCourseForm'
import styles from './Courses.module.css'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Tabs: 'library' or 'explore'
  const [activeMainTab, setActiveMainTab] = useState('explore')
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'in-progress', 'completed'

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const navigate = useNavigate()

  // Load user
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

  useEffect(() => {
    fetchCoursesList()
  }, [])

  const fetchCoursesList = async () => {
    setLoading(true)
    try {
      const data = await getCourses()
      setCourses(data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch courses.')
    } finally {
      setLoading(false)
    }
  }

  // Delete Course handler
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

  // Enroll in Public Course handler
  const handleEnrollCourse = async (courseId) => {
    setLoading(true)
    try {
      const res = await enrollInCourse(courseId)
      await fetchCoursesList()
      navigate(`/courses/${res.course._id}`)
    } catch (err) {
      alert(err.message || 'Failed to enroll in course.')
    } finally {
      setLoading(false)
    }
  }

  // Main Tabs Separation
  const currentUserId = user?._id || user?.id;
  const libraryCourses = courses.filter(course => course.user?._id === currentUserId)
  const exploreCourses = courses.filter(course => 
    course.user?._id !== currentUserId && 
    (course.user?.role === 'admin' || course.user?.role === 'mentor')
  )

  const activeCoursesSet = activeMainTab === 'library' ? libraryCourses : exploreCourses

  // Filter & Search computation
  const filteredCourses = activeCoursesSet.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeMainTab === 'explore') {
      return matchesSearch
    }

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
      <header className={styles.header}>
        <div className={styles.headerTitleArea}>
          <h1 className={styles.pageTitle}>Learning Workspace</h1>
          <p className={styles.pageSubtitle}>Import playlists, structure custom courses, and watch your skills grow.</p>
        </div>
        <div className={styles.actionBtns}>
          <Link to="/dashboard?tab=courses" className={styles.myCoursesLinkBtn}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>My Enrolled Courses</span>
          </Link>
          <button className={styles.importBtn} onClick={() => setShowImportModal(true)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Import Playlist</span>
          </button>
          <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Custom Course</span>
          </button>
        </div>
      </header>

      {/* Main Tabs Selection */}
      <div className={styles.mainTabs}>
        <button 
          className={`${styles.mainTab} ${activeMainTab === 'library' ? styles.activeMainTab : ''}`}
          onClick={() => { setActiveMainTab('library'); setFilterType('all'); }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="M12 6v6l4 2"></path>
          </svg>
          My Library ({libraryCourses.length})
        </button>
        <button 
          className={`${styles.mainTab} ${activeMainTab === 'explore' ? styles.activeMainTab : ''}`}
          onClick={() => setActiveMainTab('explore')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
          Explore Catalog ({exploreCourses.length})
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search courses by title or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        {activeMainTab === 'library' && (
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.filterTab} ${filterType === 'all' ? styles.activeFilter : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Courses
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
        )}
      </div>

      {loading && courses.length === 0 ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading courses...</p>
        </div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : filteredCourses.length === 0 ? (
        <div className={styles.emptyGrid}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.emptyIcon}
          >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
          <h3>No courses found</h3>
          <p>{activeMainTab === 'library' ? 'Try refining your search or add a new course to get started.' : 'No public courses match your criteria.'}</p>
        </div>
      ) : (
        <div className={styles.coursesGrid}>
          {filteredCourses.map(course => {
            // Check if student is already enrolled in this explore course
            const enrolledCourseId = courses.find(c => 
              c.user?._id === currentUserId && 
              ((course.playlistId && c.playlistId === course.playlistId) || 
               (!course.playlistId && c.title === course.title))
            )?._id

            return (
              <CourseCard
                key={course._id}
                course={course}
                activeMainTab={activeMainTab}
                enrolledCourseId={enrolledCourseId}
                onDelete={handleDeleteCourse}
                onEnroll={handleEnrollCourse}
              />
            )
          })}
        </div>
      )}

      {/* IMPORT YT PLAYLIST MODAL */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import YouTube Playlist"
      >
        <PlaylistImportForm 
          onSuccess={() => {
            setShowImportModal(false)
            fetchCoursesList()
          }}
          onCancel={() => setShowImportModal(false)}
        />
      </Modal>

      {/* CREATE CUSTOM COURSE MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Custom Course"
      >
        <CustomCourseForm 
          onSuccess={() => {
            setShowCreateModal(false)
            fetchCoursesList()
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}

export default Courses
