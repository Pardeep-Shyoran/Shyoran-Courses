import React, { useEffect, useState } from 'react'
import { getVideoDetails } from '../../../services/api'
import styles from '../CoursePlayer.module.css'

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return null
  }
}

function formatViews(views) {
  if (!views) return null
  const num = typeof views === 'string' ? parseInt(views.replace(/,/g, ''), 10) : views
  if (isNaN(num)) return views
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

// Function to convert URLs and timestamps into interactive clickable elements
function renderFormattedDescription(text, handleSeek, styles) {
  if (!text) return null

  // Regex to match URLs (http, https, www) or YouTube timestamps (hh:mm:ss or mm:ss)
  const tokenRegex = /(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+|\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b)/gi
  const lines = text.split('\n')

  return lines.map((line, lineIdx) => {
    const parts = []
    let lastIndex = 0
    let match

    tokenRegex.lastIndex = 0

    while ((match = tokenRegex.exec(line)) !== null) {
      const matchText = match[0]
      const matchStart = match.index

      if (matchStart > lastIndex) {
        parts.push(line.substring(lastIndex, matchStart))
      }

      // Check if URL
      if (matchText.startsWith('http://') || matchText.startsWith('https://') || matchText.startsWith('www.')) {
        let cleanUrl = matchText.replace(/[.,;)]+$/, '')
        const trailingPunct = matchText.slice(cleanUrl.length)
        const href = cleanUrl.startsWith('www.') ? `https://${cleanUrl}` : cleanUrl

        parts.push(
          <a
            key={`link-${lineIdx}-${matchStart}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.descLink}
            onClick={(e) => e.stopPropagation()}
            title={href}
          >
            <span>{cleanUrl}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '3px', display: 'inline-block', verticalAlign: 'middle' }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        )
        if (trailingPunct) {
          parts.push(trailingPunct)
        }
      } 
      // Check if timestamp (e.g. 02:15 or 1:12:30)
      else if (handleSeek && /^(?:\d{1,2}:)?\d{1,2}:\d{2}$/.test(matchText)) {
        const timeParts = matchText.split(':').map(Number)
        let seconds = 0
        if (timeParts.length === 3) {
          seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]
        } else if (timeParts.length === 2) {
          seconds = timeParts[0] * 60 + timeParts[1]
        }

        parts.push(
          <button
            key={`time-${lineIdx}-${matchStart}`}
            type="button"
            className={styles.timestampBtn}
            onClick={() => handleSeek(seconds)}
            title={`Jump to ${matchText}`}
          >
            ⏱️ {matchText}
          </button>
        )
      } else {
        parts.push(matchText)
      }

      lastIndex = tokenRegex.lastIndex
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex))
    }

    return (
      <div key={`line-${lineIdx}`} className={styles.descLine}>
        {parts.length > 0 ? parts : <br />}
      </div>
    )
  })
}

const PlayerVideoSection = ({ 
  activeVideo, 
  courseId,
  currentIndex,
  totalVideos,
  isOwner, 
  handleToggleWatched, 
  handleEnroll, 
  iframeRef,
  playbackSpeed = 1,
  handleSeek,
  hasNext = false,
  hasPrev = false,
  onNextVideo,
  onPrevVideo,
  theatreMode = false,
  onToggleTheatre,
  autoplayEnabled = true,
  onToggleAutoplay,
  countdownState = null,
  onCancelCountdown,
  onConfirmPlayNext
}) => {
  const [extraDetails, setExtraDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showDescription, setShowDescription] = useState(false)

  // Manage iframe playback speed
  useEffect(() => {
    if (!iframeRef?.current || !activeVideo) return

    const applyPlaybackSpeed = () => {
      try {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'setPlaybackRate',
            args: [Number(playbackSpeed)]
          }), '*')
        }
      } catch (err) {
        // Ignore cross-origin error
      }
    }

    applyPlaybackSpeed()
    const t1 = setTimeout(applyPlaybackSpeed, 500)
    const t2 = setTimeout(applyPlaybackSpeed, 1200)
    const t3 = setTimeout(applyPlaybackSpeed, 2500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [activeVideo, playbackSpeed, iframeRef])

  // Fetch or sync video details (publishedAt, channelTitle, views, description)
  useEffect(() => {
    if (!activeVideo?.youtubeId) return

    // Reset description toggle on video switch
    setShowDescription(false)

    // If activeVideo already has uploaded date or channel, initialize with it
    const hasInitialMeta = Boolean(activeVideo.publishedAt || activeVideo.channelTitle)
    if (hasInitialMeta) {
      setExtraDetails({
        publishedAt: activeVideo.publishedAt,
        channelTitle: activeVideo.channelTitle,
        viewCount: activeVideo.viewCount || '',
        description: activeVideo.description || '',
        duration: activeVideo.duration || ''
      })
    }

    // Always attempt on-demand enrichment if missing publishedAt or channelTitle
    if (!activeVideo.publishedAt || !activeVideo.channelTitle) {
      let isCurrent = true
      setLoadingDetails(true)
      getVideoDetails(activeVideo.youtubeId, courseId)
        .then(data => {
          if (isCurrent && data) {
            setExtraDetails(data)
          }
        })
        .catch(err => {
          console.warn("Video details enrichment warning:", err.message)
        })
        .finally(() => {
          if (isCurrent) setLoadingDetails(false)
        })

      return () => {
        isCurrent = false
      }
    }
  }, [activeVideo?.youtubeId, activeVideo?.publishedAt, activeVideo?.channelTitle, courseId])

  if (!activeVideo) return null

  const handleIframeLoad = () => {
    if (playbackSpeed && iframeRef?.current?.contentWindow) {
      setTimeout(() => {
        try {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'setPlaybackRate',
            args: [Number(playbackSpeed)]
          }), '*')
        } catch (e) {}
      }, 600)
    }
  }

  // Combined video metadata
  const duration = extraDetails?.duration || activeVideo.duration || ''
  const publishedAt = extraDetails?.publishedAt || activeVideo.publishedAt
  const formattedDate = formatDate(publishedAt)
  const channelTitle = extraDetails?.channelTitle || activeVideo.channelTitle
  const viewCount = extraDetails?.viewCount || activeVideo.viewCount
  const formattedViews = formatViews(viewCount)
  const videoDescription = extraDetails?.description || activeVideo.description || ''

  return (
    <>
      {/* Iframe Video Player */}
      <div className={styles.playerWrapper}>
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?enablejsapi=1&rel=0`}
          title={activeVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={styles.playerFrame}
          onLoad={handleIframeLoad}
        ></iframe>
      </div>

      {/* Video Header & Rich Metadata */}
      <div className={styles.videoHeader}>
        <div className={styles.videoHeaderInfo}>
          <h1 className={styles.videoTitle}>{activeVideo.title}</h1>
          
          {/* Metadata Chips Row */}
          <div className={styles.videoMetaRow}>
            {currentIndex != null && totalVideos != null && (
              <span className={`${styles.metaChip} ${styles.metaChipLesson}`} title="Lesson order in course">
                <span className={styles.metaChipIcon}>📚</span>
                <span>Lesson {currentIndex} of {totalVideos}</span>
              </span>
            )}

            {duration && (
              <span className={`${styles.metaChip} ${styles.metaChipDuration}`} title="Duration">
                <span className={styles.metaChipIcon}>⏱️</span>
                <span>{duration}</span>
              </span>
            )}

            {formattedDate && (
              <span className={`${styles.metaChip} ${styles.metaChipDate}`} title={`Uploaded on ${formattedDate}`}>
                <span className={styles.metaChipIcon}>📅</span>
                <span>Uploaded {formattedDate}</span>
              </span>
            )}

            {channelTitle && (
              <span className={`${styles.metaChip} ${styles.metaChipChannel}`} title={`Creator: ${channelTitle}`}>
                <span className={styles.metaChipIcon}>👤</span>
                <span>{channelTitle}</span>
              </span>
            )}

            {formattedViews && (
              <span className={`${styles.metaChip} ${styles.metaChipViews}`} title="YouTube Views">
                <span className={styles.metaChipIcon}>👁️</span>
                <span>{formattedViews} views</span>
              </span>
            )}

            {loadingDetails && !formattedDate && (
              <span className={`${styles.metaChip} ${styles.metaChipLoading}`}>
                <span className={styles.metaChipSpinner}>⏳</span>
                <span>Loading video info...</span>
              </span>
            )}

            {/* External YouTube Watch Link */}
            <a 
              href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
              target="_blank" 
              rel="noopener noreferrer"
              className={`${styles.metaChip} ${styles.metaChipYoutube}`}
              title="Watch on YouTube"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>

            {/* Description toggle if video has description */}
            {videoDescription && videoDescription.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setShowDescription(prev => !prev)}
                className={`${styles.metaChip} ${styles.metaChipToggle} ${showDescription ? styles.activeToggle : ''}`}
                title="Toggle video overview and description"
              >
                <span>📖 {showDescription ? 'Hide Overview' : 'Video Overview'}</span>
                <span className={`${styles.accordionArrow} ${showDescription ? styles.arrowUp : ''}`}>▾</span>
              </button>
            )}
          </div>
        </div>

        {/* Actions & Navigation Toolbar */}
        <div className={styles.videoHeaderActions}>
          {/* Main Action Row: Prev, Complete, Next */}
          <div className={styles.actionControlsRow}>
            {onPrevVideo && (
              <button
                type="button"
                onClick={onPrevVideo}
                disabled={!hasPrev}
                className={styles.lessonNavBtn}
                title="Previous video lesson (Shift + P)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
                <span>Prev</span>
              </button>
            )}

            {isOwner ? (
              <button
                onClick={(e) => handleToggleWatched(e, activeVideo._id)}
                className={`${styles.toggleCompleteBtn} ${activeVideo.completed ? styles.completed : ''}`}
                title="Mark video as completed (M)"
              >
                {activeVideo.completed ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className={`${styles.toggleCompleteBtn} ${styles.enrollCtaBtn}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                </svg>
                <span>Enroll to Track</span>
              </button>
            )}

            {onNextVideo && (
              <button
                type="button"
                onClick={onNextVideo}
                disabled={!hasNext}
                className={`${styles.lessonNavBtn} ${hasNext ? styles.lessonNavBtnPrimary : ''}`}
                title="Next video lesson (Shift + N)"
              >
                <span>Next</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Secondary Controls: Autoplay switch & Focus Mode */}
          <div className={styles.actionControlsRow}>
            {onToggleAutoplay && (
              <label 
                className={styles.autoplaySwitchLabel} 
                title="Automatically advance to the next lesson when video ends"
                onClick={(e) => {
                  e.preventDefault()
                  onToggleAutoplay()
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Autoplay</span>
                <div className={`${styles.switchTrack} ${autoplayEnabled ? styles.switchTrackActive : ''}`}>
                  <div className={styles.switchThumb} />
                </div>
              </label>
            )}

            {onToggleTheatre && (
              <button
                type="button"
                onClick={onToggleTheatre}
                className={`${styles.iconControlBtn} ${theatreMode ? styles.activeControl : ''}`}
                title="Toggle Focus / Theatre Mode (F)"
              >
                {theatreMode ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M15 3v18" />
                    </svg>
                    <span>Standard</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                    <span>Focus Mode</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Autoplay Next Countdown Banner */}
      {countdownState?.active && (
        <div className={styles.autoplayCountdownBanner}>
          <div className={styles.autoplayCountdownInfo}>
            <span className={styles.countdownSpinner}>{countdownState.secondsLeft}</span>
            <div>
              <span>Next lesson starting in <strong>{countdownState.secondsLeft}s</strong>:</span>
              <div className={styles.countdownNextTitle}>{countdownState.nextTitle}</div>
            </div>
          </div>
          <div className={styles.autoplayActions}>
            <button 
              type="button" 
              onClick={onCancelCountdown} 
              className={styles.cancelCountdownBtn}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={onConfirmPlayNext} 
              className={styles.playNextNowBtn}
            >
              Play Now ⏭
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Video Description / Overview Drawer */}
      {showDescription && videoDescription && (
        <div className={styles.videoDescDrawer}>
          <div className={styles.videoDescHeader}>
            <h5>Video Overview & Description</h5>
            <button 
              type="button" 
              className={styles.closeDescBtn}
              onClick={() => setShowDescription(false)}
            >
              ✕
            </button>
          </div>
          <div className={styles.videoDescContent}>
            {renderFormattedDescription(videoDescription, handleSeek, styles)}
          </div>
        </div>
      )}
    </>
  )
}

export default PlayerVideoSection
