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
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span>My Library ({libraryCount})</span>
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
        <span>Explore Catalog ({exploreCount})</span>
      </button>

      <button 
        className={`${styles.mainTab} ${activeMainTab === 'add' ? styles.activeMainTab : ''}`}
        onClick={() => setActiveMainTab('add')}
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
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Add & Import Course</span>
      </button>
    </div>
  )
}

export default CoursesTabs

