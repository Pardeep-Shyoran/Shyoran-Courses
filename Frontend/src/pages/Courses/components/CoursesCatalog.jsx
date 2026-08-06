import React from 'react'
import CourseCard from '../../../components/CourseCard/CourseCard'
import styles from '../Courses.module.css'

const CoursesCatalog = ({ 
  loading, 
  error, 
  filteredCourses, 
  courses, 
  currentUserId, 
  handleDeleteCourse, 
  handleEnrollCourse, 
  activeMainTab,
  setShowImportModal,
  hasActiveFilters,
  onResetFilters
}) => {
  if (loading && courses.length === 0) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading courses...</p>
      </div>
    )
  }

  if (error) {
    return <div className={styles.errorState}>{error}</div>
  }

  if (filteredCourses.length === 0) {
    return (
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
        <h3>No matching courses found</h3>
        <p>
          {hasActiveFilters
            ? 'No courses match your active search or filter criteria.'
            : activeMainTab === 'library'
            ? 'Try adding a new course with 1-click Quick Import.'
            : 'No public courses are available yet.'}
        </p>
        <div className={styles.emptyActions}>
          {hasActiveFilters && onResetFilters && (
            <button 
              onClick={onResetFilters} 
              className={styles.secondaryBtn} 
              style={{ marginTop: '1rem' }}
            >
              🔄 Clear Search & Filters
            </button>
          )}
          {activeMainTab === 'library' && setShowImportModal && (
            <button 
              onClick={() => setShowImportModal(true)} 
              className={styles.primaryBtn} 
              style={{ marginTop: '1rem' }}
            >
              ⚡ Quick Import a Playlist
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
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
  )
}

export default CoursesCatalog
