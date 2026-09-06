import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './About.module.css'

const About = () => {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: 'How does importing a YouTube playlist work?',
      answer: 'Simply copy any public or unlisted YouTube playlist URL and paste it into the Import modal on the Courses page. Our platform extracts the video metadata, duration, and titles in seconds, organizing everything into a structured syllabus with progress checkpoints.'
    },
    {
      question: 'Are my timestamped study notes private?',
      answer: 'Yes, 100%. All your notes, timestamps, checklists, and learning streaks are securely tied to your personal account. You can search, edit, review, and jump directly to exact video moments anytime.'
    },
    {
      question: 'Is Shyoran Courses completely free to use?',
      answer: 'Yes! We believe that top-tier education should be borderless and accessible to everyone. The core platform, playlist import tool, video player workspace, and note-taking suite are completely free with zero ad interruptions.'
    },
    {
      question: 'Can I earn verifiable certificates upon completion?',
      answer: 'Yes. When you complete all lessons in a curated or imported track, Shyoran Courses generates a verifiable certificate of completion with your name, course title, and completion timestamp that you can showcase on LinkedIn or your portfolio.'
    },
    {
      question: 'Can I use Shyoran Courses on mobile devices?',
      answer: 'Absolutely. Shyoran Courses is fully responsive and optimized for mobile screens, tablets, and desktops. Your progress, notes, and streak synchronise seamlessly across all your devices.'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Playlists Imported', subtext: 'Curated into clean courses' },
    { value: '50,000+', label: 'Study Hours Tracked', subtext: 'Deep work without ads' },
    { value: '25,000+', label: 'Timestamped Notes', subtext: 'Active recall insights' },
    { value: '99.4%', label: 'Focus & Retention', subtext: 'Reported by learners' }
  ]

  const pillars = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      title: 'Active Recall Over Binging',
      desc: 'Passive watching leads to the illusion of competence. Our timestamped note engine and chapter quizzes turn casual video consumption into durable cognitive retention.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      title: 'Zero Cognitive Friction',
      desc: 'No algorithmic traps, no autoplay rabbit holes, and zero sidebar distractions. We strip away the noise so your mental bandwidth is 100% dedicated to deep learning.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 9.17 4.24-4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="m9.17 14.83-4.24 4.24" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
      title: 'Sovereign Curriculum',
      desc: 'You choose what to master. Whether studying Harvard CS50, deep-dive Rust tutorials, or music theory, you build and own your custom learning journey.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      title: 'Habit Engine & Streaks',
      desc: 'Mastery is the compounding result of daily discipline. Our heatmap telemetry and smart resume anchors keep your momentum unbroken across weeks and months.'
    }
  ]

  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            <span>THE ARCHITECTURE OF LEARNING</span>
          </div>

          <h1 className={styles.heroTitle}>
            Turning Algorithmic Noise Into{' '}
            <span className={styles.heroTitleGradient}>Permanent Mastery</span>
          </h1>

          <p className={styles.heroLead}>
            The world’s best education is already online, free, and accessible on YouTube.
            However, YouTube is engineered for engagement, continuous scrolling, and ad clicks—not deep work.
            <strong> Shyoran Courses</strong> re-architects open educational media into a structured, distraction-free
            classroom with active recall and habit persistence.
          </p>

          <div className={styles.heroActions}>
            {user ? (
              <Link to="/dashboard" className={styles.primaryBtn}>
                <span>Go to Dashboard</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            ) : (
              <Link to="/register" className={styles.primaryBtn}>
                <span>Start Learning Free</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            )}
            <Link to="/courses" className={styles.secondaryBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Explore Course Catalog</span>
            </Link>
          </div>

          <div className={styles.heroTrustBadges}>
            <div className={styles.trustItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>100% Free & Open Access</span>
            </div>
            <span className={styles.trustDot}>•</span>
            <div className={styles.trustItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Zero Ads & Distractions</span>
            </div>
            <span className={styles.trustDot}>•</span>
            <div className={styles.trustItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Verifiable Certificates</span>
            </div>
          </div>
        </section>

        {/* Telemetry / Impact Section */}
        <section className={styles.telemetrySection}>
          <div className={styles.telemetryCard}>
            <div className={styles.telemetryTopGlow}></div>
            <div className={styles.telemetryGrid}>
              {stats.map((stat, idx) => (
                <div key={idx} className={styles.telemetryItem}>
                  <div className={styles.telemetryValue}>{stat.value}</div>
                  <div className={styles.telemetryLabel}>{stat.label}</div>
                  <div className={styles.telemetrySubtext}>{stat.subtext}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Problem vs Solution Showcase */}
        <section className={styles.bentoSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>WHY SHYORAN COURSES</span>
            <h2>Engineered for Focus, Built for Retention</h2>
            <p>Comparing the standard online video experience with our focused study environment.</p>
          </div>

          <div className={styles.bentoGrid}>
            {/* Bento Card 1: Large Featured */}
            <div className={`${styles.bentoCard} ${styles.bentoSpan2}`}>
              <div className={styles.bentoCardInner}>
                <div className={styles.bentoBadge}>
                  <span className={styles.bentoBadgeIcon}>⚡</span>
                  <span>Distraction-Free Sanctuary</span>
                </div>
                <h3>Eliminate Algorithmic Noise & Autoplay Traps</h3>
                <p>
                  YouTube thrives on attention capture. Shyoran Courses creates a serene workspace completely stripped
                  of comments, recommendations, clickbait thumbnails, and notifications—protecting your flow state for hours.
                </p>

                <div className={styles.comparisonBox}>
                  <div className={styles.compRowOld}>
                    <span className={styles.compTagBad}>YouTube Tab</span>
                    <span className={styles.compDesc}>Recommendations, autoplay distractions, ads, zero note syncing</span>
                  </div>
                  <div className={styles.compRowNew}>
                    <span className={styles.compTagGood}>Shyoran Workspace</span>
                    <span className={styles.compDesc}>Curated player, synchronized timestamps, persistent resume, zero noise</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className={styles.bentoCard}>
              <div className={styles.bentoCardInner}>
                <div className={styles.bentoBadge}>
                  <span className={styles.bentoBadgeIcon}>📝</span>
                  <span>Active Recall</span>
                </div>
                <h3>Timestamped Study Notes</h3>
                <p>
                  Capture thoughts, formulas, and code snippets linked directly to video millisecond markers. Clicking any note instantly seeks the video to that exact explanation.
                </p>
                <div className={styles.miniNotePreview}>
                  <div className={styles.miniNotePill}>⏱️ 14:32</div>
                  <div className={styles.miniNoteText}>"Key architectural tradeoff between SSR vs SSG"</div>
                </div>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className={styles.bentoCard}>
              <div className={styles.bentoCardInner}>
                <div className={styles.bentoBadge}>
                  <span className={styles.bentoBadgeIcon}>🔥</span>
                  <span>Habit Persistence</span>
                </div>
                <h3>Streak Engine & Checkpoints</h3>
                <p>
                  Consistency beats intensity. Visual streak calendars, daily learning minutes, and resume banners ensure you never abandon a course halfway through.
                </p>
                <div className={styles.miniStreakBar}>
                  <div className={styles.streakIndicator}>🔥 7-Day Streak Active</div>
                  <div className={styles.streakTrack}>
                    <div className={styles.streakFill} style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className={`${styles.bentoCard} ${styles.bentoSpan2}`}>
              <div className={styles.bentoCardInner}>
                <div className={styles.bentoBadge}>
                  <span className={styles.bentoBadgeIcon}>🚀</span>
                  <span>Instant Onboarding</span>
                </div>
                <h3>Turn Any YouTube Playlist Into a Course in 10 Seconds</h3>
                <p>
                  Found an incredible 40-video bootcamp playlist on Next.js, Kubernetes, or Machine Learning?
                  Simply paste the link, and Shyoran Courses structures it with a full video table of contents, durations, and progress tracking.
                </p>
                <div className={styles.urlInputMockup}>
                  <span className={styles.urlPrefix}>https://youtube.com/playlist?list=...</span>
                  <span className={styles.urlActionBadge}>Imported in 2.4s</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Four Core Pillars */}
        <section className={styles.pillarsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>OUR PHILOSOPHY</span>
            <h2>Built on Core Principles</h2>
            <p>Every tool and interface detail is designed to honor the self-directed learner’s time and focus.</p>
          </div>

          <div className={styles.pillarsGrid}>
            {pillars.map((pillar, idx) => (
              <div key={idx} className={styles.pillarCard}>
                <div className={styles.pillarIconWrapper}>{pillar.icon}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Creator / Origin Story Section */}
        <section className={styles.storySection}>
          <div className={styles.storyCard}>
            <div className={styles.storyBeam}></div>
            <div className={styles.storyContent}>
              <div className={styles.storyBadgeArea}>
                <span className={styles.storyBadge}>THE ORIGIN STORY</span>
              </div>
              <h2>Why We Built Shyoran Courses</h2>
              <p>
                When our founder, <strong>Pardeep Shyoran</strong>, began learning modern software engineering,
                the greatest educational resources were not locked behind $2,000 bootcamps or expensive university walls.
                They were already freely available on YouTube, created by passionate domain experts and educators.
              </p>
              <p>
                However, YouTube was built to maximize ad clicks, recommend viral distractions, and keep you passively binging.
                There were no structured notes, no progress synchronization, and no accountability.
              </p>
              <p>
                <strong>Shyoran Courses was born out of that frustration.</strong> We set out to give self-directed learners the professional
                rigor, clarity, and note-taking infrastructure they deserve—turning the chaotic world of online video into a clean,
                focused digital university.
              </p>

              <div className={styles.founderSignatureBox}>
                <div className={styles.founderAvatar}>
                  <span>PS</span>
                </div>
                <div className={styles.founderMeta}>
                  <strong>Pardeep Shyoran</strong>
                  <span>Founder & Lead Architect, Shyoran Courses</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>FREQUENTLY ASKED QUESTIONS</span>
            <h2>Common Questions</h2>
            <p>Everything you need to know about the platform and how to supercharge your study routine.</p>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <button className={styles.faqQuestion} aria-expanded={isOpen}>
                    <span>{faq.question}</span>
                    <div className={styles.faqIconCircle}>
                      <svg
                        className={`${styles.faqChevron} ${isOpen ? styles.faqChevronRotated : ''}`}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </button>
                  {isOpen && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* High-Impact Bottom CTA Banner */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlowWarm}></div>
            <div className={styles.ctaGlowIndigo}></div>
            <div className={styles.ctaBeam}></div>

            <div className={styles.ctaBody}>
              <div className={styles.ctaBadge}>
                <span className={styles.ctaBadgeDot}></span>
                <span>START YOUR JOURNEY TODAY</span>
              </div>

              <h2 className={styles.ctaTitle}>
                Ready to Build Your{' '}
                <span className={styles.ctaTitleGradient}>Distraction-Free Classroom?</span>
              </h2>

              <p className={styles.ctaSubtitle}>
                Join thousands of self-directed learners mastering development, design, and science with zero ads and structured recall.
              </p>

              <div className={styles.ctaActions}>
                {user ? (
                  <Link to="/dashboard" className={styles.ctaPrimaryBtn}>
                    <span>Go to Your Dashboard</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                ) : (
                  <Link to="/register" className={styles.ctaPrimaryBtn}>
                    <span>Start Learning Free</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                )}
                <Link to="/courses" className={styles.ctaSecondaryBtn}>
                  <span>Explore Course Library</span>
                </Link>
              </div>

              <div className={styles.ctaPerks}>
                <div className={styles.ctaPerkItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className={styles.ctaPerkDivider}></div>
                <div className={styles.ctaPerkItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Setup in under 10 seconds</span>
                </div>
                <div className={styles.ctaPerkDivider}></div>
                <div className={styles.ctaPerkItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>100% Free forever</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
