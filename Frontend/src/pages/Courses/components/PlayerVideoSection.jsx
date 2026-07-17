import React from 'react'
import styles from '../CoursePlayer.module.css'

const PlayerVideoSection = ({ activeVideo, isOwner, handleToggleWatched, handleEnroll }) => {
  if (!activeVideo) return null

  return (
    <>
      {/* Iframe Video Player */}
      <div className={styles.playerWrapper}>
        <iframe
          src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?enablejsapi=1&rel=0`}
          title={activeVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={styles.playerFrame}
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
