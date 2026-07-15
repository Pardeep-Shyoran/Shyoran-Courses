import styles from './About.module.css'

const KnowledgeGatewayIllustration = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.illustrationSvg}>
    {/* Concentric circles representing learning loops */}
    <circle cx="100" cy="100" r="80" stroke="var(--primary-color)" strokeWidth="0.25" strokeDasharray="3 3" opacity="0.2" />
    <circle cx="100" cy="100" r="60" stroke="var(--warning)" strokeWidth="0.25" opacity="0.3" />
    <circle cx="100" cy="100" r="40" stroke="var(--text-tertiary)" strokeWidth="0.5" strokeDasharray="1 5" opacity="0.4" />
    
    {/* Architectural Gateway Arches (Indian Torana vaults) */}
    <path d="M60 180V100C60 77.9 77.9 60 100 60s40 17.9 40 40v80" stroke="var(--primary-color)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    <path d="M75 180V100C75 86.2 86.2 75 100 75s25 11.2 25 25v80" stroke="var(--warning)" strokeWidth="1" opacity="0.6" />
    <path d="M90 180v-80c0-5.5 4.5-10 10-10s10 4.5 10 10v80" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.3" />

    {/* Horizontal beams (Torana lintels) */}
    <line x1="45" y1="70" x2="155" y2="70" stroke="var(--primary-color)" strokeWidth="1" opacity="0.3" />
    <line x1="55" y1="85" x2="145" y2="85" stroke="var(--warning)" strokeWidth="0.75" opacity="0.5" />

    {/* Structured nodes */}
    <g opacity="0.9">
      <circle cx="60" cy="110" r="4" fill="var(--bg-secondary)" stroke="var(--primary-color)" strokeWidth="1.5" />
      <line x1="64" y1="110" x2="75" y2="110" stroke="var(--primary-color)" strokeWidth="0.75" />
    </g>
    <g opacity="0.9">
      <circle cx="140" cy="130" r="4" fill="var(--bg-secondary)" stroke="var(--warning)" strokeWidth="1.5" />
      <line x1="125" y1="130" x2="136" y2="130" stroke="var(--warning)" strokeWidth="0.75" />
    </g>
    <g opacity="0.9">
      <circle cx="100" cy="75" r="5" fill="var(--primary-color)" />
      <circle cx="100" cy="75" r="8" stroke="var(--primary-color)" strokeWidth="0.5" opacity="0.5" />
    </g>

    {/* Suryodaya glow filter */}
    <circle cx="100" cy="100" r="18" fill="url(#sunriseGlow)" opacity="0.3" />

    <defs>
      <radialGradient id="sunriseGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--warning)" />
        <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
)

const About = () => {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        {/* Header */}
        <section className={styles.header}>
          {/* Subtle Torana Line Model Background */}
          <div className={styles.aboutMotif}>
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
              <circle cx="100" cy="100" r="18" fill="url(#sunriseGlowAbout)" opacity="0.3" />

              <defs>
                <radialGradient id="sunriseGlowAbout" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--warning)" />
                  <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>
          <div className={styles.headerBadge}>🏛️ Torana of Knowledge</div>
          <h1>
            About <span className={styles.gradientText}>Shyoran Courses</span>
          </h1>
          <p className={styles.tagline}>
            We believe that the world's best education is already online, free, and accessible. Our mission is to build the structure needed to help you master it.
          </p>
        </section>

        {/* Story Section */}
        <section className={styles.storySection}>
          <div className={styles.storyContent}>
            <h2>Our Story</h2>
            <p>
              YouTube hosts millions of hours of world-class educational content, tutorial playlists, and courses created by brilliant instructors. However, learning on YouTube is often plagued by distractions, lack of progress records, and difficulties in taking notes.
            </p>
            <p>
              Shyoran Courses was created to bridge this gap. We created a dashboard where learners can curate their own structured classrooms using YouTube playlists, allowing them to focus entirely on learning, taking time-anchored notes, and maintaining consistent habits.
            </p>
          </div>
          <div className={styles.illustrationCard}>
            <KnowledgeGatewayIllustration />
            <span className={styles.illustrationText}>
              Turn unstructured media into structured learning tracks.
            </span>
          </div>
        </section>

        {/* Stats Grid */}
        <section className={styles.statsContainer}>
          <div className={styles.statItem}>
            <h3>10k+</h3>
            <p>Playlists Imported</p>
          </div>
          <div className={styles.statItem}>
            <h3>25k+</h3>
            <p>Notes Captured</p>
          </div>
          <div className={styles.statItem}>
            <h3>99%</h3>
            <p>Satisfaction Rate</p>
          </div>
        </section>

        {/* Values Section */}
        <section className={styles.valuesSection}>
          <h2>Our Core Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueHeader}>
                <span className={styles.valueIcon}>🎯</span>
                <h3>Actionable Study</h3>
              </div>
              <p>
                We believe in active study over passive watching. Taking timestamped notes enables quick review and deeper encoding of concepts.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueHeader}>
                <span className={styles.valueIcon}>🛠️</span>
                <h3>Learner Autonomy</h3>
              </div>
              <p>
                You design your own curriculum. Import the playlists you want, select the topics you need, and study at your own convenience.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueHeader}>
                <span className={styles.valueIcon}>⚡</span>
                <h3>Frictionless Setup</h3>
              </div>
              <p>
                No complex onboarding. Just drop a YouTube link, and we handle the video metadata extraction, structured player loading, and database syncing.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueHeader}>
                <span className={styles.valueIcon}>🔥</span>
                <h3>Habit Formation</h3>
              </div>
              <p>
                Consistency is key to mastery. Our progress tracking and daily streaks help learners build a resilient habit of continuous self-improvement.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
