import React, { useState } from 'react'
import PlaylistImportForm from '../../../components/PlaylistImportForm/PlaylistImportForm'
import CustomCourseForm from '../../../components/CustomCourseForm/CustomCourseForm'
import styles from '../Dashboard.module.css'

const DashboardAddCourse = ({ fetchDashboardData, setActiveTab }) => {
  const [addCourseMode, setAddCourseMode] = useState('import') // 'import' or 'custom'

  const handleSuccess = () => {
    fetchDashboardData()
    setActiveTab('courses')
  }

  return (
    <div className={styles.tabPane}>
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>Add New Course</h2>
          <p className={styles.paneSubtitle}>Import automated tracks from YouTube playlists or create modular manual tracks.</p>
        </div>
      </div>

      {/* Sub-mode selector */}
      <div className={styles.addCourseTabs}>
        <button 
          className={`${styles.addCourseTabBtn} ${addCourseMode === 'import' ? styles.activeAddCourseTab : ''}`}
          onClick={() => setAddCourseMode('import')}
        >
          📥 YouTube Playlist Import
        </button>
        <button 
          className={`${styles.addCourseTabBtn} ${addCourseMode === 'custom' ? styles.activeAddCourseTab : ''}`}
          onClick={() => setAddCourseMode('custom')}
        >
          ➕ Build Custom Course
        </button>
      </div>

      <div className={styles.formContainer}>
        {addCourseMode === 'import' ? (
          <PlaylistImportForm onSuccess={handleSuccess} />
        ) : (
          <CustomCourseForm onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  )
}

export default DashboardAddCourse
