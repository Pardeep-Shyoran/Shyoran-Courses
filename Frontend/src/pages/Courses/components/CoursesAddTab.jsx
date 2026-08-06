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
        <div>
          <h2 className={styles.paneTitle}>Add & Import Courses</h2>
          <p className={styles.paneSubtitle}>Select a 1-Click starter preset, paste a YouTube playlist URL, or craft a custom learning track.</p>
        </div>
      </div>

      {/* Sub-mode Selector Tabs */}
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
