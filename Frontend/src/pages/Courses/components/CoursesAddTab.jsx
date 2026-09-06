import React, { useState, useEffect } from 'react'
import PlaylistImportForm from '../../../components/PlaylistImportForm/PlaylistImportForm'
import CustomCourseForm from '../../../components/CustomCourseForm/CustomCourseForm'
import QuickImportGrid from '../../../components/QuickImportGrid/QuickImportGrid'
import styles from '../Courses.module.css'

const CoursesAddTab = ({ fetchCoursesList, setActiveMainTab, initialPresetUrl = '' }) => {
  const [addCourseMode, setAddCourseMode] = useState(initialPresetUrl ? 'import' : 'quick') // 'quick', 'import', or 'custom'
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(initialPresetUrl)

  useEffect(() => {
    if (initialPresetUrl) {
      setSelectedPresetUrl(initialPresetUrl)
      setAddCourseMode('import')
    }
  }, [initialPresetUrl])

  const handleSuccess = () => {
    fetchCoursesList()
    setActiveMainTab('library')
  }

  const handleSelectPreset = (url) => {
    setSelectedPresetUrl(url)
    setAddCourseMode('import')
  }

  return (
    <div className={styles.addCourseContainer}>
      <div className={styles.paneHeader}>
        <div className={styles.headerBadge} style={{ marginBottom: '0.75rem' }}>
          ✦ COURSE BUILDER • IMPORT ENGINE
        </div>
        <div>
          <h2 className={styles.paneTitle}>Add & Import Courses</h2>
          <p className={styles.paneSubtitle}>Select a 1-Click starter preset, paste a YouTube playlist URL, or craft a custom learning track from scratch.</p>
        </div>
      </div>

      {/* Sub-mode Selector Tabs */}
      <div className={styles.addCourseTabs}>
        <button 
          type="button"
          className={`${styles.addCourseTabBtn} ${addCourseMode === 'quick' ? styles.activeAddCourseTab : ''}`}
          onClick={() => setAddCourseMode('quick')}
        >
          <span>⚡ 1-Click Presets</span>
        </button>
        <button 
          type="button"
          className={`${styles.addCourseTabBtn} ${addCourseMode === 'import' ? styles.activeAddCourseTab : ''}`}
          onClick={() => setAddCourseMode('import')}
        >
          <span>📥 YouTube Link Import</span>
        </button>
        <button 
          type="button"
          className={`${styles.addCourseTabBtn} ${addCourseMode === 'custom' ? styles.activeAddCourseTab : ''}`}
          onClick={() => setAddCourseMode('custom')}
        >
          <span>➕ Build Custom Course</span>
        </button>
      </div>

      <div className={styles.formWrapper}>
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

export default CoursesAddTab
