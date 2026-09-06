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

const SAMPLE_PRESETS = {
  react: {
    url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-TkyM96M367ZoZoNmDX',
    title: "React & Modern Hooks Masterclass",
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
  },
  python: {
    url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9g6m_6SildS5qfV5wA_8M-v',
    title: "Python Data Structures & Algorithms",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&auto=format&fit=crop",
    videoCount: 6,
    videos: [
      { title: "01. Algorithmic Complexity & Big-O Notation Primer", duration: "18:20" },
      { title: "02. Arrays, Dynamic Lists, and Hash Maps in Python", duration: "25:40" },
      { title: "03. Linked Lists: Singly, Doubly, and Circular Implementations", duration: "21:15" },
      { title: "04. Stacks, Queues, and Deques for Problem Solving", duration: "19:50" },
      { title: "05. Binary Search Trees & Tree Traversal Algorithms", duration: "27:10" },
      { title: "06. Graph Representations: Adjacency Lists, BFS & DFS", duration: "32:00" }
    ]
  },
  systemDesign: {
    url: 'https://www.youtube.com/playlist?list=PLMC9HnGGXB5LQ_J2y45l8x_1aC6aXzYQe',
    title: "System Design for High Scale",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop",
    videoCount: 6,
    videos: [
      { title: "01. High-Level Architecture & Scaling Fundamentals", duration: "20:15" },
      { title: "02. Load Balancers, Reverse Proxies & CDN Caching", duration: "24:30" },
      { title: "03. Database Sharding, Replication & CAP Theorem", duration: "28:45" },
      { title: "04. Message Queues, Kafka & Asynchronous Processing", duration: "22:10" },
      { title: "05. Distributed Caching Strategies with Redis", duration: "19:40" },
      { title: "06. Rate Limiting, API Gateways & Fault Tolerance", duration: "26:30" }
    ]
  }
}

const Home = () => {
  const { token } = useAuth()
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSelectSample = (presetKey) => {
    setErrorMsg('')
    const preset = SAMPLE_PRESETS[presetKey] || SAMPLE_PRESETS.react
    setPlaylistUrl(preset.url)
    setPreviewData(preset)
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
        title: "Full-Stack Web Development Bootcamp",
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
    }, 900)
  }

  const scrollToStarters = () => {
    const el = document.getElementById('starters-library')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Shimmering Version Badge */}
        <div className={styles.announcementBadge}>
          <span className={styles.badgeShimmer}></span>
          <span className={styles.badgeIcon}>✦</span>
          <span className={styles.badgeText}>YouTube Study Engine 2.0</span>
          <span className={styles.badgeSep}>•</span>
          <span className={styles.badgeTag}>Distraction-Free</span>
          <svg className={styles.badgeArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>

        {/* Clean Geometric Headline */}
        <h1 className={styles.title}>
          Turn YouTube Playlists Into <br />
          <span className={styles.gradientText}>Structured Courses</span>
        </h1>

        {/* Crisp Subtitle */}
        <p className={styles.subtitle}>
          Stop scrolling, start mastering. Convert any educational YouTube playlist into a focused workspace with timed note-taking, daily progress streaks, and verifiable certificates.
        </p>

        {/* Trust & Guarantees Proofline */}
        <div className={styles.trustPills}>
          <span className={styles.trustPill}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            100% Free
          </span>
          <span className={styles.trustPill}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Zero Distractions or Ads
          </span>
          <span className={styles.trustPill}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Verified Certificates
          </span>
        </div>

        {/* Primary CTA Buttons */}
        <div className={styles.ctaContainer}>
          {token ? (
            <Link to="/dashboard" className={styles.primaryBtn}>
              <span>Go to Dashboard</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          ) : (
            <Link to="/register" className={styles.primaryBtn}>
              <span>Start Learning Free</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          )}

          <button onClick={scrollToStarters} className={styles.secondaryBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7"></path>
            </svg>
            <span>Explore 50+ Playlists</span>
          </button>
        </div>

        {/* Command-Bar URL Sandbox (Interactive Centerpiece) */}
        <div className={styles.demoWrapper}>
          <div className={styles.demoInputContainer}>
            <div className={styles.ytBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Paste any YouTube playlist link (e.g. youtube.com/playlist?list=...)"
              value={playlistUrl}
              onChange={(e) => {
                setPlaylistUrl(e.target.value)
                setErrorMsg('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePreview()
              }}
              className={styles.demoInput}
            />
            <button 
              onClick={handlePreview} 
              className={styles.demoBtn} 
              disabled={loadingPreview}
            >
              {loadingPreview ? (
                <span className={styles.btnLoadingText}>
                  <span className={styles.spinner}></span>
                  Parsing...
                </span>
              ) : (
                <>
                  <span>Preview Course</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Triggers */}
          <div className={styles.sampleTriggers}>
            <span className={styles.sampleLabel}>Try live sample:</span>
            <button onClick={() => handleSelectSample('react')} className={styles.samplePill}>
              ⚡ React Masterclass
            </button>
            <button onClick={() => handleSelectSample('python')} className={styles.samplePill}>
              🐍 Python & DSA
            </button>
            <button onClick={() => handleSelectSample('systemDesign')} className={styles.samplePill}>
              📐 System Design
            </button>
          </div>

          {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

          {/* Course Preview Mockup Card */}
          {previewData && (
            <div className={styles.previewBox}>
              <div className={styles.previewHeader}>
                <div className={styles.previewHeaderLeft}>
                  <span className={styles.previewStatusIndicator}></span>
                  <span className={styles.previewHeaderTitle}>PARSED CURRICULUM PREVIEW</span>
                </div>
                <span className={styles.previewBadge}>{previewData.videoCount} Lessons</span>
              </div>
              
              <div className={styles.previewBody}>
                <div className={styles.previewMeta}>
                  <div className={styles.thumbWrapper}>
                    <img src={previewData.thumbnail} alt={previewData.title} className={styles.previewThumb} />
                    <div className={styles.thumbOverlay}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.previewInfo}>
                    <span className={styles.courseTypeTag}>Ready to Import</span>
                    <h3>{previewData.title}</h3>
                    <p className={styles.previewCount}>Curriculum parsed successfully. Study with zero algorithmic distractions.</p>
                    <Link 
                      to={`/register?playlistUrl=${encodeURIComponent(playlistUrl || 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ivBEEkowgQnPEpHHCIPgIp')}`}
                      className={styles.enrollCta}
                    >
                      <span>Enroll & Open Workspace</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className={styles.previewListWrapper}>
                  <div className={styles.previewListHeader}>
                    <h4>Course Curriculum</h4>
                    <span className={styles.curriculumMeta}>HD Video Stream • Sync Notes</span>
                  </div>
                  <ul className={styles.previewList}>
                    {previewData.videos.map((vid, idx) => (
                      <li key={idx} className={styles.previewItem}>
                        <span className={styles.previewIdx}>{String(idx + 1).padStart(2, '0')}</span>
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

        {/* Social Proof / Metric Bar */}
        <div className={styles.socialProofBar}>
          <div className={styles.avatarStack}>
            <div className={styles.avatarImg} style={{ background: '#e2583e' }}>JS</div>
            <div className={styles.avatarImg} style={{ background: '#3b82f6' }}>PY</div>
            <div className={styles.avatarImg} style={{ background: '#10b981' }}>GO</div>
            <div className={styles.avatarImg} style={{ background: '#8b5cf6' }}>TS</div>
          </div>
          <span className={styles.socialProofText}>
            Over <strong>10,000+</strong> study hours completed by self-taught engineers
          </span>
        </div>
      </section>

      {/* Structured Tracks Marquee */}
      <div className={styles.marqueeSection}>
        <p className={styles.marqueeTitle}>Structured Tracks For Self-Directed Learners</p>
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            <div className={styles.marqueeGroup}>
              <span className={styles.trackPill}>Full-Stack React & Next.js</span>
              <span className={styles.trackPill}>Data Structures & Algorithms</span>
              <span className={styles.trackPill}>System Design & Architecture</span>
              <span className={styles.trackPill}>Mobile Dev & React Native</span>
              <span className={styles.trackPill}>AI Engineering & LLMs</span>
              <span className={styles.trackPill}>Cyber Security & Defense</span>
              <span className={styles.trackPill}>Cloud Infrastructure & DevOps</span>
              <span className={styles.trackPill}>Modern UI/UX Design</span>
            </div>
            <div className={styles.marqueeGroup} aria-hidden="true">
              <span className={styles.trackPill}>Full-Stack React & Next.js</span>
              <span className={styles.trackPill}>Data Structures & Algorithms</span>
              <span className={styles.trackPill}>System Design & Architecture</span>
              <span className={styles.trackPill}>Mobile Dev & React Native</span>
              <span className={styles.trackPill}>AI Engineering & LLMs</span>
              <span className={styles.trackPill}>Cyber Security & Defense</span>
              <span className={styles.trackPill}>Cloud Infrastructure & DevOps</span>
              <span className={styles.trackPill}>Modern UI/UX Design</span>
            </div>
          </div>
        </div>
      </div>

      <AboutSection />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <div id="starters-library">
        <StartersSection />
      </div>
      <div id="faq">
        <FAQSection />
      </div>

      {/* Modern Call to Action Section */}
      <section className={styles.cta}>
        <div className={styles.ctaWrapper}>
          {/* Layered Ambient Spotlight & Depth */}
          <div className={styles.ctaGlowWarm}></div>
          <div className={styles.ctaGlowIndigo}></div>
          <div className={styles.ctaGridPattern}></div>

          <div className={styles.ctaCard}>
            {/* Top Light Beam Accent */}
            <div className={styles.ctaTopBeam}></div>

            <div className={styles.ctaBody}>
              {/* Modern Micro Pill */}
              <div className={styles.ctaBadge}>
                <span className={styles.ctaBadgeDot}></span>
                <span>Instant Access • 100% Free Forever</span>
              </div>

              {/* High-Impact Headline */}
              <h2 className={styles.ctaTitle}>
                Ready to Turn YouTube Playlists <br />
                <span className={styles.ctaTitleGradient}>Into Permanent Mastery?</span>
              </h2>

              {/* Crisp Subtitle */}
              <p className={styles.ctaSubtitle}>
                Say goodbye to endless recommendation rabbit holes and lost browser tabs.
                Import your first playlist in seconds and experience pure, distraction-free study.
              </p>

              {/* Action Buttons */}
              <div className={styles.ctaActions}>
                {token ? (
                  <Link to="/dashboard" className={styles.ctaPrimaryBtn}>
                    <span>Go to Your Workspace</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className={styles.ctaPrimaryBtn}>
                      <span>Create Free Account</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </Link>
                    <Link to="/login" className={styles.ctaSecondaryBtn}>
                      <span>Sign In</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Guarantees & Perks Strip */}
              <div className={styles.ctaPerks}>
                <div className={styles.ctaPerkItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  <span>Instant 1-Click Import</span>
                </div>
                <div className={styles.ctaPerkDivider}></div>
                <div className={styles.ctaPerkItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                  <span>0 Ads or Recommendations</span>
                </div>
                <div className={styles.ctaPerkDivider}></div>
                <div className={styles.ctaPerkItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>No Credit Card Needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home