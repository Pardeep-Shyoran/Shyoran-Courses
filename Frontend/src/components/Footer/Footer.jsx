import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Footer.module.css'

const Footer = ({ onOpenModal }) => {
  const currentYear = new Date().getFullYear()
  const location = useLocation()

  const handleHashClick = (e, hashId) => {
    if (location.pathname === '/') {
      e.preventDefault()
      const el = document.getElementById(hashId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <footer className={styles.footerWrapper}>
      {/* Ambient background glow */}
      <div className={styles.ambientGlow} />

      <div className={styles.footerContainer}>
        {/* Main Content Grid */}
        <div className={styles.mainGrid}>
          {/* Left Column: Socials, Email & Details */}
          <div className={styles.leftCol}>
            <div className={styles.socialIcons}>
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIconBtn}
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIconBtn}
                aria-label="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.66-.74 1.66-1.66 0-.91-.74-1.65-1.66-1.65-.92 0-1.66.74-1.66 1.65 0 .92.74 1.66 1.66 1.66m1.37 9.74v-8.37H5.09v8.37h2.74z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIconBtn}
                aria-label="X (Twitter)"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/pardeepshyoran"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIconBtn}
                aria-label="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>

            <a href="mailto:support@shyorancourses.com" className={styles.emailLink}>
              support@shyorancourses.com
            </a>

            <div className={styles.addressBlock}>
              <p>Distraction-Free YouTube Study Workspace</p>
              <p>Structured syllabi, notes & progress telemetry</p>
              <p>100% Free & Open Source for self-learners</p>
            </div>
          </div>

          {/* Center Column: Symmetrical Tech HUD Brackets + Central CTA */}
          <div className={styles.centerCol}>
            <div className={styles.hudContainer}>
              {/* Left Bracket with Dot Matrix */}
              <div className={styles.hudBracketLeft}>
                <div className={styles.dotMatrix}>
                  <span className={styles.dot} style={{ opacity: 0.3, top: '18%', left: '25%' }} />
                  <span className={styles.dot} style={{ opacity: 0.7, top: '28%', left: '68%' }} />
                  <span className={styles.dot} style={{ opacity: 0.45, top: '48%', left: '38%' }} />
                  <span className={styles.dot} style={{ opacity: 0.85, top: '60%', left: '78%' }} />
                  <span className={styles.dot} style={{ opacity: 0.35, top: '78%', left: '48%' }} />
                  <span className={styles.dot} style={{ opacity: 0.55, top: '22%', left: '82%' }} />
                  <span className={styles.dot} style={{ opacity: 0.75, top: '42%', left: '18%' }} />
                  <span className={styles.dot} style={{ opacity: 0.9, top: '70%', left: '22%' }} />
                  <span className={styles.dot} style={{ opacity: 0.4, top: '85%', left: '72%' }} />
                </div>
                <div className={styles.bracketLine} />
              </div>

              {/* Connecting Stem Left */}
              <div className={styles.stemLine} />

              {/* Central CTA Button */}
              <Link to="/courses" className={styles.ctaButton}>
                <span className={styles.ctaText}>Start Learning</span>
                <span className={styles.ctaBadge}>FREE</span>
              </Link>

              {/* Connecting Stem Right */}
              <div className={styles.stemLine} />

              {/* Right Bracket with Dot Matrix */}
              <div className={styles.hudBracketRight}>
                <div className={styles.dotMatrix}>
                  <span className={styles.dot} style={{ opacity: 0.85, top: '22%', left: '22%' }} />
                  <span className={styles.dot} style={{ opacity: 0.4, top: '35%', left: '62%' }} />
                  <span className={styles.dot} style={{ opacity: 0.65, top: '55%', left: '32%' }} />
                  <span className={styles.dot} style={{ opacity: 0.3, top: '72%', left: '72%' }} />
                  <span className={styles.dot} style={{ opacity: 0.55, top: '28%', left: '78%' }} />
                  <span className={styles.dot} style={{ opacity: 0.8, top: '48%', left: '52%' }} />
                  <span className={styles.dot} style={{ opacity: 0.45, top: '68%', left: '18%' }} />
                  <span className={styles.dot} style={{ opacity: 0.9, top: '38%', left: '85%' }} />
                  <span className={styles.dot} style={{ opacity: 0.35, top: '82%', left: '42%' }} />
                </div>
                <div className={styles.bracketLine} />
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Shyoran Courses Navigation Links */}
          <div className={styles.rightCol}>
            <nav className={styles.navMenu}>
              <Link to="/courses" className={styles.navLink}>Course Catalog</Link>
              <Link
                to="/#starters-library"
                onClick={(e) => handleHashClick(e, 'starters-library')}
                className={styles.navLink}
              >
                Curated Tracks
              </Link>
              <Link to="/dashboard" className={styles.navLink}>Study Dashboard</Link>
              <Link to="/dashboard?tab=rewards" className={styles.navLink}>Certificates</Link>
              <Link to="/about" className={styles.navLink}>About Platform</Link>
              <Link to="/contact" className={styles.navLink}>Help & Support</Link>
            </nav>
          </div>
        </div>

        {/* Bottom Strip: Legal Links & Copyright */}
        <div className={styles.bottomStrip}>
          <div className={styles.bottomLeft}>
            <button
              type="button"
              onClick={() => onOpenModal && onOpenModal('terms')}
              className={styles.legalBtn}
            >
              Terms and conditions
            </button>
          </div>

          <div className={styles.bottomCenter}>
            <p className={styles.copyrightText}>
              &copy; {currentYear} Shyoran Courses. All Rights Reserved
            </p>
          </div>

          <div className={styles.bottomRight}>
            <button
              type="button"
              onClick={() => onOpenModal && onOpenModal('privacy')}
              className={styles.legalBtn}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Massive Brand Watermark Text */}
      <div className={styles.watermarkContainer} aria-hidden="true">
        <span className={styles.watermarkText}>shyoran</span>
      </div>
    </footer>
  )
}

export default Footer
