import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QuickImportGrid from '../../../components/QuickImportGrid/QuickImportGrid'
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
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const handleQuickImportSelect = (url) => {
    navigate('/courses?tab=add')
  }

  return (
    <div className={styles.tabPane}>
      {/* Stats Grid */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <span className={styles.statLabel}>Enrolled Courses</span>
            <h3 className={styles.statValue}>{totalCourses}</h3>
          </div>

          <div className={styles.statsCard}>
            <span className={styles.statLabel}>Completed Courses</span>
            <h3 className={styles.statValue}>{completedCoursesCount}</h3>
          </div>

          <div className={styles.statsCard}>
            <span className={styles.statLabel}>Videos Watched</span>
            <h3 className={styles.statValue}>{completedVideosCount} / {totalVideos}</h3>
          </div>

          <div className={styles.statsCard}>
            <span className={styles.statLabel}>Study Streak</span>
            <h3 className={styles.statValue}>{streak} {streak === 1 ? 'day' : 'days'}</h3>
          </div>
        </div>
      </section>

      {/* Guided Onboarding Banner for New Users */}
      {courses.length === 0 && (
        <section className={styles.onboardingBanner}>
          <div className={styles.onboardingHeader}>
            <div className={styles.onboardingBadge}>🚀 QUICK START GUIDE</div>
            <h2>Welcome to Shyoran Courses, {user.name.split(' ')[0]}!</h2>
            <p>Get started in 3 simple steps to transform video playlists into your personalized learning tracks.</p>
          </div>

          <div className={styles.onboardingSteps}>
            <div className={styles.onboardingStepCard}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepIcon}>⚡</div>
              <h4>Pick or Paste Playlist</h4>
              <p>Choose a 1-click preset track below or paste any public YouTube playlist URL.</p>
            </div>

            <div className={styles.onboardingStepCard}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepIcon}>🎯</div>
              <h4>Track Lessons & Notes</h4>
              <p>Watch embedded videos with auto-synced timestamps and interactive note-taking.</p>
            </div>

            <div className={styles.onboardingStepCard}>
              <div className={styles.stepNum}>3</div>
              <div className={styles.stepIcon}>🏆</div>
              <h4>Build Consistency</h4>
              <p>Maintain daily study streaks, unlock achievement badges, and earn rewards.</p>
            </div>
          </div>
        </section>
      )}

      <div className={styles.dashboardSplit}>
        {/* Left Column */}
        <div className={styles.dashboardLeft}>
          {resumeTarget ? (
            <section className={styles.resumeSection}>
              <h2 className={styles.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Resume Learning
              </h2>
              <div className={styles.resumeCard}>
                <div className={styles.resumeThumbnail}>
                  <img 
                    src={resumeTarget.course.thumbnail || `https://img.youtube.com/vi/${resumeTarget.video.youtubeId}/hqdefault.jpg`} 
                    alt={resumeTarget.course.title} 
                  />
                  <span className={styles.resumeBadge}>In Progress</span>
                </div>
                <div className={styles.resumeDetails}>
                  <span className={styles.courseSubtitle}>{resumeTarget.course.title}</span>
                  <h3>{resumeTarget.video.title}</h3>
                  <p>Continue where you left off and complete your learning milestones.</p>
                  <Link 
                    to={`/courses/${resumeTarget.course._id}?videoId=${resumeTarget.video._id}`}
                    className={styles.resumeBtn}
                  >
                    ▶ Resume Video
                  </Link>
                </div>
              </div>
            </section>
          ) : (
            <section className={styles.resumeSection}>
              <h2 className={styles.sectionTitle}>Ready to Study</h2>
              <div className={styles.emptyCourses}>
                <p>Ready to start? Import a course or custom track to begin tracking your progress!</p>
                <Link to="/courses?tab=add" className={styles.createCourseBtn}>
                  ⚡ Quick Import a Course
                </Link>
              </div>
            </section>
          )}

          {courses.length === 0 ? (
            <section className={styles.quickImportOverviewSection}>
              <QuickImportGrid onSelectPreset={handleQuickImportSelect} title="Start Instantly with a Quick Track" />
            </section>
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
                          style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--primary-color)' }}
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
              <div className={styles.profileSummaryAvatar}>{initials}</div>
              <div className={styles.profileSummaryInfo}>
                <h4>{user.name}</h4>
                <p>{user.email}</p>
              </div>
            </div>

            <div className={styles.profileInfoGrid}>
              <div className={styles.profileInfoCard}>
                <div className={styles.infoIcon}>🛡️</div>
                <div className={styles.infoContent}>
                  <h4>Role Type</h4>
                  <p>{user.role.toUpperCase()}</p>
                </div>
              </div>

              <div className={styles.profileInfoCard}>
                <div className={styles.infoIcon}>📅</div>
                <div className={styles.infoContent}>
                  <h4>Member Since</h4>
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
            
            <button className={styles.logoutBtn} onClick={handleLogout}>
              🚪 Logout from Account
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview

