import React from 'react'
import styles from '../Courses.module.css'

const CoursesTabs = ({ activeMainTab, setActiveMainTab, setFilterType, libraryCount, exploreCount }) => {
  return (
    <div className={styles.mainTabs}>
      <button 
        className={`${styles.mainTab} ${activeMainTab === 'library' ? styles.activeMainTab : ''}`}
        onClick={() => { 
          setActiveMainTab('library')
          setFilterType('all') 
        }}
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
        My Library ({libraryCount})
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
        Explore Catalog ({exploreCount})
      </button>
    </div>
  )
}

export default CoursesTabs
