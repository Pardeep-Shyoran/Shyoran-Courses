import { Link } from 'react-router-dom'
import GatewayLogo from '../../components/GatewayLogo/GatewayLogo'
import styles from './Auth.module.css'

const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  badge = 'Learning Workspace',
  footerText, 
  footerLink, 
  footerLinkText 
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          {badge && (
            <div className={styles.badge}>
              <span className={styles.badgePulse} />
              <span className={styles.badgeText}>{badge}</span>
            </div>
          )}

          <Link to="/" className={styles.logo} title="Return to Homepage">
            <GatewayLogo className={styles.logoIcon} />
            <span className={styles.logoText}>
              Shyoran<span className={styles.logoTextHighlight}>Courses</span>
            </span>
          </Link>
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

        <div className={styles.trustBanner}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={styles.trustIcon}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>End-to-End Encrypted Session • 100% Free & Open</span>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout

