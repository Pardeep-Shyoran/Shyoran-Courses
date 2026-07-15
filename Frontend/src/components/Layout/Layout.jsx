import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Layout.module.css'
import GatewayLogo from '../GatewayLogo/GatewayLogo'

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Link to="/" className={styles.logoLink}>
              <GatewayLogo className={styles.logoIcon} />
              <span className={styles.logoText}>Shyoran<span className={styles.logoTextHighlight}>Courses</span></span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className={styles.desktopNav}>
            <ul className={styles.navLinks}>
              <li>
                <Link to="/" className={`${styles.navLink} ${isActive('/') ? styles.activeLink : ''}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className={`${styles.navLink} ${isActive('/about') ? styles.activeLink : ''}`}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`${styles.navLink} ${isActive('/contact') ? styles.activeLink : ''}`}>
                  Contact
                </Link>
              </li>
              {token && user && (
                <>
                  <li>
                    <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeLink : ''}`}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/courses" className={`${styles.navLink} ${isActive('/courses') ? styles.activeLink : ''}`}>
                      Courses
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Desktop CTA / Profile Actions */}
          <div className={styles.desktopActions}>
            {token && user ? (
              <div className={styles.profileSection}>
                <div className={styles.userBadge}>
                  <span className={styles.userIcon}>👤</span>
                  <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                  <span className={styles.statusDot}></span>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link to="/login" className={styles.loginBtn}>
                  Login
                </Link>
                <Link to="/register" className={styles.registerBtn}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className={`${styles.menuToggle} ${isMenuOpen ? styles.toggleActive : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <span className={styles.toggleLine}></span>
            <span className={styles.toggleLine}></span>
            <span className={styles.toggleLine}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div className={`${styles.mobileDrawer} ${isMenuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.logo}>
            <Link to="/" className={styles.logoLink} onClick={() => setIsMenuOpen(false)}>
              <GatewayLogo className={styles.logoIcon} />
              <span className={styles.logoText}>Shyoran<span className={styles.logoTextHighlight}>Courses</span></span>
            </Link>
          </div>
          <button className={styles.drawerClose} onClick={() => setIsMenuOpen(false)}>✕</button>
        </div>

        <ul className={styles.mobileNavLinks}>
          <li>
            <Link to="/" className={`${styles.mobileNavLink} ${isActive('/') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={`${styles.mobileNavLink} ${isActive('/about') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className={`${styles.mobileNavLink} ${isActive('/contact') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </li>
          {token && user && (
            <>
              <li>
                <Link to="/dashboard" className={`${styles.mobileNavLink} ${isActive('/dashboard') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/courses" className={`${styles.mobileNavLink} ${isActive('/courses') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
                  Courses
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className={styles.drawerFooter}>
          {token && user ? (
            <div className={styles.mobileProfileSection}>
              <div className={styles.mobileUserBadge}>
                <span className={styles.userIcon}>👤</span>
                <span className={styles.mobileUserName}>{user.name}</span>
              </div>
              <button className={styles.mobileLogoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.mobileAuthButtons}>
              <Link to="/login" className={styles.mobileLoginBtn} onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className={styles.mobileRegisterBtn} onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      <div 
        className={`${styles.drawerOverlay} ${isMenuOpen ? styles.overlayVisible : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        {/* Subtle Torana Line Model Background */}
        <div className={styles.footerMotif}>
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
            <circle cx="100" cy="100" r="18" fill="url(#sunriseGlowFooter)" opacity="0.3" />

            <defs>
              <radialGradient id="sunriseGlowFooter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--warning)" />
                <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
        <div className={styles.footerContainer}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <Link to="/" className={styles.footerLogo}>
                <GatewayLogo className={styles.logoIcon} />
                <span className={styles.logoText}>
                  Shyoran<span className={styles.logoTextHighlight}>Courses</span>
                </span>
              </Link>
              <p className={styles.footerTagline}>
                Convert YouTube playlists into interactive workspaces. Learn, take notes, and track progress.
              </p>
            </div>
            
            <nav className={styles.footerNav}>
              <Link to="/" className={styles.footerNavLink}>Home</Link>
              <Link to="/about" className={styles.footerNavLink}>About</Link>
              <Link to="/contact" className={styles.footerNavLink}>Contact</Link>
              {token ? (
                <Link to="/dashboard" className={styles.footerNavLink}>Dashboard</Link>
              ) : (
                <Link to="/login" className={styles.footerNavLink}>Login</Link>
              )}
            </nav>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerBottom}>
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} Shyoran Courses. All rights reserved.
            </p>
            <div className={styles.footerStatus}>
              <span className={styles.statusDot}></span>
              <span className={styles.statusText}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
