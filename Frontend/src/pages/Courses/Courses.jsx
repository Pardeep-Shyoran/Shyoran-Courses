import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, deleteCourse, enrollInCourse } from '../../services/api'
import Modal from '../../components/Modal/Modal'
import PlaylistImportForm from '../../components/PlaylistImportForm/PlaylistImportForm'
import CustomCourseForm from '../../components/CustomCourseForm/CustomCourseForm'
import CoursesHeader from './components/CoursesHeader'
import CoursesTabs from './components/CoursesTabs'
import CoursesToolbar from './components/CoursesToolbar'
import CoursesCatalog from './components/CoursesCatalog'
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
      <CoursesHeader 
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
      />

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
