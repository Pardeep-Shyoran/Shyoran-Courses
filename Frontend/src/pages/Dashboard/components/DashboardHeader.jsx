import React from 'react'
import { Link } from 'react-router-dom'
import styles from '../Dashboard.module.css'

const DashboardHeader = ({ user }) => {
  if (!user) return null

  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  const firstName = user.name ? user.name.split(' ')[0] : 'Learner'

  return (
    <header className={styles.header}>
      <div className={styles.headerBadge}>✦ STUDENT WORKSPACE • TELEMETRY & INSIGHTS</div>

      <div className={styles.headerContentWrapper}>
        <div className={styles.userGreeting}>
          <div
            className={styles.avatar}
            style={{
              backgroundColor: user.avatarColor ? `${user.avatarColor}22` : undefined,
              borderColor: user.avatarColor ? `${user.avatarColor}66` : undefined,
              color: user.avatarColor || undefined,
              boxShadow: user.avatarColor ? `0 4px 14px ${user.avatarColor}33` : undefined,
            }}
          >
            <span>{initials}</span>
            <div
              className={styles.avatarRing}
              style={{ borderColor: user.avatarColor ? `${user.avatarColor}88` : undefined }}
            ></div>
          </div>
          <div>
            <h1 className={styles.greetingTitle}>
              Welcome back, <span className={styles.gradientText}>{firstName}</span>
            </h1>
            <p className={styles.greetingSubtitle}>
              Track your studies, manage courses, and master new skills.
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Link to="/courses?tab=add" className={styles.addCourseBtn}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Course</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
