import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QuickImportGrid from '../../../components/QuickImportGrid/QuickImportGrid'
import DashboardResumeBanner from './DashboardResumeBanner'
import styles from '../Dashboard.module.css'

const DashboardOverview = ({ user, courses, streak, resumeTarget, handleLogout }) => {
  const navigate = useNavigate()
  if (!user) return null

  // Calculate statistics
  const totalCourses = courses.length
  let totalVideos = 0
  let completedVideosCount = 0
  let completedCoursesCount = 0

  courses.forEach(course => {
    const courseVideos = course.videos || []
    totalVideos += courseVideos.length
    
    const completedInCourse = courseVideos.filter(v => v.completed).length
    completedVideosCount += completedInCourse

    if (courseVideos.length > 0 && completedInCourse === courseVideos.length) {
      completedCoursesCount++
    }
  })

  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  const handleQuickImportSelect = (url) => {
    if (url) {
      navigate(`/courses?tab=add&playlistUrl=${encodeURIComponent(url)}`)
    } else {
      navigate('/courses?tab=add')
    }
  }

  // Milestone calculation for 365-Day Year Streak System
  const streakMilestones = [
    { day: 3, name: "Spark of Passion", icon: "🔥" },
    { day: 7, name: "Week Warrior", icon: "⚡" },
    { day: 14, name: "Fortnight Focus", icon: "🌟" },
    { day: 30, name: "Monthly Master", icon: "🏆" },
    { day: 50, name: "50-Day Sentinel", icon: "🛡️" },
    { day: 100, name: "Centurion Scholar", icon: "💯" },
    { day: 150, name: "150-Day Titan", icon: "⚔️" },
    { day: 200, name: "Bicentennial Vanguard", icon: "🔱" },
    { day: 250, name: "Quarter-K Conqueror", icon: "👑" },
    { day: 300, name: "300-Day Paragon", icon: "💎" },
    { day: 350, name: "Apex Scholar", icon: "🔮" },
    { day: 365, name: "Year-Long Legend", icon: "🌌" },
  ]

  const nextMilestone = streakMilestones.find(m => m.day > streak) || streakMilestones[streakMilestones.length - 1]
  const daysRemaining = Math.max(0, nextMilestone.day - streak)
  const milestonePct = Math.min(100, Math.round((streak / nextMilestone.day) * 100))

  return (
    <div className={styles.tabPane}>
      {/* Highlighted Last Played / Continue Learning Hero Banner */}
      <DashboardResumeBanner courses={courses} />

      {/* 4 Telemetry Metric Cards */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <div className={styles.cardTopBeam}></div>
            <div className={styles.statsCardHeader}>
              <span className={styles.statLabel}>Enrolled Tracks</span>
              <div className={styles.statIconWrapper}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
            </div>
            <h3 className={styles.statValue}>{totalCourses}</h3>
            <span className={styles.statFooterText}>Personal library catalog</span>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.cardTopBeam}></div>
            <div className={styles.statsCardHeader}>
              <span className={styles.statLabel}>Completed Courses</span>
              <div className={styles.statIconWrapper} style={{ color: '#10b981' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            <h3 className={styles.statValue}>{completedCoursesCount}</h3>
            <span className={styles.statFooterText}>
              {totalCourses > 0 ? `${Math.round((completedCoursesCount / totalCourses) * 100)}% completion rate` : 'Start your first track'}
            </span>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.cardTopBeam}></div>
            <div className={styles.statsCardHeader}>
              <span className={styles.statLabel}>Videos Watched</span>
              <div className={styles.statIconWrapper} style={{ color: '#f59e0b' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
            </div>
            <h3 className={styles.statValue}>
              {completedVideosCount} <span className={styles.statValueSub}>/ {totalVideos}</span>
            </h3>
            <span className={styles.statFooterText}>Finished study lessons</span>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.cardTopBeam}></div>
            <div className={styles.statsCardHeader}>
              <span className={styles.statLabel}>Study Streak</span>
              <div className={styles.statIconWrapper} style={{ color: 'var(--primary-color)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                </svg>
              </div>
            </div>
            <h3 className={styles.statValue}>
              {streak} <span className={styles.statValueSub}>{streak === 1 ? 'day' : 'days'}</span>
            </h3>
            <span className={styles.statFooterText}>IST midnight cycle active</span>
          </div>
        </div>
      </section>

      {/* 365-Day Next Milestone Target Card */}
      <section className={styles.milestoneOverviewCard}>
        <div className={styles.milestoneOverviewHeader}>
          <div className={styles.milestoneBadgeRow}>
            <div className={styles.milestoneOverviewIcon}>{nextMilestone.icon}</div>
            <div className={styles.milestoneOverviewText}>
              <span className={styles.milestoneSubBadge}>ANNUAL BADGE ROADMAP ({nextMilestone.day} DAYS)</span>
              <h4 className={styles.milestoneName}>{nextMilestone.name}</h4>
            </div>
          </div>
          <Link to="/dashboard?tab=rewards" className={styles.viewBadgesBtn}>
            <span>View Badges Roadmap</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        <div className={styles.milestoneOverviewProgress}>
          <div className={styles.milestoneProgressInfo}>
            <span>Streak Progress: <strong>{streak} / {nextMilestone.day} Days</strong> ({milestonePct}%)</span>
            <span className={styles.remainingBadge}>
              {daysRemaining === 0 ? '✨ Milestone Achieved!' : `🔥 ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`}
            </span>
          </div>
          <div className={styles.milestoneProgressBarBg}>
            <div className={styles.milestoneProgressBarFill} style={{ width: `${milestonePct}%` }}></div>
          </div>
        </div>
      </section>

      {/* Guided Onboarding Banner for New Users */}
      {courses.length === 0 && (
        <section className={styles.onboardingBanner}>
          <div className={styles.onboardingHeader}>
            <div className={styles.headerBadge} style={{ marginBottom: '0.6rem' }}>
              ✦ QUICK START ONBOARDING
            </div>
            <h2 className={styles.onboardingTitle}>Welcome to your Workspace, {user.name.split(' ')[0]}!</h2>
            <p className={styles.onboardingSubtitle}>
              Transform unstructured video playlists into distraction-free tracks with timestamped notes and verifiable certificates in 3 simple steps:
            </p>
          </div>

          <div className={styles.onboardingSteps}>
            <div className={styles.onboardingStepCard}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepIcon}>⚡</div>
              <h4>Pick or Import Playlist</h4>
              <p>Choose a 1-click curated preset below or paste any public YouTube playlist URL.</p>
            </div>

            <div className={styles.onboardingStepCard}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepIcon}>🎯</div>
              <h4>Track Lessons & Notes</h4>
              <p>Watch embedded videos with auto-synced timestamps and distraction-free note taking.</p>
            </div>

            <div className={styles.onboardingStepCard}>
              <div className={styles.stepNum}>3</div>
              <div className={styles.stepIcon}>🏆</div>
              <h4>Build Consistency</h4>
              <p>Maintain daily study streaks, unlock achievement badges, and generate verifiable PDFs.</p>
            </div>
          </div>
        </section>
      )}

      <div className={styles.dashboardSplit}>
        {/* Left Column */}
        <div className={styles.dashboardLeft}>
          {courses.length === 0 ? (
            <>
              <section className={styles.resumeSection}>
                <h2 className={styles.sectionTitle}>Ready to Study</h2>
                <div className={styles.emptyCourses}>
                  <div className={styles.emptyIcon}>📚</div>
                  <h3>No active courses yet</h3>
                  <p>Import a playlist or starter track to begin tracking lessons, timestamps, and study streaks.</p>
                  <Link to="/courses?tab=add" className={styles.createCourseBtn}>
                    <span>⚡ Quick Import a Course</span>
                  </Link>
                </div>
              </section>
              <section className={styles.quickImportOverviewSection}>
                <QuickImportGrid onSelectPreset={handleQuickImportSelect} title="Start Instantly with a Quick Track" />
              </section>
            </>
          ) : (
            <section className={styles.recentSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recent Course Progress</h2>
                <Link to="/courses?tab=library" className={styles.viewAllLink}>
                  View All Courses →
                </Link>
              </div>
              
              <div className={styles.progressList}>
                {courses.slice(0, 3).map(course => {
                  const completed = course.videos.filter(v => v.completed).length
                  const total = course.videos.length
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
                  return (
                    <div key={course._id} className={styles.progressCard}>
                      <div className={styles.progressInfo}>
                        <div>
                          <h4>{course.title}</h4>
                          <span className={styles.progressRatio}>{completed} / {total} videos completed</span>
                        </div>
                        <span className={styles.progressPercentage}>{pct}%</span>
                      </div>
                      <div className={styles.progressBarWrapper}>
                        <div 
                          className={styles.progressBar} 
                          style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : 'var(--primary-color)' }}
                        ></div>
                      </div>
                      <div className={styles.progressActions}>
                        <Link to={`/courses/${course._id}`} className={styles.studyBtn}>
                          Study Course
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className={styles.dashboardRight}>
          <section className={styles.profileSummaryCard}>
            <h2 className={styles.sectionTitle}>Your Profile</h2>
            <div className={styles.profileSummaryHeader}>
              <div
                className={styles.profileSummaryAvatar}
                style={{
                  backgroundColor: user.avatarColor ? `${user.avatarColor}22` : undefined,
                  borderColor: user.avatarColor ? `${user.avatarColor}66` : undefined,
                  color: user.avatarColor || undefined,
                }}
              >
                {initials}
              </div>
              <div className={styles.profileSummaryInfo}>
                <h4>{user.name}</h4>
                <p>{user.email}</p>
              </div>
            </div>

            <div className={styles.profileInfoGrid}>
              <div className={styles.profileInfoCard}>
                <div className={styles.infoIcon}>🛡️</div>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>Role Type</span>
                  <p>{user.role ? user.role.toUpperCase() : 'STUDENT'}</p>
                </div>
              </div>

              <div className={styles.profileInfoCard}>
                <div className={styles.infoIcon}>🎯</div>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>Daily Target</span>
                  <p>{user.dailyGoal || 30} mins/day</p>
                </div>
              </div>

              <div className={styles.profileInfoCard}>
                <div className={styles.infoIcon}>📅</div>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>Member Since</span>
                  <p>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
            
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              🚪 Logout from Account
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
