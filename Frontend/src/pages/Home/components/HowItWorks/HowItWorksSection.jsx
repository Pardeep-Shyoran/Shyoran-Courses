import styles from './HowItWorksSection.module.css'

const stepsData = [
  {
    step: 1,
    title: 'Paste Link',
    description: 'Find your favorite tutorial playlist on YouTube and copy its web address.'
  },
  {
    step: 2,
    title: 'Import & Organize',
    description: 'Add it to your personal course library. It instantly creates structured modules.'
  },
  {
    step: 3,
    title: 'Learn & Track',
    description: 'Watch ad-free players, take inline markdown notes, and track your study completion.'
  }
]

const HowItWorksSection = () => {
  return (
    <section className={styles.howItWorks}>
      <div className={styles.howContainer}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionHeaderBadge}>Process</span>
          <h2>How It Works</h2>
          <p>Transforming YouTube into a productive classroom is simple.</p>
        </div>
        <div className={styles.stepsContainer}>
          {stepsData.map((stepItem, idx) => (
            <div key={idx} className={styles.stepCard}>
              <div className={styles.cardHeader}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.cardTitle}>SYSTEM FLOW // STEP 0{stepItem.step}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.stepNumber}>
                  {stepItem.step}
                  <span className={styles.pulseGlow}></span>
                </div>
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
