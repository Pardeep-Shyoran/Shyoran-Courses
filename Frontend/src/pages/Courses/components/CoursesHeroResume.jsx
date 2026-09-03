import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { calculateCourseDurations } from '../../../utils/duration'
import styles from '../Courses.module.css'

const CoursesHeroResume = ({ libraryCourses = [] }) => {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('dismiss_hero_resume') === 'true'
  })

  const targetData = useMemo(() => {
    if (!libraryCourses || libraryCourses.length === 0) return null

    // 1. Check lastPlayed in localStorage
    const lastPlayedJson = localStorage.getItem('lastPlayed')
    if (lastPlayedJson) {
      try {
        const { courseId, videoId } = JSON.parse(lastPlayedJson)
        const matchedCourse = libraryCourses.find(c => c._id === courseId)
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
        console.error("Error reading lastPlayed for hero resume", e)
      }
    }

    // 2. Fallback: Find first in-progress course
    const inProgressCourse = libraryCourses.find(c => {
      const vids = c.videos || []
      const done = vids.filter(v => v.completed).length
      return done > 0 && done < vids.length
    })

    if (inProgressCourse && inProgressCourse.videos && inProgressCourse.videos.length > 0) {
      // Find first uncompleted video
      const nextUncompletedIdx = inProgressCourse.videos.findIndex(v => !v.completed)
      const activeIdx = nextUncompletedIdx >= 0 ? nextUncompletedIdx : 0
      return {
        course: inProgressCourse,
        video: inProgressCourse.videos[activeIdx],
        videoIndex: activeIdx
      }
    }

    // 3. Fallback: First course with videos
    const firstCourse = libraryCourses.find(c => c.videos && c.videos.length > 0)
    if (firstCourse) {
      return {
        course: firstCourse,
        video: firstCourse.videos[0],
        videoIndex: 0
      }
    }

    return null
  }, [libraryCourses])

  if (dismissed || !targetData) return null

  const { course, video, videoIndex } = targetData
  const totalCount = course.videos ? course.videos.length : 0
  const completedCount = course.videos ? course.videos.filter(v => v.completed).length : 0
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const durations = calculateCourseDurations(course.videos || [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('dismiss_hero_resume', 'true')
  }

  const resumeUrl = `/courses/${course._id}?videoId=${video._id}`

  return (
    <div className={styles.heroResumeBanner}>
      <div className={styles.heroResumeMain}>
        {/* Left Thumbnail with Play overlay */}
        <Link to={resumeUrl} className={styles.heroResumeThumbWrap} title={`Resume ${course.title}`}>
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className={styles.heroResumeThumb} />
          ) : (
            <div className={styles.heroResumeThumbPlaceholder}>
              <span>📚</span>
            </div>
          )}
          <div className={styles.heroResumePlayOverlay}>
            <div className={styles.heroPlayIcon}>▶</div>
          </div>
        </Link>

        {/* Middle Info & Progress details */}
        <div className={styles.heroResumeInfo}>
          <div className={styles.heroResumeBadgeRow}>
            <span className={styles.heroResumeBadge}>⚡ CONTINUE LEARNING</span>
            {course.category && (
              <span className={styles.heroCategoryBadge}>{course.category}</span>
            )}
          </div>

          <h3 className={styles.heroResumeTitle}>
            <Link to={resumeUrl}>{course.title}</Link>
          </h3>

          <div className={styles.heroResumeLesson}>
            <span className={styles.heroLessonIndex}>Lesson {videoIndex + 1} of {totalCount}:</span>
            <span className={styles.heroLessonTitle}>"{video.title || 'Next Lesson'}"</span>
            {video.duration && (
              <span className={styles.heroLessonDuration}>({video.duration})</span>
            )}
          </div>

          <div className={styles.heroResumeProgressRow}>
            <div className={styles.heroProgressBarTrack}>
              <div 
                className={styles.heroProgressBarFill} 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className={styles.heroProgressStats}>
              <strong>{completionPercentage}%</strong> complete
              {durations.remainingFormatted && durations.remainingFormatted !== '0m' && (
                <span> • {durations.remainingFormatted} left</span>
              )}
            </span>
          </div>
        </div>

        {/* Right Actions: Resume CTA & Dismiss */}
        <div className={styles.heroResumeActions}>
          <Link to={resumeUrl} className={styles.heroResumeBtn}>
            <span>Resume Lesson</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </Link>
          <button 
            type="button" 
            onClick={handleDismiss} 
            className={styles.heroDismissBtn}
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

export default CoursesHeroResume
