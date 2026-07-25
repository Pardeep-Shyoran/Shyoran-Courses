import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Layout.module.css'
import GatewayLogo from '../GatewayLogo/GatewayLogo'
import CommandPalette from '../CommandPalette/CommandPalette'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNavHidden, setIsNavHidden] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const diff = currentScrollY - lastScrollY

      if (currentScrollY <= 60) {
        setIsNavHidden(false)
      } else if (diff > 8) {
        setIsNavHidden(true)
      } else if (diff < -8) {
        setIsNavHidden(false)
      }

      lastScrollY = currentScrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const isActive = (path) => location.pathname === path

  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : 'U'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsMenuOpen(false)
    setIsProfileOpen(false)
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      <nav className={`${styles.navbar} ${isNavHidden && !isMenuOpen ? styles.navbarHidden : ''}`}>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className={`${styles.navLink} ${isActive('/about') ? styles.activeLink : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>About</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`${styles.navLink} ${isActive('/contact') ? styles.activeLink : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Contact</span>
                </Link>
              </li>
              {token && user && (
                <>
                  <li>
                    <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeLink : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/courses" className={`${styles.navLink} ${isActive('/courses') ? styles.activeLink : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      <span>Courses</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Desktop CTA / Profile Actions */}
          <div className={styles.desktopActions}>
            {token && user ? (
              <div className={styles.profileDropdownContainer} ref={profileRef}>
                <button
                  className={`${styles.profileTrigger} ${isProfileOpen ? styles.profileTriggerActive : ''}`}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  aria-label="User profile menu"
                >
                  <div className={styles.avatarCircle}>
                    {userInitial}
                    <span className={styles.statusDot}></span>
                  </div>
                  <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                  <svg
                    className={`${styles.chevronIcon} ${isProfileOpen ? styles.chevronOpen : ''}`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownAvatarLarge}>
                        {userInitial}
                      </div>
                      <div className={styles.dropdownUserInfo}>
                        <div className={styles.dropdownName}>{user.name}</div>
                        <div className={styles.dropdownEmail}>{user.email || 'Learner Account'}</div>
                        <span className={styles.roleBadge}>Learner</span>
                      </div>
                    </div>

                    <div className={styles.dropdownDivider} />

                    <div className={styles.dropdownItems}>
                      <Link
                        to="/dashboard"
                        className={`${styles.dropdownItem} ${isActive('/dashboard') ? styles.activeDropdownItem : ''}`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/courses"
                        className={`${styles.dropdownItem} ${isActive('/courses') ? styles.activeDropdownItem : ''}`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        <span>My Courses</span>
                      </Link>
                    </div>

                    <div className={styles.dropdownDivider} />

                    <button
                      className={styles.dropdownLogoutBtn}
                      onClick={handleLogout}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
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
            <button 
              className={styles.mobileNavSearchBtn} 
              onClick={() => {
                setIsMenuOpen(false)
                setIsCommandPaletteOpen(true)
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Quick Search</span>
              <kbd className={styles.searchShortcutKbd}>⌘K</kbd>
            </button>
          </li>
          <li>
            <Link to="/" className={`${styles.mobileNavLink} ${isActive('/') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/about" className={`${styles.mobileNavLink} ${isActive('/about') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>About</span>
            </Link>
          </li>
          <li>
            <Link to="/contact" className={`${styles.mobileNavLink} ${isActive('/contact') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Contact</span>
            </Link>
          </li>
          {token && user && (
            <>
              <li>
                <Link to="/dashboard" className={`${styles.mobileNavLink} ${isActive('/dashboard') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className={`${styles.mobileNavLink} ${isActive('/courses') ? styles.mobileActiveLink : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <span>Courses</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className={styles.drawerFooter}>
          {token && user ? (
            <div className={styles.mobileProfileSection}>
              <div className={styles.mobileUserBadge}>
                <div className={styles.avatarCircleSmall}>
                  {userInitial}
                </div>
                <div className={styles.mobileUserInfo}>
                  <span className={styles.mobileUserName}>{user.name}</span>
                  <span className={styles.mobileUserEmail}>{user.email || 'Learner'}</span>
                </div>
              </div>
              <button className={styles.mobileLogoutBtn} onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
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

      <main className={styles.main}>
        {(!location.pathname.startsWith('/courses/') || location.pathname === '/courses') && (
          <Breadcrumbs />
        )}
        {children}
      </main>

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

      {/* Floating Bottom-Left Quick Search Widget */}
      <button 
        className={styles.floatingSearchWidget}
        onClick={() => setIsCommandPaletteOpen(true)}
        aria-label="Quick Search (Cmd + K)"
        title="Quick Search (Cmd + K)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span className={styles.floatingSearchLabel}>Search...</span>
        <kbd className={styles.floatingKbd}>⌘K</kbd>
      </button>

      {/* Global Command Palette & Quick Search Modal */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        setIsOpen={setIsCommandPaletteOpen} 
      />
    </div>
  )
}

export default Layout
