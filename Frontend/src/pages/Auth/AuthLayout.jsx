import { Link } from 'react-router-dom'
import GatewayLogo from '../../components/GatewayLogo/GatewayLogo'
import styles from './Auth.module.css'

const AuthLayout = ({ children, title, subtitle, footerText, footerLink, footerLinkText }) => {
  return (
    <div className={styles.container}>
      {/* Background visual decorations */}
      <div className={styles.decorations}>
        <div className={styles.glowBlob1} />
        <div className={styles.glowBlob2} />
        {/* Modern Vault/Archway Background SVG */}
        <div className={styles.authMotif}>
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
            <circle cx="100" cy="100" r="18" fill="url(#sunriseGlowAuth)" opacity="0.3" />

            <defs>
              <radialGradient id="sunriseGlowAuth" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--warning)" />
                <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <GatewayLogo className={styles.logoIcon} />
            <span className={styles.logoText}>
              Shyoran<span className={styles.logoTextHighlight}>Courses</span>
            </span>
          </div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {children}

        {footerText && footerLink && footerLinkText && (
          <p className={styles.switch}>
            {footerText}
            <Link to={footerLink} className={styles.link}>
              {footerLinkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthLayout
