import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Home.module.css'
import AboutSection from './components/About/AboutSection'
import FeaturesSection from './components/Features/FeaturesSection'
import UseCasesSection from './components/UseCases/UseCasesSection'
import HowItWorksSection from './components/HowItWorks/HowItWorksSection'
import StartersSection from './components/Starters/StartersSection'
import FAQSection from './components/FAQ/FAQSection'
import { useAuth } from '../../context/AuthContext'

const Home = () => {
  const { token } = useAuth()
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleTrySample = () => {
    setErrorMsg('')
    setPlaylistUrl('https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-TkyM96M367ZoZoNmDX')
    setPreviewData({
      title: "React & Hooks Masterclass",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop",
      videoCount: 6,
      videos: [
        { title: "01. Introduction to React & Component Architecture", duration: "15:24" },
        { title: "02. Understanding Props, State, and Core Hook Lifecycle", duration: "24:10" },
        { title: "03. Building Dynamic User Interfaces with Lists & Keys", duration: "18:45" },
        { title: "04. Fetching Data with useEffect and Handling Loading States", duration: "22:15" },
        { title: "05. CSS Modules & Vanilla Styling Patterns in React", duration: "14:30" },
        { title: "06. React Router v7 & Multi-Page Navigation flows", duration: "28:50" }
      ]
    })
  }

  const handlePreview = () => {
    if (!playlistUrl) {
      setErrorMsg('Please enter a YouTube playlist link first.')
      return
    }
    
    if (!playlistUrl.includes('list=')) {
      setErrorMsg('Please enter a valid YouTube playlist URL containing a list= parameter.')
      return
    }

    setLoadingPreview(true)
    setErrorMsg('')
    
    setTimeout(() => {
      setPreviewData({
        title: "Web Development Bootcamp",
        thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&auto=format&fit=crop",
        videoCount: 6,
        videos: [
          { title: "01. HTML5 Semantic Elements & Page Structure Foundations", duration: "18:40" },
          { title: "02. CSS3 Flexbox & CSS Grid Comprehensive Layout Guide", duration: "25:15" },
          { title: "03. Responsive Web Design & Media Queries Best Practices", duration: "20:50" },
          { title: "04. JavaScript Variables, Scopes, and ES6 Arrow Functions", duration: "16:22" },
          { title: "05. Working with DOM APIs & Listening to User Events", duration: "22:10" },
          { title: "06. Asynchronous JS: Promises, Async/Await and API Fetching", duration: "29:45" }
        ]
      })
      setLoadingPreview(false)
    }, 1200)
  }

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

        {!token && (
          <div className={styles.demoWrapper}>
            <div className={styles.demoInputContainer}>
              <input
                type="text"
                placeholder="Paste any YouTube playlist URL (or click sample below)..."
                value={playlistUrl}
                onChange={(e) => {
                  setPlaylistUrl(e.target.value)
                  setErrorMsg('')
                }}
                className={styles.demoInput}
              />
              <button 
                onClick={handlePreview} 
                className={styles.demoBtn} 
                disabled={loadingPreview}
              >
                {loadingPreview ? 'Parsing preview...' : 'Preview Playlist 🔍'}
              </button>
            </div>
            
            <button onClick={handleTrySample} className={styles.sampleLinkBtn}>
              Or click here to try with a sample playlist link ⚡
            </button>

            {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

            {/* Course Preview Mockup Card */}
            {previewData && (
              <div className={styles.previewBox}>
                <div className={styles.previewHeader}>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.previewHeaderTitle}>PARSED CURRICULUM PREVIEW</span>
                </div>
                
                <div className={styles.previewBody}>
                  <div className={styles.previewMeta}>
                    <img src={previewData.thumbnail} alt={previewData.title} className={styles.previewThumb} />
                    <div className={styles.previewInfo}>
                      <h3>{previewData.title}</h3>
                      <p className={styles.previewCount}>🎥 {previewData.videoCount} Lessons found in this playlist</p>
                      <Link 
                        to={`/register?playlistUrl=${encodeURIComponent(playlistUrl || 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ivBEEkowgQnPEpHHCIPgIp')}`}
                        className={styles.enrollCta}
                      >
                        Enroll & Import This Playlist Free 🚀
                      </Link>
                    </div>
                  </div>

                  <div className={styles.previewListWrapper}>
                    <h4>Playlist Videos ({previewData.videoCount})</h4>
                    <ul className={styles.previewList}>
                      {previewData.videos.map((vid, idx) => (
                        <li key={idx} className={styles.previewItem}>
                          <span className={styles.previewIdx}>{idx + 1}</span>
                          <span className={styles.previewVidTitle}>{vid.title}</span>
                          <span className={styles.previewVidDuration}>{vid.duration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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

      <AboutSection />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <StartersSection />
      <FAQSection />

      {/* Call to Action Section */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <div className={styles.cardHeader}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.cardTitle}>SYSTEM // INITIALIZATION & SIGN UP</span>
          </div>
          <div className={styles.cardBody}>
            <h2>Ready to Supercharge Your Learning?</h2>
            <p>Join thousands of students who are turning unstructured videos into deep knowledge today.</p>
            <div className={styles.ctaActions}>
              {token ? (
                <Link to="/dashboard" className={styles.primaryBtn}>
                  Go to Dashboard 📊
                </Link>
              ) : (
                <Link to="/register" className={styles.primaryBtn}>
                  Create Free Account 🚀
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home