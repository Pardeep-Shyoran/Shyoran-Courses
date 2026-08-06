import React, { useEffect } from 'react'
import styles from '../CoursePlayer.module.css'

const PlayerVideoSection = ({ 
  activeVideo, 
  isOwner, 
  handleToggleWatched, 
  handleEnroll, 
  iframeRef,
  playbackSpeed = 1 
}) => {
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

      {/* Video Header & Quick Actions */}
      <div className={styles.videoHeader}>
        <div>
          <h1 className={styles.videoTitle}>{activeVideo.title}</h1>
          <span className={styles.videoDurationBadge}>⏱️ Duration: {activeVideo.duration || 'N/A'}</span>
        </div>
        {isOwner ? (
          <button
            onClick={(e) => handleToggleWatched(e, activeVideo._id)}
            className={`${styles.toggleCompleteBtn} ${activeVideo.completed ? styles.completed : ''}`}
          >
            {activeVideo.completed ? '✅ Completed' : '⭕ Mark Completed'}
          </button>
        ) : (
          <button
            onClick={handleEnroll}
            className={styles.toggleCompleteBtn}
          >
            🚀 Enroll to Track Progress
          </button>
        )}
      </div>
    </>
  )
}

export default PlayerVideoSection
