import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Layout.module.css'
import GatewayLogo from '../GatewayLogo/GatewayLogo'
import CommandPalette from '../CommandPalette/CommandPalette'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'
import Footer from '../Footer/Footer'
import AtmosphericBackground from '../AtmosphericBackground/AtmosphericBackground'
import { useAuth } from '../../context/AuthContext'

const Layout = ({ children }) => {
  const { token, user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNavHidden, setIsNavHidden] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'privacy', 'terms', 'changelog'
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const handleHashLinkClick = (e, hashId) => {
    if (location.pathname === '/') {
      e.preventDefault()
      const el = document.getElementById(hashId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

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

  const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : 'U'

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    setIsProfileOpen(false)
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      {/* Global Atmospheric Background & Seamless Geometric Dot Matrix */}
      <AtmosphericBackground />

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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>Home</span>
                </Link>
              </li>

              {/* About and Contact are only visible when NOT logged in */}
              {(!token || !user) && (
                <>
                  <li>
                    <Link to="/about" className={`${styles.navLink} ${isActive('/about') ? styles.activeLink : ''}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <span>About</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className={`${styles.navLink} ${isActive('/contact') ? styles.activeLink : ''}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <span>Contact</span>
                    </Link>
                  </li>
                </>
              )}

              {/* Dashboard and Courses are visible when logged in */}
              {token && user && (
                <>
                  <li>
                    <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeLink : ''}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <button
              className={styles.desktopSearchBtn}
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Quick Search"
              title="Search (⌘K)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <kbd className={styles.desktopSearchKbd}>⌘K</kbd>
            </button>
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
                  <div className={styles.profileDropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownAvatarLarge}>
                        {userInitial}
                      </div>
                      <div className={styles.dropdownUserInfo}>
                        <span className={styles.dropdownName}>{user.name}</span>
                        <span className={styles.dropdownEmail}>{user.email}</span>
                        <span className={styles.roleBadge}>{user.role || 'Learner'}</span>
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

          {/* About and Contact only when NOT logged in */}
          {(!token || !user) && (
            <>
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
            </>
          )}

          {/* Dashboard and Courses only when logged in */}
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

      {/* Global Brand Footer */}
      <Footer onOpenModal={setActiveModal} />

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

      {/* Interactive Modal for Privacy, Terms, and Changelog */}
      {activeModal && (
        <div className={styles.legalModalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.legalModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.legalModalHeader}>
              <div className={styles.legalModalTitleGroup}>
                <span className={styles.legalModalIcon}>
                  {activeModal === 'privacy' && '🛡️'}
                  {activeModal === 'terms' && '📜'}
                  {activeModal === 'changelog' && '🚀'}
                </span>
                <h3 className={styles.legalModalTitle}>
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms of Service'}
                  {activeModal === 'changelog' && 'Changelog & Release Notes'}
                </h3>
              </div>
              <button 
                className={styles.legalModalCloseBtn} 
                onClick={() => setActiveModal(null)} 
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className={styles.legalModalBody}>
              {activeModal === 'privacy' && (
                <div className={styles.modalTextContent}>
                  <div className={styles.modalBadge}>Privacy First • Zero Telemetry Selling</div>
                  <p>At <strong>Shyoran Courses</strong>, we prioritize your focus and privacy above everything else. We operate under clear principles:</p>
                  <ul className={styles.modalList}>
                    <li><strong>No Algorithmic Tracking:</strong> We never track your cross-site browsing habits, sell data to third-party ad brokers, or analyze your watch patterns for commercial targeting.</li>
                    <li><strong>Study Workspace Security:</strong> Your notes, course checklists, and study milestones are encrypted and stored in your private database account.</li>
                    <li><strong>Official YouTube Embeds:</strong> Tutorials stream via YouTube's official player API without injecting unrequested advertisements into your workspace.</li>
                    <li><strong>Data Sovereignty:</strong> You can completely delete your courses, notes, and profile at any time directly through Account Settings.</li>
                  </ul>
                </div>
              )}

              {activeModal === 'terms' && (
                <div className={styles.modalTextContent}>
                  <div className={styles.modalBadge}>Open Educational Workspace</div>
                  <p>Welcome to <strong>Shyoran Courses</strong>. By utilizing this website, you agree to our fair-use educational guidelines:</p>
                  <ul className={styles.modalList}>
                    <li><strong>Free Educational Access:</strong> Shyoran Courses is an educational workspace designed to turn public YouTube playlists into structured self-paced curricula.</li>
                    <li><strong>Creator Rights:</strong> All video content, audio, and creator branding remain the intellectual property of their original YouTube publishers.</li>
                    <li><strong>Acceptable Service Use:</strong> You agree not to abuse automated scraping endpoints or violate YouTube's Terms of Service.</li>
                    <li><strong>Permanent Free Promise:</strong> Core tracking, markdown notes, streak telemetry, and verifiable digital certificate generation are free with zero subscription paywalls.</li>
                  </ul>
                </div>
              )}

              {activeModal === 'changelog' && (
                <div className={styles.modalTextContent}>
                  <div className={styles.changelogItem}>
                    <div className={styles.changelogHeader}>
                      <span className={styles.changelogVersionBadge}>v2.0 • Latest Release</span>
                      <span className={styles.changelogDate}>September 2026</span>
                    </div>
                    <h4>Modern Minimalist UI & YouTube Study Engine 2.0</h4>
                    <ul className={styles.modalList}>
                      <li>Full landing page redesign with ambient saffron-indigo lighting, geometric typography, and Bento Grid features.</li>
                      <li>Command-bar playlist parser with one-click sample triggers for React Masterclass, Python & DSA, and System Design.</li>
                      <li>Streamlined floating glass navbar with conditional auth links and quick search shortcut.</li>
                      <li>Modernized 4-column developer footer with live operational telemetry.</li>
                    </ul>
                  </div>

                  <div className={styles.changelogItem}>
                    <div className={styles.changelogHeader}>
                      <span className={styles.changelogVersionBadgeSecondary}>v1.5</span>
                      <span className={styles.changelogDate}>August 2026</span>
                    </div>
                    <h4>Verifiable Digital Certificates & jsPDF Engine</h4>
                    <ul className={styles.modalList}>
                      <li>Automated high-resolution PDF certificate generation upon completing 100% course syllabus.</li>
                      <li>Unique verifiable credential hashes suitable for LinkedIn and GitHub portfolios.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.legalModalFooter}>
              <button 
                className={styles.legalModalConfirmBtn} 
                onClick={() => setActiveModal(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout
