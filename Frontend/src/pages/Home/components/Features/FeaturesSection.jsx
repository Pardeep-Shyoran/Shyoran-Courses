import styles from './FeaturesSection.module.css'

const FeaturesSection = () => {
  return (
    <section className={styles.features}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionHeaderBadge}>Features</span>
        <h2>Crafted for Deep Learning</h2>
        <p>Everything you need to turn passive video watching into structured, permanent knowledge.</p>
      </div>

      {/* Modern Asymmetric Bento Grid */}
      <div className={styles.bentoGrid}>
        
        {/* Bento 1: Wide Focus Player Card */}
        <div className={`${styles.bentoCard} ${styles.bentoCardWide}`}>
          <div className={styles.cardTop}>
            <div className={styles.iconPill}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </div>
            <span className={styles.cardBadge}>Zero Distractions</span>
          </div>

          <div className={styles.cardContent}>
            <h3>Dedicated Focus Player</h3>
            <p>Study without recommended loops, clickbait sidebar thumbnails, comments, or autoplay ads. A clean workspace dedicated entirely to comprehension.</p>
          </div>

          {/* Mini Interactive Player Mockup */}
          <div className={styles.playerMockup}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDots}>
                <span></span><span></span><span></span>
              </div>
              <span className={styles.mockupLessonTitle}>03. Asynchronous JavaScript & Promises</span>
              <span className={styles.mockupSpeed}>1.25x</span>
            </div>
            <div className={styles.mockupScreen}>
              <div className={styles.mockupPlayBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div className={styles.mockupProgressTrack}>
                <div className={styles.mockupProgressFill}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 2: Timestamped Notes Card */}
        <div className={styles.bentoCard}>
          <div className={styles.cardTop}>
            <div className={styles.iconPill}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <span className={styles.cardBadge}>Smart Notes</span>
          </div>

          <div className={styles.cardContent}>
            <h3>Timestamped Markdown</h3>
            <p>Write notes while you watch. Save key timestamps that double as clickable links to jump back to exact moments.</p>
          </div>

          <div className={styles.notesPreview}>
            <div className={styles.noteSnippet}>
              <span className={styles.timestampBadge}>08:42</span>
              <span className={styles.noteText}>Promise.allSettled() prevents early rejection failure</span>
            </div>
            <div className={styles.noteSnippet}>
              <span className={styles.timestampBadge}>14:15</span>
              <span className={styles.noteText}>Microtask queue vs Macrotask event loop</span>
            </div>
          </div>
        </div>

        {/* Bento 3: Consistency & Streaks */}
        <div className={styles.bentoCard}>
          <div className={styles.cardTop}>
            <div className={styles.iconPill}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
              </svg>
            </div>
            <span className={styles.cardBadge}>Streaks</span>
          </div>

          <div className={styles.cardContent}>
            <h3>Habit & Streak Tracker</h3>
            <p>Build daily learning discipline with GitHub-style consistency matrices and milestone badges.</p>
          </div>

          <div className={styles.streakGridMockup}>
            <div className={styles.streakStatus}>
              <span className={styles.streakNum}>14</span>
              <span className={styles.streakLabel}>Day Active Streak</span>
            </div>
            <div className={styles.miniHeatmap}>
              <div className={`${styles.heatCell} ${styles.heatActive}`}></div>
              <div className={`${styles.heatCell} ${styles.heatActive}`}></div>
              <div className={`${styles.heatCell} ${styles.heatMid}`}></div>
              <div className={`${styles.heatCell} ${styles.heatActive}`}></div>
              <div className={`${styles.heatCell} ${styles.heatActive}`}></div>
              <div className={`${styles.heatCell} ${styles.heatHigh}`}></div>
              <div className={`${styles.heatCell} ${styles.heatHigh}`}></div>
            </div>
          </div>
        </div>

        {/* Bento 4: Flexible Curriculum */}
        <div className={styles.bentoCard}>
          <div className={styles.cardTop}>
            <div className={styles.iconPill}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
            </div>
            <span className={styles.cardBadge}>Custom Flow</span>
          </div>

          <div className={styles.cardContent}>
            <h3>Reorderable Syllabus</h3>
            <p>Take full control of your curriculum. Drag and drop lectures, reverse backwards playlists, or archive completed lessons.</p>
          </div>

          <div className={styles.orderMockup}>
            <div className={styles.orderItem}>
              <span className={styles.dragHandle}>:::</span>
              <span>1. System Design Intro</span>
              <span className={styles.orderCheck}>✓</span>
            </div>
            <div className={styles.orderItem}>
              <span className={styles.dragHandle}>:::</span>
              <span>2. Horizontal Scaling & Sharding</span>
              <span className={styles.orderActiveDot}></span>
            </div>
          </div>
        </div>

        {/* Bento 5: Shareable Certificates */}
        <div className={styles.bentoCard}>
          <div className={styles.cardTop}>
            <div className={styles.iconPill}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <span className={styles.cardBadge}>Verifiable</span>
          </div>

          <div className={styles.cardContent}>
            <h3>Shareable Certificates</h3>
            <p>Upon completing all modules, receive a verified digital certificate with unique credential ID, ready for LinkedIn.</p>
          </div>

          <div className={styles.certMockup}>
            <div className={styles.certHeaderMini}>
              <span className={styles.certSeal}>★</span>
              <span>Certificate of Mastery</span>
            </div>
            <div className={styles.certCode}>VERIFIED #SC-9824</div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default FeaturesSection
