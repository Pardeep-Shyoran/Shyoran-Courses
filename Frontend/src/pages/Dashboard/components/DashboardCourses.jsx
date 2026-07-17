import React, { useState } from 'react'
import CourseCard from '../../../components/CourseCard/CourseCard'
import styles from '../Dashboard.module.css'

const DashboardCourses = ({ courses, handleDeleteCourse, setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'in-progress', 'completed'

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
  )
}

export default DashboardCourses
