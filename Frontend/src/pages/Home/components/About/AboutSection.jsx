import styles from './AboutSection.module.css'

const AboutSection = () => {
  return (
    <section className={styles.aboutPlatform}>
      <div className={styles.aboutContainer}>
        <div className={styles.aboutTextContent}>
          <span className={styles.sectionHeaderBadge}>The Vision</span>
          <h2>Active Study, Zero Distractions</h2>
          <p className={styles.aboutLead}>
            We believe the world's best education is already freely available on YouTube. However, YouTube is optimized for algorithmic engagement and continuous scrolling, not structured deep work.
          </p>
          <p>
            Shyoran Courses bridges this gap by acting as your personal virtual classroom. We strip away recommendations, autoplay traps, and clutter, wrapping your study material in a clean workspace built for retention.
          </p>
          <div className={styles.aboutHighlights}>
            <div className={styles.highlightItem}>
              <div className={styles.highlightCheck}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h4>100% Learner-Centric</h4>
                <p>Organize material for your personal timeline, pace, and study rhythms.</p>
              </div>
            </div>
            <div className={styles.highlightItem}>
              <div className={styles.highlightCheck}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h4>Active Recall Built-In</h4>
                <p>Take structured notes directly integrated with exact video timestamps.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.aboutVisual}>
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <div className={styles.statusDot}></div>
              <span className={styles.cardHeaderTitle}>Learning Telemetry</span>
              <span className={styles.cardHeaderBadge}>Live Mode</span>
            </div>
            <div className={styles.glassCardBody}>
              <div className={styles.statRow}>
                <div className={styles.statItem}>
                  <h3>0</h3>
                  <p>Ad Interruptions</p>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}>
                  <h3>100%</h3>
                  <p>Focused Workspace</p>
                </div>
              </div>
              <div className={styles.benefitList}>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                  <span>Convert any YouTube playlist in seconds</span>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <span>Seek to timestamp directly from study notes</span>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <span>Track consistency and daily study streaks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
