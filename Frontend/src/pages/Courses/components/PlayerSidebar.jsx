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
  refreshing,
  localVideos = [],
  isReordering = false,
  isReversed = false,
  handleToggleReverse,
  handleStartReordering,
  handleSaveOrder,
  handleCancelReordering,
  handleMoveVideo,
  handleShowCertificate
}) => {
  const videosWithOriginalIndex = localVideos.map((vid, idx) => ({ ...vid, originalIndex: idx }))
  const displayedVideos = isReversed && !isReordering 
    ? [...videosWithOriginalIndex].reverse() 
    : videosWithOriginalIndex

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

        {/* Certificate Card */}
        <div className={styles.certificateProgressCard}>
          {completionPercentage === 100 ? (
            <div className={styles.certCardUnlocked}>
              <div className={styles.certCardHeader}>
                <span className={styles.certIcon}>🏆</span>
                <h4>Certificate Unlocked!</h4>
              </div>
              <p>Congratulations, you completed this roadmap.</p>
              <button 
                onClick={() => handleShowCertificate(false)} 
                className={styles.certViewBtn}
              >
                🎓 View Certificate
              </button>
            </div>
          ) : (
            <div className={styles.certCardLocked}>
              <div className={styles.certCardHeader}>
                <span className={styles.certIcon}>🔒</span>
                <h4>Certificate Roadmap</h4>
              </div>
              <p>Complete all lessons to earn your certificate.</p>
              <button 
                onClick={() => handleShowCertificate(true)} 
                className={styles.certPreviewBtn}
              >
                👁️ Preview Certificate
              </button>
            </div>
          )}
        </div>

        {/* Playlist Controls Toolbar */}
        <div className={styles.playlistToolbar}>
          {isReordering ? (
            <div className={styles.reorderActions}>
              <span className={styles.reorderActiveLabel}>✍️ Reordering Playlist</span>
              <div className={styles.reorderBtns}>
                <button onClick={handleSaveOrder} className={styles.saveOrderBtn} title="Save current order">
                  Save
                </button>
                <button onClick={handleCancelReordering} className={styles.cancelReorderBtn} title="Cancel reordering">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.toolbarContent}>
              <button 
                onClick={handleToggleReverse} 
                className={`${styles.toolbarBtn} ${isReversed ? styles.activeToolbarBtn : ''}`}
                title="Reverse display order"
              >
                ⇅ {isReversed ? 'Reversed (Last-First)' : 'Reverse Order'}
              </button>
              {isOwner && (
                <button 
                  onClick={handleStartReordering} 
                  className={styles.toolbarBtn}
                  title="Reorder videos"
                >
                  ⚙️ Reorder
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.videoListWrapper}>
        <ul className={`${styles.videoList} ${isReordering ? styles.reorderingList : ''}`}>
          {displayedVideos.map((vid) => {
            const isActive = activeVideo && activeVideo._id === vid._id
            const hasNotes = vid.notes && vid.notes.trim().length > 0

            return (
              <li
                key={vid._id}
                className={`${styles.videoItem} ${isActive ? styles.activeVideoItem : ''} ${isReordering ? styles.reorderVideoItem : ''}`}
                onClick={() => {
                  if (!isReordering) {
                    selectVideo(vid)
                  }
                }}
              >
                <div className={styles.itemMain}>
                  {!isReordering && (
                    isOwner ? (
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
                    )
                  )}
                  
                  <div className={styles.videoInfo}>
                    <span className={styles.itemTitle}>{vid.title}</span>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemIndex}>#{vid.originalIndex + 1}</span>
                      {isActive && (
                        <span className={styles.nowPlayingBadge}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                          <span>Playing</span>
                        </span>
                      )}
                      {vid.duration && <span className={styles.itemDuration}>• {vid.duration}</span>}
                      {hasNotes && <span className={styles.notesBadge} title="Notes written">📝 Notes</span>}
                    </div>
                  </div>

                  {isReordering && (
                    <div className={styles.reorderItemControls}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveVideo(vid.originalIndex, -1)
                        }}
                        disabled={vid.originalIndex === 0}
                        className={styles.reorderArrowBtn}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveVideo(vid.originalIndex, 1)
                        }}
                        disabled={vid.originalIndex === localVideos.length - 1}
                        className={styles.reorderArrowBtn}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  )}
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
