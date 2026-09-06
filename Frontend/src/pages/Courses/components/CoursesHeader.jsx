import React from 'react'
import styles from '../Courses.module.css'

const CoursesHeader = ({ activeMainTab, setActiveMainTab, setShowImportModal, setShowCreateModal }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerBadge}>✦ WORKSPACE 2.0 • CURATED DIRECTORY</div>

      <div className={styles.headerContentWrapper}>
        <div className={styles.headerTitleArea}>
          <h1 className={styles.pageTitle}>
            Courses & <span className={styles.gradientText}>Learning Tracks</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Import YouTube playlists, build custom study curricula, and earn verifiable credentials.
          </p>
        </div>

        <div className={styles.actionBtns}>
          <button 
            type="button"
            className={styles.importBtn} 
            onClick={() => setActiveMainTab('add')}
            title="Import YouTube Playlist or Starter"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>Import Playlist</span>
          </button>

          <button 
            type="button"
            className={styles.createBtn} 
            onClick={() => setShowCreateModal(true)}
            title="Build Custom Course"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Custom Course</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default CoursesHeader
