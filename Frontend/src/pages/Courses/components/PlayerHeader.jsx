import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from '../CoursePlayer.module.css'

const PlayerHeader = ({ 
  course, 
  isOwner, 
  handleEnroll, 
  completedCount = 0, 
  totalCount = 0, 
  completionPercentage = 0 
}) => {
  const navigate = useNavigate()
  if (!course) return null

  const isFullyCompleted = totalCount > 0 && completedCount === totalCount

  return (
    <div className={styles.playerHeaderWrapper}>
      {/* Top Navigation & Breadcrumb Row */}
      <div className={styles.playerNavRow}>
        <button 
          onClick={() => navigate('/courses')} 
          className={styles.backBtn}
          title="Return to My Courses Library"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Courses</span>
        </button>

        <nav className={styles.playerBreadcrumbs} aria-label="Course breadcrumb">
          <Link to="/courses" className={styles.playerBreadcrumbLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>My Courses</span>
          </Link>
          <svg className={styles.playerBreadcrumbSep} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className={styles.playerBreadcrumbCurrent}>{course.title}</span>
        </nav>
      </div>

      {/* Course Context & Progress Bar Header */}
      <div className={styles.playerContextBar}>
        <div className={styles.playerContextInfo}>
          <h1 className={styles.playerCourseTitle}>{course.title}</h1>
          <div className={styles.playerBadges}>
            {course.category && (
              <span className={styles.categoryTag}>{course.category}</span>
            )}
            {isFullyCompleted && (
              <span className={styles.completedCertBadge}>
                🏆 Certificate Earned
              </span>
            )}
          </div>
        </div>

        {/* Real-Time Progress Tracker */}
        <div className={styles.playerProgressBox}>
          <div className={styles.progressLabelRow}>
            <span className={styles.progressStatsText}>
              <strong>{completedCount}</strong> of <strong>{totalCount}</strong> Lessons Completed
            </span>
            <span className={styles.progressPercentNum}>{completionPercentage}%</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Preview Mode Notification Banner */}
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
    </div>
  )
}

export default PlayerHeader
