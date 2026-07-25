import React from 'react'
import { QUICK_IMPORT_PRESETS } from '../../data/quickImportPresets'
import styles from './QuickImportGrid.module.css'

const QuickImportGrid = ({ onSelectPreset, loadingUrl = null, title = "Curated 1-Click Starter Playlists" }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>⚡ {title}</h3>
        <p>Pick a popular educational track to import instantly into your workspace.</p>
      </div>

      <div className={styles.grid}>
        {QUICK_IMPORT_PRESETS.map((preset) => {
          const isLoading = loadingUrl === preset.playlistUrl
          return (
            <div key={preset.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.emojiBadge}>{preset.emoji}</div>
                <span className={styles.levelBadge}>{preset.level}</span>
              </div>

              <div className={styles.cardContent}>
                <span className={styles.tag}>{preset.tag}</span>
                <h4 className={styles.title}>{preset.title}</h4>
                <p className={styles.description}>{preset.description}</p>
                <div className={styles.meta}>
                  <span>🎥 {preset.videosCount} lessons</span>
                  <span>•</span>
                  <span>⏱️ {preset.duration}</span>
                </div>
              </div>

              <button
                className={styles.importBtn}
                onClick={() => onSelectPreset(preset.playlistUrl, preset)}
                disabled={isLoading}
              >
                {isLoading ? 'Fetching Track...' : '⚡ Quick Import'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuickImportGrid
