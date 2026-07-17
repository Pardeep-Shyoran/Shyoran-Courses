import React from 'react'
import styles from '../CoursePlayer.module.css'

const PlayerAboutTab = ({ course }) => {
  if (!course) return null

  return (
    <div className={styles.aboutContainer}>
      <h3 className={styles.aboutTitle}>{course.title}</h3>
      <p className={styles.aboutDesc}>{course.description || 'No description available.'}</p>
      
      {course.tags && course.tags.length > 0 && (
        <div className={styles.tagsContainer}>
          <h4>Tags:</h4>
          <div className={styles.tagsList}>
            {course.tags.map((tag, idx) => (
              <span key={idx} className={styles.tagBadge}>#{tag}</span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.playlistMetaDetails}>
        <p>🔗 <strong>Playlist ID:</strong> {course.playlistId || 'Manual Course'}</p>
        <p>📅 <strong>Enrolled:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}

export default PlayerAboutTab
