import React, { useState } from 'react'
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
  handleShowCertificate,
  totalDurationFormatted = '',
  remainingDurationFormatted = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'unwatched', 'completed', 'notes'

  const unwatchedCount = Math.max(0, totalCount - completedCount)
  const notesCount = localVideos.filter(v => v.notes && v.notes.trim().length > 0).length

  const videosWithOriginalIndex = localVideos.map((vid, idx) => ({ ...vid, originalIndex: idx }))
  
  // Apply reverse if enabled
  const orderedVideos = isReversed && !isReordering 
    ? [...videosWithOriginalIndex].reverse() 
    : videosWithOriginalIndex

  // Apply search query and status filter
  const displayedVideos = orderedVideos.filter(vid => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = vid.title.toLowerCase().includes(q)
      const matchesIndex = (vid.originalIndex + 1).toString().includes(q)
      if (!matchesTitle && !matchesIndex) return false
    }

    // Status filter match
    if (statusFilter === 'unwatched') {
      return !vid.completed
    }
    if (statusFilter === 'completed') {
      return vid.completed
    }
    if (statusFilter === 'notes') {
      return vid.notes && vid.notes.trim().length > 0
    }
    return true
  })

  return (
    <aside className={styles.sidebarDirectory}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitleRow}>
          <div className={styles.sidebarTitleWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.sidebarHeaderIcon}>
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <h3>Course Contents</h3>
          </div>

          {course?.playlistId && (
            <button
              onClick={handleRefreshPlaylist}
              className={styles.syncBtn}
              title="Sync playlist with YouTube"
              disabled={refreshing}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${styles.syncIcon} ${refreshing ? styles.spinning : ''}`}>
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBarWrapper}>
            <div 
              className={styles.progressBar} 
              style={{ 
                width: `${completionPercentage}%`, 
                background: completionPercentage === 100 ? 'var(--success)' : 'linear-gradient(135deg, var(--primary-color) 0%, var(--warning) 100%)' 
              }}
            ></div>
          </div>
          <div className={styles.progressText}>
            <span>{completionPercentage}% Complete</span>
            <span>{completedCount}/{totalCount} lessons</span>
          </div>

          {totalDurationFormatted && (
            <div className={styles.sidebarDurationRow}>
              <span>Total: <strong>{totalDurationFormatted}</strong></span>
              {remainingDurationFormatted && remainingDurationFormatted !== '0m' && (
                <span>Left: <strong>{remainingDurationFormatted}</strong></span>
              )}
            </div>
          )}
        </div>

        {/* Certificate Card */}
        <div className={styles.certificateProgressCard}>
          {completionPercentage === 100 ? (
            <div className={styles.certCardUnlocked}>
              <div className={styles.certCardHeader}>
                <div className={styles.certIconWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </div>
                <h4>Certificate Unlocked!</h4>
              </div>
              <p>Congratulations, you completed all lessons in this curriculum.</p>
              <button 
                onClick={() => handleShowCertificate(false)} 
                className={styles.certViewBtn}
              >
                <span>View Certificate</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          ) : (
            <div className={styles.certCardLocked}>
              <div className={styles.certCardHeader}>
                <div className={`${styles.certIconWrap} ${styles.certIconLocked}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h4>Certificate Roadmap</h4>
              </div>
              <p>Complete all lessons to unlock your verified credential.</p>
              <button 
                onClick={() => handleShowCertificate(true)} 
                className={styles.certPreviewBtn}
              >
                <span>Preview Certificate</span>
              </button>
            </div>
          )}
        </div>

        {/* Playlist Controls Toolbar */}
        <div className={styles.playlistToolbar}>
          {isReordering ? (
            <div className={styles.reorderActions}>
              <span className={styles.reorderActiveLabel}>Reordering Playlist</span>
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="7 3 7 21"></polyline>
                  <polyline points="3 7 7 3 11 7"></polyline>
                  <polyline points="17 21 17 3"></polyline>
                  <polyline points="13 17 17 21 21 17"></polyline>
                </svg>
                <span>{isReversed ? 'Reverse Order (On)' : 'Reverse Order'}</span>
              </button>
              {isOwner && (
                <button 
                  onClick={handleStartReordering} 
                  className={styles.toolbarBtn}
                  title="Reorder videos"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="8" x2="20" y2="8"></line>
                    <line x1="4" y1="16" x2="20" y2="16"></line>
                  </svg>
                  <span>Reorder</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search & Quick Filter (when not reordering) */}
        {!isReordering && (
          <>
            <div className={styles.sidebarSearchWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.sidebarSearchIcon}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons in course..."
                className={styles.sidebarSearchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={styles.sidebarSearchClear}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.sidebarFilterTabs}>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`${styles.sidebarFilterPill} ${statusFilter === 'all' ? styles.activeFilterPill : ''}`}
              >
                <span>All</span>
                <span className={styles.pillCount}>{totalCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unwatched')}
                className={`${styles.sidebarFilterPill} ${statusFilter === 'unwatched' ? styles.activeFilterPill : ''}`}
              >
                <span>Unwatched</span>
                <span className={styles.pillCount}>{unwatchedCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`${styles.sidebarFilterPill} ${statusFilter === 'completed' ? styles.activeFilterPill : ''}`}
              >
                <span>Done</span>
                <span className={styles.pillCount}>{completedCount}</span>
              </button>
              {notesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('notes')}
                  className={`${styles.sidebarFilterPill} ${statusFilter === 'notes' ? styles.activeFilterPill : ''}`}
                >
                  <span>Notes</span>
                  <span className={styles.pillCount}>{notesCount}</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.videoListWrapper}>
        {displayedVideos.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.84rem' }}>
            <p>No lessons match your current filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              style={{
                marginTop: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--primary-color)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              Reset Filter
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </aside>
  )
}

export default PlayerSidebar
