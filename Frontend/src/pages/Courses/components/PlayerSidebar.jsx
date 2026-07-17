import React from 'react'
import styles from '../CoursePlayer.module.css'

const PlayerSidebar = ({
  course,
  activeVideo,
  isOwner,
  selectVideo,
  handleToggleWatched,
  completedCount,
  totalCount,
  completionPercentage,
  handleRefreshPlaylist,
  refreshing
}) => {
  const videos = course?.videos || []

  return (
    <aside className={styles.sidebarDirectory}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitleRow}>
          <h3>Course Contents</h3>
          {course?.playlistId && (
            <button
              onClick={handleRefreshPlaylist}
              className={styles.syncBtn}
              title="Sync playlist with YouTube"
              disabled={refreshing}
            >
              <span className={`${styles.syncIcon} ${refreshing ? styles.spinning : ''}`}>🔄</span>
              {refreshing ? 'Syncing...' : 'Sync'}
            </button>
          )}
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBarWrapper}>
            <div 
              className={styles.progressBar} 
              style={{ 
                width: `${completionPercentage}%`, 
                background: completionPercentage === 100 ? 'var(--success)' : 'var(--primary-color)' 
              }}
            ></div>
          </div>
          <div className={styles.progressText}>
            <span>{completionPercentage}% Complete</span>
            <span>{completedCount}/{totalCount} videos</span>
          </div>
        </div>
      </div>

      <div className={styles.videoListWrapper}>
        <ul className={styles.videoList}>
          {videos.map((vid, idx) => {
            const isActive = activeVideo && activeVideo._id === vid._id
            const hasNotes = vid.notes && vid.notes.trim().length > 0

            return (
              <li
                key={vid._id}
                className={`${styles.videoItem} ${isActive ? styles.activeVideoItem : ''}`}
                onClick={() => selectVideo(vid)}
              >
                <div className={styles.itemMain}>
                  {isOwner ? (
                    <button 
                      className={`${styles.checkCheckbox} ${vid.completed ? styles.checked : ''}`}
                      onClick={(e) => handleToggleWatched(e, vid._id)}
                      title={vid.completed ? "Mark as unwatched" : "Mark as watched"}
                    >
                      {vid.completed ? '✓' : ''}
                    </button>
                  ) : (
                    <div className={styles.disabledCheckbox} title="Enroll to track progress">
                      ⭕
                    </div>
                  )}
                  
                  <div className={styles.videoInfo}>
                    <span className={styles.itemTitle}>{vid.title}</span>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemIndex}>#{idx + 1}</span>
                      {vid.duration && <span className={styles.itemDuration}>• {vid.duration}</span>}
                      {hasNotes && <span className={styles.notesBadge} title="Notes written">📝 Notes</span>}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

export default PlayerSidebar
