import styles from './AboutSection.module.css'

const AboutSection = () => {
  return (
    <section className={styles.aboutPlatform}>
      <div className={styles.aboutContainer}>
        <div className={styles.aboutTextContent}>
          <span className={styles.sectionHeaderBadge}>The Vision</span>
          <h2>Active Study, Zero Distractions</h2>
          <p className={styles.aboutLead}>
            We believe the world's best education is already freely available on YouTube. However, the YouTube platform is designed for endless scrolling and passive consumption, not structured deep work.
          </p>
          <p>
            Shyoran Courses bridges this gap by acting as your personal virtual classroom. We strip away standard recommended feeds, notifications, and comment sections, wrapping your study material in an environment built exclusively for focus and retention.
          </p>
          <div className={styles.aboutHighlights}>
            <div className={styles.highlightItem}>
              <span className={styles.highlightCheck}>✓</span>
              <div>
                <h4>100% Learner Centric</h4>
                <p>Organize material for your own timeline and study rhythm.</p>
              </div>
            </div>
            <div className={styles.highlightItem}>
              <span className={styles.highlightCheck}>✓</span>
              <div>
                <h4>Active Recall Built-In</h4>
                <p>Take structured notes directly integrated with exact video timestamps.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.aboutVisual}>
          <div className={styles.glassCard}>
            <div className={styles.glassCardHeader}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.cardTitle}>Why Shyoran Courses?</span>
            </div>
            <div className={styles.glassCardBody}>
              <div className={styles.statRow}>
                <div className={styles.statItem}>
                  <h3>0</h3>
                  <p>Ad Distractions</p>
                </div>
                <div className={styles.statItem}>
                  <h3>100%</h3>
                  <p>Focused Environment</p>
                </div>
              </div>
              <div className={styles.benefitList}>
                <div className={styles.benefitItem}>
                  <span className={styles.benefitIcon}>🎯</span>
                  <span>Convert any playlist link in 1-click</span>
                </div>
                <div className={styles.benefitItem}>
                  <span className={styles.benefitIcon}>⏱️</span>
                  <span>Seek to timestamp directly from notes</span>
                </div>
                <div className={styles.benefitItem}>
                  <span className={styles.benefitIcon}>🔥</span>
                  <span>Track daily learning habits easily</span>
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
