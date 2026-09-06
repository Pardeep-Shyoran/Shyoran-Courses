import React from 'react'
import { QUICK_IMPORT_PRESETS } from '../../data/quickImportPresets'
import styles from './QuickImportGrid.module.css'

const QuickImportGrid = ({ onSelectPreset, loadingUrl = null, title = "Curated 1-Click Starter Playlists" }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerBadge}>✦ INSTANT ENROLLMENT PRESETS</div>
        <h3 className={styles.headerTitle}>
          <span>⚡</span> {title}
        </h3>
        <p className={styles.headerSubtitle}>Pick a verified educational track to import and structure into your workspace in seconds.</p>
      </div>

      <div className={styles.grid}>
        {QUICK_IMPORT_PRESETS.map((preset) => {
          const isLoading = loadingUrl === preset.playlistUrl
          return (
            <div key={preset.id} className={styles.card}>
              <div className={styles.cardTopBeam}></div>
              
              <div className={styles.cardHeader}>
                <div className={styles.emojiBadge}>{preset.emoji}</div>
                <span className={styles.levelBadge}>{preset.level}</span>
              </div>

              <div className={styles.cardContent}>
                <span className={styles.tag}>#{preset.tag}</span>
                <h4 className={styles.title}>{preset.title}</h4>
                <p className={styles.description}>{preset.description}</p>
                
                <div className={styles.metaRow}>
                  <span className={styles.metaChip}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    {preset.videosCount} lessons
                  </span>
                  <span className={styles.metaChip}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {preset.duration}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={styles.importBtn}
                onClick={() => onSelectPreset(preset.playlistUrl, preset)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className={styles.btnSpinner}></span>
                    <span>Fetching Track...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Quick Import</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuickImportGrid
