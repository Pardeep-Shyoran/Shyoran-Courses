import React, { useState } from 'react'
import PlaylistImportForm from '../../../components/PlaylistImportForm/PlaylistImportForm'
import CustomCourseForm from '../../../components/CustomCourseForm/CustomCourseForm'
import QuickImportGrid from '../../../components/QuickImportGrid/QuickImportGrid'
import styles from '../Dashboard.module.css'

const DashboardAddCourse = ({ fetchDashboardData, setActiveTab }) => {
  const [addCourseMode, setAddCourseMode] = useState('quick') // 'quick', 'import', or 'custom'
  const [selectedPresetUrl, setSelectedPresetUrl] = useState('')

  const handleSuccess = () => {
    fetchDashboardData()
    setActiveTab('courses')
  }

  const handleSelectPreset = (url) => {
    setSelectedPresetUrl(url)
    setAddCourseMode('import')
  }

  return (
    <div className={styles.tabPane}>
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>Add New Course</h2>
          <p className={styles.paneSubtitle}>Select a 1-Click starter preset, paste a YouTube playlist URL, or craft a custom track.</p>
        </div>
      </div>

      {/* Sub-mode selector */}
      <div className={styles.addCourseTabs}>
        <button 
          className={`${styles.addCourseTabBtn} ${addCourseMode === 'quick' ? styles.activeAddCourseTab : ''}`}
          onClick={() => setAddCourseMode('quick')}
        >
          ⚡ 1-Click Presets
        </button>
        <button 
          className={`${styles.addCourseTabBtn} ${addCourseMode === 'import' ? styles.activeAddCourseTab : ''}`}
          onClick={() => setAddCourseMode('import')}
        >
          📥 YouTube Link Import
        </button>
        <button 
          className={`${styles.addCourseTabBtn} ${addCourseMode === 'custom' ? styles.activeAddCourseTab : ''}`}
          onClick={() => setAddCourseMode('custom')}
        >
          ➕ Build Custom Course
        </button>
      </div>

      <div className={styles.formContainer}>
        {addCourseMode === 'quick' && (
          <QuickImportGrid onSelectPreset={handleSelectPreset} />
        )}

        {addCourseMode === 'import' && (
          <PlaylistImportForm onSuccess={handleSuccess} initialUrl={selectedPresetUrl} />
        )}

        {addCourseMode === 'custom' && (
          <CustomCourseForm onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  )
}

export default DashboardAddCourse

