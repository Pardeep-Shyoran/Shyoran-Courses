import React from 'react'
import { Link } from 'react-router-dom'
import styles from '../Dashboard.module.css'

const DashboardOverview = ({ user, courses, streak, resumeTarget, setActiveTab, handleLogout }) => {
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
                <button onClick={() => setActiveTab('add-course')} className={styles.createCourseBtn}>
                  Create a Course
                </button>
              </div>
            </section>
          )}

          <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Course Progress</h2>
              <button onClick={() => setActiveTab('courses')} className={styles.viewAllLink}>
                View All Courses →
              </button>
            </div>
            
            {courses.length === 0 ? (
              <div className={styles.emptyCourses}>
                <p>You haven't enrolled in any courses yet.</p>
                <button onClick={() => setActiveTab('add-course')} className={styles.createCourseBtn}>
                  Add Your First Course
                </button>
              </div>
            ) : (
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
            )}
          </section>
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
