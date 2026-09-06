import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from '../CoursePlayer.module.css'

const PlayerHeader = ({ 
  course, 
  isOwner, 
  handleEnroll, 
  completedCount = 0, 
  totalCount = 0, 
  completionPercentage = 0,
  totalDurationFormatted = '',
  remainingDurationFormatted = '',
  onOpenShortcuts
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Library</span>
        </button>

        <nav className={styles.playerBreadcrumbs} aria-label="Course breadcrumb">
          <Link to="/courses" className={styles.playerBreadcrumbLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>Courses</span>
          </Link>
          <svg className={styles.playerBreadcrumbSep} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className={styles.playerBreadcrumbCurrent}>{course.title}</span>
        </nav>

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className={styles.shortcutBtn}
            title="View keyboard shortcuts (?)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
              <line x1="6" y1="8" x2="6" y2="8" />
              <line x1="10" y1="8" x2="10" y2="8" />
              <line x1="14" y1="8" x2="14" y2="8" />
              <line x1="18" y1="8" x2="18" y2="8" />
              <line x1="6" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="18" y2="12" />
              <line x1="7" y1="16" x2="17" y2="16" />
            </svg>
            <span>Shortcuts</span>
            <kbd className={styles.shortcutKbd}>?</kbd>
          </button>
        )}
      </div>

      {/* Course Context & Progress Bar Header */}
      <div className={styles.playerContextBar}>
        <div className={styles.playerContextInfo}>
          <div className={styles.playerTitleRow}>
            <h1 className={styles.playerCourseTitle}>{course.title}</h1>
          </div>
          
          <div className={styles.playerBadges}>
            {course.category && (
              <span className={styles.categoryTag}>{course.category}</span>
            )}
            {totalDurationFormatted && (
              <span className={styles.courseDurationPill} title="Total curriculum duration">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{totalDurationFormatted} total</span>
              </span>
            )}
            {isFullyCompleted && (
              <span className={styles.completedCertBadge}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
                <span>Certificate Earned</span>
              </span>
            )}
          </div>
        </div>

        {/* Real-Time Progress Tracker */}
        <div className={styles.playerProgressBox}>
          <div className={styles.progressLabelRow}>
            <span className={styles.progressStatsText}>
              <strong>{completedCount}</strong> of <strong>{totalCount}</strong> Lessons
              {remainingDurationFormatted && remainingDurationFormatted !== '0m' && (
                <span className={styles.progressTimeLeft}> • {remainingDurationFormatted} left</span>
              )}
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
              <strong>Preview Mode:</strong> You are viewing a public curriculum. Enroll to sync progress, auto-save AI notes, and unlock your certificate.
            </span>
          </div>
          <button onClick={handleEnroll} className={styles.enrollBannerBtn}>
            <span>Enroll in Course</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default PlayerHeader

