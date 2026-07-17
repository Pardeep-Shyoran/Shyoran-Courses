import React from 'react'
import { Link } from 'react-router-dom'
import styles from '../CoursePlayer.module.css'

const PlayerHeader = ({ course, isOwner, handleEnroll }) => {
  if (!course) return null

  return (
    <>
      {/* Top Breadcrumbs navigation */}
      <div className={styles.breadcrumb}>
        <Link to="/dashboard?tab=courses">📚 My Courses</Link>
        <span className={styles.separator}>/</span>
        <span className={styles.current}>{course.title}</span>
      </div>

      {/* Preview mode notification banner */}
      {!isOwner && (
        <div className={styles.enrollBanner}>
          <div className={styles.enrollBannerContent}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.bannerIcon}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>
              <strong>Preview Mode:</strong> You are viewing a public course blueprint. Enroll now to save notes, track progress, and add it to your library.
            </span>
          </div>
          <button onClick={handleEnroll} className={styles.enrollBannerBtn}>
            Enroll in Course
          </button>
        </div>
      )}
    </>
  )
}

export default PlayerHeader
