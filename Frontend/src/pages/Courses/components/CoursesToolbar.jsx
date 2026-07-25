import React from 'react'
import styles from '../Courses.module.css'

const CoursesToolbar = ({ activeMainTab, searchQuery, setSearchQuery, filterType, setFilterType }) => {
  return (
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
            <span>⚡ All Courses</span>
          </button>
          <button 
            className={`${styles.filterTab} ${filterType === 'in-progress' ? styles.activeFilter : ''}`}
            onClick={() => setFilterType('in-progress')}
          >
            <span>⏳ In Progress</span>
          </button>
          <button 
            className={`${styles.filterTab} ${filterType === 'completed' ? styles.activeFilter : ''}`}
            onClick={() => setFilterType('completed')}
          >
            <span>✅ Completed</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default CoursesToolbar
