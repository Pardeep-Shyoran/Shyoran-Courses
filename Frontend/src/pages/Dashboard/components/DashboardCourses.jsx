import React, { useState } from 'react'
import CourseCard from '../../../components/CourseCard/CourseCard'
import QuickImportGrid from '../../../components/QuickImportGrid/QuickImportGrid'
import styles from '../Dashboard.module.css'

const DashboardCourses = ({ courses, handleDeleteCourse, setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'in-progress', 'completed'

  // Category Counts
  const allCount = courses.length
  const completedCount = courses.filter(c => {
    const total = c.videos.length
    const completed = c.videos.filter(v => v.completed).length
    return total > 0 && completed === total
  }).length
  const inProgressCount = courses.filter(c => {
    const total = c.videos.length
    const completed = c.videos.filter(v => v.completed).length
    return (total > 0 && completed > 0 && completed < total) || (total > 0 && completed === 0)
  }).length

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))

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

  const resetFilters = () => {
    setSearchQuery('')
    setFilterType('all')
  }

  const handleQuickImportSelect = () => {
    setActiveTab('add-course')
  }

  return (
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
      {courses.length > 0 && (
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
              <span>⚡ All</span>
              <span className={styles.filterCountBadge}>{allCount}</span>
            </button>
            <button 
              className={`${styles.filterTab} ${filterType === 'in-progress' ? styles.activeFilter : ''}`}
              onClick={() => setFilterType('in-progress')}
            >
              <span>⏳ In Progress</span>
              <span className={styles.filterCountBadge}>{inProgressCount}</span>
            </button>
            <button 
              className={`${styles.filterTab} ${filterType === 'completed' ? styles.activeFilter : ''}`}
              onClick={() => setFilterType('completed')}
            >
              <span>✅ Completed</span>
              <span className={styles.filterCountBadge}>{completedCount}</span>
            </button>
          </div>
        </div>
      )}

      {/* Zero Enrolled Courses Empty State */}
      {courses.length === 0 ? (
        <div className={styles.guidedEmptyStateContainer}>
          <div className={styles.guidedEmptyCard}>
            <div className={styles.guidedEmptyHeader}>
              <div className={styles.guidedIconWrapper}>📚</div>
              <h3>Your Learning Library is Empty</h3>
              <p>You haven't enrolled in any courses yet. Choose a 1-Click starter track below or import your custom YouTube playlist link!</p>
              
              <div className={styles.guidedActions}>
                <button onClick={() => setActiveTab('add-course')} className={styles.createCourseBtn}>
                  ⚡ 1-Click Quick Import
                </button>
              </div>
            </div>
          </div>

          <QuickImportGrid onSelectPreset={handleQuickImportSelect} title="Popular Recommended Playlists" />
        </div>
      ) : filteredCourses.length === 0 ? (
        /* Filtered Search No Match Empty State */
        <div className={styles.emptyGrid}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3>No courses match your filter</h3>
          <p>We couldn't find any courses matching "{searchQuery}" with status "{filterType}".</p>
          <button onClick={resetFilters} className={styles.secondaryActionBtn} style={{ marginTop: '1rem' }}>
            🔄 Reset Search & Filters
          </button>
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
  )
}

export default DashboardCourses
