import styles from './HowItWorksSection.module.css'

const stepsData = [
  {
    step: '01',
    title: 'Paste YouTube URL',
    description: 'Find any tutorial, bootcamp, or university lecture playlist on YouTube and paste its link.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    )
  },
  {
    step: '02',
    title: 'Auto-Build Curriculum',
    description: 'Our scraper generates a structured syllabus outline with video titles, durations, and ordering.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    )
  },
  {
    step: '03',
    title: 'Study & Retain',
    description: 'Watch in a distraction-free player, capture timestamped notes, and maintain your daily streak.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
      </svg>
    )
  }
]

const HowItWorksSection = () => {
  return (
    <section className={styles.howItWorks}>
      <div className={styles.howContainer}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionHeaderBadge}>How It Works</span>
          <h2>A Streamlined Learning Workflow</h2>
          <p>Converting passive video consumption into an interactive, structured workspace in three steps.</p>
        </div>
        <div className={styles.stepsContainer}>
          {stepsData.map((stepItem, idx) => (
            <div key={idx} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumBadge}>{stepItem.step}</span>
                <div className={styles.stepIcon}>{stepItem.icon}</div>
              </div>
              <div className={styles.stepBody}>
                <h3>{stepItem.title}</h3>
                <p>{stepItem.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
