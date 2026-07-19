import styles from './FeaturesSection.module.css'

const featuresData = [
  {
    icon: '📺',
    title: 'Instant Playlist Import',
    description: 'Paste any YouTube playlist link. We instantly fetch titles, durations, and thumbnails to generate your personal curriculum outline.'
  },
  {
    icon: '📝',
    title: 'Timestamped Markdown',
    description: 'Write notes while you watch. Save key timestamps that double as clickable links to jump back to exactly where the concept was taught.'
  },
  {
    icon: '🔥',
    title: 'Streak & Habit Tracker',
    description: 'Build a daily watch streak, see completion metrics on your personal dashboard, and stay consistent with your educational goals.'
  },
  {
    icon: '🛠️',
    title: 'Flexible Curriculum',
    description: 'Take control of your studies. Reorder videos to fix playlist sequences, reverse order, and filter completed lessons out of view.'
  },
  {
    icon: '🎓',
    title: 'Shareable Certificates',
    description: 'Finish your imported course and receive a personalized certificate of completion, complete with unique verification codes.'
  },
  {
    icon: '🔕',
    title: 'Distraction-Free Workspace',
    description: 'Study without recommended loops, clickbait sidebar thumbnails, comments, or ads. Just clean, optimized space for study.'
  }
]

const FeaturesSection = () => {
  return (
    <section className={styles.features}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionHeaderBadge}>Features</span>
        <h2>Crafted for Deep Learning</h2>
        <p>Everything you need to transform videos into structured, persistent knowledge.</p>
      </div>
      <div className={styles.featureGrid}>
        {featuresData.map((feature, idx) => (
          <div key={idx} className={styles.featureCard}>
            <div className={styles.cardHeader}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.cardTitle}>FEATURE // {feature.title.toUpperCase()}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.iconWrapper}>
                <span className={styles.featureIcon}>{feature.icon}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
