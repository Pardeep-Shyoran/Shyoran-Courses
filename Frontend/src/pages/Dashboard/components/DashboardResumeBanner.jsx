import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { calculateCourseDurations } from '../../../utils/duration'
import styles from './DashboardResumeBanner.module.css'

const DashboardResumeBanner = ({ courses = [] }) => {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('dismiss_dashboard_resume') === 'true'
  })

  const targetData = useMemo(() => {
    if (!courses || courses.length === 0) return null

    // 1. Check lastPlayed in localStorage
    const lastPlayedJson = localStorage.getItem('lastPlayed')
    if (lastPlayedJson) {
      try {
        const { courseId, videoId } = JSON.parse(lastPlayedJson)
        const matchedCourse = courses.find(c => c._id === courseId)
        if (matchedCourse && matchedCourse.videos && matchedCourse.videos.length > 0) {
          const matchedVideo = matchedCourse.videos.find(v => v._id === videoId) || matchedCourse.videos[0]
          const videoIndex = matchedCourse.videos.findIndex(v => v._id === matchedVideo._id)
          return {
            course: matchedCourse,
            video: matchedVideo,
            videoIndex: videoIndex >= 0 ? videoIndex : 0
          }
        }
      } catch (e) {
        console.error("Error reading lastPlayed for dashboard resume banner", e)
      }
    }

    // 2. Fallback: Find first in-progress course
    const inProgressCourse = courses.find(c => {
      const vids = c.videos || []
      const done = vids.filter(v => v.completed).length
      return done > 0 && done < vids.length
    })

    if (inProgressCourse && inProgressCourse.videos && inProgressCourse.videos.length > 0) {
      const nextUncompletedIdx = inProgressCourse.videos.findIndex(v => !v.completed)
      const activeIdx = nextUncompletedIdx >= 0 ? nextUncompletedIdx : 0
      return {
        course: inProgressCourse,
        video: inProgressCourse.videos[activeIdx],
        videoIndex: activeIdx
      }
    }

    // 3. Fallback: First course with videos
    const firstCourse = courses.find(c => c.videos && c.videos.length > 0)
    if (firstCourse) {
      return {
        course: firstCourse,
        video: firstCourse.videos[0],
        videoIndex: 0
      }
    }

    return null
  }, [courses])

  if (dismissed || !targetData) return null

  const { course, video, videoIndex } = targetData
  const totalCount = course.videos ? course.videos.length : 0
  const completedCount = course.videos ? course.videos.filter(v => v.completed).length : 0
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const durations = calculateCourseDurations(course.videos || [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('dismiss_dashboard_resume', 'true')
  }

  const resumeUrl = `/courses/${course._id}?videoId=${video._id}`

  return (
    <div className={styles.resumeHeroBanner}>
      <div className={styles.resumeTopBeam}></div>
      <div className={styles.resumeMain}>
        {/* Left Thumbnail with Play overlay */}
        <Link to={resumeUrl} className={styles.resumeThumbWrap} title={`Resume ${course.title}`}>
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className={styles.resumeThumb} />
          ) : (
            <div className={styles.resumeThumbPlaceholder}>
              <span>📚</span>
            </div>
          )}
          <div className={styles.resumePlayOverlay}>
            <div className={styles.playIcon}>▶</div>
          </div>
        </Link>

        {/* Middle Info & Progress details */}
        <div className={styles.resumeInfo}>
          <div className={styles.resumeBadgeRow}>
            <span className={styles.resumeBadge}>⚡ CONTINUE LEARNING</span>
            {course.category && (
              <span className={styles.categoryBadge}>{course.category}</span>
            )}
          </div>

          <h3 className={styles.resumeTitle}>
            <Link to={resumeUrl}>{course.title}</Link>
          </h3>

          <div className={styles.resumeLesson}>
            <span className={styles.lessonIndex}>Lesson {videoIndex + 1} of {totalCount}:</span>
            <span className={styles.lessonTitle}>"{video.title || 'Next Lesson'}"</span>
            {video.duration && (
              <span className={styles.lessonDuration}>({video.duration})</span>
            )}
          </div>

          <div className={styles.progressRow}>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className={styles.progressStats}>
              <strong>{completionPercentage}%</strong> complete
              {durations.remainingFormatted && durations.remainingFormatted !== '0m' && (
                <span> • {durations.remainingFormatted} left</span>
              )}
            </span>
          </div>
        </div>

        {/* Right Actions: Resume CTA & Dismiss */}
        <div className={styles.resumeActions}>
          <Link to={resumeUrl} className={styles.resumeBtn}>
            <span>Resume Lesson</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className={styles.dismissBtn}
            title="Dismiss resume banner for this session"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardResumeBanner
