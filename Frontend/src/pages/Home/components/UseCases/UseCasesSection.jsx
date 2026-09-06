import { Link } from 'react-router-dom'
import styles from './UseCasesSection.module.css'

const UseCasesSection = () => {
  return (
    <section className={styles.useCasesSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionHeaderBadge}>Who It Is For</span>
        <h2 className={styles.sectionTitle}>Built for Serious Self-Learners</h2>
        <p className={styles.sectionSubtitle}>
          Whether you are cracking exams, mastering full-stack code, or upskilling after hours, Shyoran Courses turns scattered YouTube playlists into permanent mastery.
        </p>
      </div>

      {/* Modern Bento Grid Container */}
      <div className={styles.bentoGrid}>
        
        {/* Card 1: Left Tall Hero Card (Spans 4 Cols, 2 Rows) */}
        <div className={styles.tallCard}>
          <img
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop"
            alt="Inspired learner studying with freedom"
            loading="lazy"
            className={styles.tallCardImage}
          />
          <div className={styles.tallCardGradient}></div>
          <div className={styles.tallCardContent}>
            <p className={styles.tallCardSubhead}>Study on Your Terms</p>
            <h3 className={styles.tallCardTitle}>
              Smart learning <br />
              for everyday <br />
              <span className={styles.accentTextPrimary}>freedom.</span>
            </h3>
          </div>
        </div>

        {/* Card 2: Top Right Wide Hero Box (Spans 8 Cols) */}
        <div className={styles.headerCard}>
          {/* Subtle Monogram Watermark */}
          <div className={styles.watermarkLetter} aria-hidden="true">S</div>

          <div className={styles.headerCardContent}>
            <h3 className={styles.headerHeadline}>
              A smarter way to master playlists{' '}
              <span className={styles.accentTextPrimary}>distraction-free</span> and{' '}
              <span className={styles.accentTextGold}>systematically.</span>
            </h3>

            <div className={styles.ctaRow}>
              <Link to="/courses" className={styles.ctaPillBtn}>
                <span>Explore Tracks</span>
              </Link>
              <Link to="/courses" className={styles.ctaArrowBtn} aria-label="Explore courses directory">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </Link>
            </div>

            <div className={styles.brandRow}>
              <div className={styles.brandBadge}>
                <span className={styles.brandMonogram}>S</span>
                <span className={styles.brandName}>shyoran courses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: 98% Stat Card with Floating Credential Pass */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statNumber}>98%</span>
            <div className={styles.trustBadge}>
              <span>completion boost</span>
              <div className={styles.shieldIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Floating Credential Pass Graphic */}
          <div className={styles.passGraphic}>
            <div className={styles.passHeader}>
              <span className={styles.passLogo}>S shyoran</span>
              <span className={styles.passChipIcon}>)))</span>
            </div>
            <div className={styles.passChipSlot}></div>
            <div className={styles.passNumber}>4237 5678 9012 3456</div>
            <div className={styles.passFooter}>
              <span>CERTIFIED LEARNER</span>
              <span className={styles.passBadge}>VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Card 4: AI Holographic Study Companion Card */}
        <div className={styles.aiCard}>
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop"
            alt="Engineer interacting with holographic study companion"
            loading="lazy"
            className={styles.aiCardImage}
          />
          {/* Glass HUD Floating Hologram */}
          <div className={styles.glassHud}>
            <div className={styles.hudHeader}>
              <div className={styles.hudIcon}>✦</div>
              <div>
                <div className={styles.hudTitle}>AI Study Companion</div>
                <div className={styles.hudSubtitle}>Your playlist co-pilot</div>
              </div>
            </div>
            <div className={styles.hudStatus}>
              <span className={styles.pulseDot}></span>
              <span>Syncing timestamped notes...</span>
            </div>
            {/* Waveform graphic */}
            <div className={styles.waveform}>
              <span style={{ height: '40%' }}></span>
              <span style={{ height: '70%' }}></span>
              <span style={{ height: '100%' }}></span>
              <span style={{ height: '60%' }}></span>
              <span style={{ height: '85%' }}></span>
              <span style={{ height: '50%' }}></span>
              <span style={{ height: '90%' }}></span>
              <span style={{ height: '35%' }}></span>
            </div>
          </div>
        </div>

        {/* Card 5: Bottom Wide Brand Card */}
        <div className={styles.brandCard}>
          <div className={styles.brandCardHeader}>
            <div className={styles.largeBrandLogo}>
              <span className={styles.largeLogoLetter}>S</span>
              <span className={styles.largeLogoText}>shyoran</span>
            </div>
          </div>

          <div className={styles.featurePillsRow}>
            <div className={styles.featurePill}>
              <div className={styles.pillIconWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <span>Zero YouTube Distractions</span>
            </div>

            <div className={styles.featurePill}>
              <div className={styles.pillIconWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <span>Instant 1-Click Import</span>
            </div>

            <div className={styles.featurePill}>
              <div className={styles.pillIconWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <span>Learn on Any Device</span>
            </div>
          </div>
        </div>

        {/* Card 6: Smartwatch Wearable Progress Tracker Card */}
        <div className={styles.deviceCard}>
          <img
            src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop"
            alt="Daily study streak tracked on smartwatch"
            loading="lazy"
            className={styles.deviceCardImage}
          />
          <div className={styles.watchScreenOverlay}>
            <div className={styles.watchMonogram}>S</div>
            <span className={styles.watchStreak}>5-Day Streak 🔥</span>
          </div>
        </div>

        {/* Card 7: 3D Vault / Milestone Credentials Card */}
        <div className={styles.vaultCard}>
          <div className={styles.vaultScene}>
            {/* 3D Isometric Safe Representation */}
            <div className={styles.vaultBox}>
              <div className={styles.vaultFront}>
                <div className={styles.vaultLogo}>S</div>
                <div className={styles.vaultDial}>
                  <div className={styles.vaultDialHandle}></div>
                </div>
              </div>
            </div>
            {/* Floating Gold Milestone Badges */}
            <div className={styles.floatingGem1}>✦</div>
            <div className={styles.floatingGem2}>🪙</div>
            <div className={styles.floatingGem3}>💎</div>
            {/* Cloud Pod Base */}
            <div className={styles.cloudBase}></div>
          </div>
          <div className={styles.vaultContent}>
            <h4 className={styles.vaultTitle}>Verifiable Mastery</h4>
            <p className={styles.vaultDesc}>Earn verifiable completion certificates to showcase on your portfolio.</p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default UseCasesSection
