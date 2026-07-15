import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPublicCourses } from '../../services/api'
import styles from './Home.module.css'

const Home = () => {
  const token = localStorage.getItem('token')
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    async function loadPublicCourses() {
      try {
        const data = await getPublicCourses()
        // Display up to 3 featured courses
        setFeaturedCourses(data.slice(0, 3))
      } catch (err) {
        console.error('Failed to load public courses:', err)
      } finally {
        setLoadingCourses(false)
      }
    }
    loadPublicCourses()
  }, [])

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Modern Vault/Archway Background SVG */}
        <div className={styles.heroMotif}>
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.motifSvg}>
            {/* Concentric circles representing learning loops */}
            <circle cx="100" cy="100" r="80" stroke="var(--primary-color)" strokeWidth="0.25" strokeDasharray="3 3" opacity="0.15" />
            <circle cx="100" cy="100" r="60" stroke="var(--warning)" strokeWidth="0.25" opacity="0.2" />
            <circle cx="100" cy="100" r="40" stroke="var(--text-tertiary)" strokeWidth="0.5" strokeDasharray="1 5" opacity="0.3" />
            
            {/* Architectural Gateway Arches (Indian Torana vaults) */}
            <path d="M60 180V100C60 77.9 77.9 60 100 60s40 17.9 40 40v80" stroke="var(--primary-color)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M75 180V100C75 86.2 86.2 75 100 75s25 11.2 25 25v80" stroke="var(--warning)" strokeWidth="1" opacity="0.5" />
            <path d="M90 180v-80c0-5.5 4.5-10 10-10s10 4.5 10 10v80" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.25" />

            {/* Horizontal beams (Torana lintels) */}
            <line x1="45" y1="70" x2="155" y2="70" stroke="var(--primary-color)" strokeWidth="1" opacity="0.2" />
            <line x1="55" y1="85" x2="145" y2="85" stroke="var(--warning)" strokeWidth="0.75" opacity="0.35" />

            {/* Structured nodes */}
            <g opacity="0.75">
              <circle cx="60" cy="110" r="4" fill="var(--bg-secondary)" stroke="var(--primary-color)" strokeWidth="1.5" />
              <line x1="64" y1="110" x2="75" y2="110" stroke="var(--primary-color)" strokeWidth="0.75" />
            </g>
            <g opacity="0.75">
              <circle cx="140" cy="130" r="4" fill="var(--bg-secondary)" stroke="var(--warning)" strokeWidth="1.5" />
              <line x1="125" y1="130" x2="136" y2="130" stroke="var(--warning)" strokeWidth="0.75" />
            </g>
            <g opacity="0.85">
              <circle cx="100" cy="75" r="5" fill="var(--primary-color)" />
              <circle cx="100" cy="75" r="8" stroke="var(--primary-color)" strokeWidth="0.5" opacity="0.4" />
            </g>

            {/* Suryodaya glow filter */}
            <circle cx="100" cy="100" r="18" fill="url(#sunriseGlowHome)" opacity="0.3" />

            <defs>
              <radialGradient id="sunriseGlowHome" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--warning)" />
                <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className={styles.badge}>🏛️ Gateway to Structured Learning</div>
        <h1 className={styles.title}>
          Turn YouTube Playlists Into <br />
          <span className={styles.gradientText}>Structured Courses</span>
        </h1>
        <p className={styles.subtitle}>
          Stop scrolling, start learning. Shyoran Courses helps you organize any educational YouTube playlist into a clean learning interface, complete with timed note-taking and daily progress streaks.
        </p>
        <div className={styles.ctaContainer}>
          {token ? (
            <Link to="/dashboard" className={styles.primaryBtn}>
              Go to Dashboard 📊
            </Link>
          ) : (
            <>
              <Link to="/register" className={styles.primaryBtn}>
                Start Learning Free
              </Link>
              <Link to="/login" className={styles.secondaryBtn}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Structured Tracks Marquee (Sarvam Logo Carousel Style) */}
      <div className={styles.marqueeSection}>
        <p className={styles.marqueeTitle}>Structured Tracks Built for Indian Learners</p>
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            <div className={styles.marqueeGroup}>
              <span>💻 React & Next.js</span>
              <span>📊 Data Structures & Algorithms</span>
              <span>🏛️ System Design</span>
              <span>📱 Mobile Development</span>
              <span>🤖 AI & Machine Learning</span>
              <span>🛡️ Cyber Security</span>
              <span>☁️ Cloud & DevOps</span>
              <span>🎨 UI/UX Design</span>
            </div>
            <div className={styles.marqueeGroup} aria-hidden="true">
              <span>💻 React & Next.js</span>
              <span>📊 Data Structures & Algorithms</span>
              <span>🏛️ System Design</span>
              <span>📱 Mobile Development</span>
              <span>🤖 AI & Machine Learning</span>
              <span>🛡️ Cyber Security</span>
              <span>☁️ Cloud & DevOps</span>
              <span>🎨 UI/UX Design</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      <section className={styles.publicCourses}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionHeaderBadge}>Explore the Catalog</span>
          <h2>Featured Mentored Courses</h2>
          <p>Explore curated learning tracks published by our expert mentors and admins.</p>
        </div>
        
        {loadingCourses ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
            Loading featured courses...
          </div>
        ) : featuredCourses.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
            No public courses published yet. Sign in to import your first custom playlist!
          </div>
        ) : (
          <div className={styles.coursesGrid}>
            {featuredCourses.map(course => {
              const firstTag = course.tags && course.tags.length > 0 ? course.tags[0] : 'Curated'
              const authorInitial = course.user?.name ? course.user.name.charAt(0).toUpperCase() : 'C'

              return (
                <div key={course._id} className={styles.courseCard}>
                  <div className={styles.courseThumb}>
                    <img src={course.thumbnail} alt={course.title} />
                    <span className={styles.tagBadge}>{firstTag}</span>
                    <span className={styles.videoCount}>🎥 {course.videos?.length || 0} Lessons</span>
                  </div>
                  <div className={styles.courseBody}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <p className={styles.courseDesc}>
                      {course.description ? (course.description.substring(0, 100) + '...') : 'No description provided.'}
                    </p>
                    
                    <div className={styles.courseMeta}>
                      <div className={styles.authorAvatar}>{authorInitial}</div>
                      <div className={styles.authorDetails}>
                        <h4>{course.user?.name}</h4>
                        <p>{course.user?.role.toUpperCase()}</p>
                      </div>
                    </div>

                    {token ? (
                      <Link to="/courses" className={styles.courseCta}>
                        Go to Workspace <span className={styles.ctaArrow}>→</span>
                      </Link>
                    ) : (
                      <Link to="/login" className={styles.courseCta}>
                        Login to Enroll <span className={styles.ctaArrow}>→</span>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Why Study With Us?</h2>
          <p>We provide all the tools you need to stay focused, organized, and motivated.</p>
        </div>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📺</span>
            <h3>Playlist Import</h3>
            <p>Simply paste any YouTube playlist URL. We fetch video names, durations, and thumbnails, setting up a curriculum in seconds.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📝</span>
            <h3>Interactive Notes</h3>
            <p>Write timestamped markdown notes. Jump back to specific video markers with a single click to review complex concepts.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔥</span>
            <h3>Streak & Stats</h3>
            <p>Track your study consistency. Build a daily watch streak, see completion percentages, and keep tabs on your progress dashboard.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.howContainer}>
          <div className={styles.sectionHeader}>
            <h2>How It Works</h2>
            <p>Transforming YouTube into a productive classroom is simple.</p>
          </div>
          <div className={styles.howSteps}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3>Paste Link</h3>
              <p>Find your favorite tutorial playlist on YouTube and copy its web address.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3>Import & Organize</h3>
              <p>Add it to your personal course library. It instantly creates structured modules.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3>Learn & Track</h3>
              <p>Watch ad-free players, take inline markdown notes, and track your study completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Supercharge Your Learning?</h2>
          <p>Join thousands of students who are turning unstructured videos into deep knowledge today.</p>
          <div>
            {token ? (
              <Link to="/dashboard" className={styles.primaryBtn}>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className={styles.primaryBtn}>
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home