import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCourses, deleteCourse, enrollInCourse } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal/Modal'
import PlaylistImportForm from '../../components/PlaylistImportForm/PlaylistImportForm'
import CustomCourseForm from '../../components/CustomCourseForm/CustomCourseForm'
import CoursesHeader from './components/CoursesHeader'
import CoursesTabs from './components/CoursesTabs'
import CoursesToolbar from './components/CoursesToolbar'
import CoursesCatalog from './components/CoursesCatalog'
import CoursesAddTab from './components/CoursesAddTab'
import styles from './Courses.module.css'

const Courses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()
  
  // Tabs: 'library', 'explore', or 'add'
  const [activeMainTab, setActiveMainTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam === 'add' || tabParam === 'add-course') return 'add'
    if (tabParam === 'library' || tabParam === 'courses') return 'library'
    if (tabParam === 'explore') return 'explore'
    return 'library'
  })
  
  // Sync tab with URL search params changes
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab')
    if (tabParam === 'add' || tabParam === 'add-course') {
      setActiveMainTab('add')
    } else if (tabParam === 'library' || tabParam === 'courses') {
      setActiveMainTab('library')
    } else if (tabParam === 'explore') {
      setActiveMainTab('explore')
    }
  }, [location.search])

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'in-progress', 'completed'

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [initialImportUrl, setInitialImportUrl] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    fetchCoursesList()
    const params = new URLSearchParams(window.location.search)
    const playlistUrlParam = params.get('playlistUrl')
    if (playlistUrlParam) {
      setInitialImportUrl(playlistUrlParam)
      setActiveMainTab('add')
      // Clear the url parameter to avoid popping up on manual page reload
      window.history.replaceState({}, document.title, window.location.pathname)
    }
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
  const currentUserId = user?._id || user?.id
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
      <CoursesHeader 
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        setShowImportModal={setShowImportModal}
        setShowCreateModal={setShowCreateModal}
      />

      <CoursesTabs 
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        setFilterType={setFilterType}
        libraryCount={libraryCourses.length}
        exploreCount={exploreCourses.length}
      />

      {activeMainTab === 'add' ? (
        <CoursesAddTab 
          fetchCoursesList={fetchCoursesList}
          setActiveMainTab={setActiveMainTab}
          initialPresetUrl={initialImportUrl}
        />
      ) : (
        <>
          <CoursesToolbar 
            activeMainTab={activeMainTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
          />

          <CoursesCatalog 
            loading={loading}
            error={error}
            filteredCourses={filteredCourses}
            courses={courses}
            currentUserId={currentUserId}
            handleDeleteCourse={handleDeleteCourse}
            handleEnrollCourse={handleEnrollCourse}
            activeMainTab={activeMainTab}
            setShowImportModal={() => setActiveMainTab('add')}
          />
        </>
      )}

      {/* IMPORT YT PLAYLIST MODAL */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import YouTube Playlist"
      >
        <PlaylistImportForm 
          initialUrl={initialImportUrl}
          onSuccess={() => {
            setShowImportModal(false)
            setInitialImportUrl('')
            fetchCoursesList()
            setActiveMainTab('library')
          }}
          onCancel={() => {
            setShowImportModal(false)
            setInitialImportUrl('')
          }}
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
            setActiveMainTab('library')
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}

export default Courses

