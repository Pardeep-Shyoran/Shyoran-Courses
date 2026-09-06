import React, { useState, useEffect } from 'react'
import { updateProfile } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import styles from './DashboardSettings.module.css'

const PRESET_COLORS = [
  { name: 'Saffron (Primary)', value: '#e2583e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber Gold', value: '#f59e0b' },
  { name: 'Rose Red', value: '#f43f5e' },
  { name: 'Cyan Neon', value: '#06b6d4' },
  { name: 'Indigo Aura', value: '#6366f1' },
  { name: 'Violet Spark', value: '#8b5cf6' },
  { name: 'Deep Slate', value: '#475569' },
]

const AVAILABLE_INTERESTS = [
  'Web Development',
  'Data Science',
  'Artificial Intelligence',
  'Mobile Development',
  'System Design',
  'DevOps & Cloud',
  'UI/UX Design',
  'Cybersecurity',
  'Algorithms & LeetCode',
  'Backend Engineering',
]

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2]

const DashboardProfile = ({ user, setUser }) => {
  const { updateUser } = useAuth()

  // Active Settings Section: 'profile' | 'habits' | 'player' | 'notifications' | 'security'
  const [activeSection, setActiveSection] = useState('profile')

  // Status feedback toast
  const [savedToast, setSavedToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Confirmation Modal state
  const [modalConfig, setModalConfig] = useState(null)

  // 1. Profile State
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#e2583e')
  const [selectedInterests, setSelectedInterests] = useState(user?.interests || [])

  // 2. Habits & Appearance State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || user?.preferences?.theme || 'dark'
    }
    return 'dark'
  })
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 30)
  const [studyDaysSchedule, setStudyDaysSchedule] = useState(user?.preferences?.studyDaysSchedule || 'all')
  const [defaultTab, setDefaultTab] = useState(user?.preferences?.defaultTab || 'overview')

  // 3. Player State
  const [playbackSpeed, setPlaybackSpeed] = useState(user?.preferences?.playbackSpeed ?? 1)
  const [autoplay, setAutoplay] = useState(user?.preferences?.autoplay ?? true)
  const [autoMarkThreshold, setAutoMarkThreshold] = useState(user?.preferences?.autoMarkThreshold ?? 90)
  const [soundEffects, setSoundEffects] = useState(user?.preferences?.soundEffects ?? true)

  // 4. Notifications State
  const [emailReminders, setEmailReminders] = useState(user?.preferences?.emailReminders ?? true)
  const [streakAlerts, setStreakAlerts] = useState(user?.preferences?.streakAlerts ?? true)
  const [reminderTime, setReminderTime] = useState(user?.preferences?.reminderTime || '20:00')
  const [browserNotificationsGranted, setBrowserNotificationsGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  )

  // 5. Security & Passwords State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  // Sync when user prop updates
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setBio(user.bio || '')
      setAvatarColor(user.avatarColor || '#e2583e')
      setSelectedInterests(user.interests || [])
      setDailyGoal(user.dailyGoal || 30)
      setStudyDaysSchedule(user.preferences?.studyDaysSchedule || 'all')
      setDefaultTab(user.preferences?.defaultTab || 'overview')
      setPlaybackSpeed(user.preferences?.playbackSpeed ?? 1)
      setAutoplay(user.preferences?.autoplay ?? true)
      setAutoMarkThreshold(user.preferences?.autoMarkThreshold ?? 90)
      setSoundEffects(user.preferences?.soundEffects ?? true)
      setEmailReminders(user.preferences?.emailReminders ?? true)
      setStreakAlerts(user.preferences?.streakAlerts ?? true)
      setReminderTime(user.preferences?.reminderTime || '20:00')
      if (user.preferences?.theme) {
        setTheme(user.preferences.theme)
      }
    }
  }, [user])

  const showToast = (message) => {
    setSavedToast(message)
    setTimeout(() => {
      setSavedToast(null)
    }, 3500)
  }

  // Handle Instant Theme Change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
    handleSaveSection(
      { preferences: { theme: newTheme } },
      `Switched to ${newTheme === 'light' ? 'Warm Sand Light' : 'Dark Indigo'} theme!`
    )
  }

  // Play micro chime sound preview
  const playPreviewChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)
        gain.gain.setValueAtTime(0.12, now + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 0.25)
      })
    } catch (e) {
      console.error('Audio preview not supported', e)
    }
  }

  // Generic settings save handler
  const handleSaveSection = async (customPayload = {}, successMessage = 'Preferences saved successfully!') => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name,
        email,
        bio,
        avatarColor,
        dailyGoal: Number(dailyGoal),
        interests: selectedInterests,
        preferences: {
          theme,
          autoplay,
          playbackSpeed: Number(playbackSpeed),
          autoMarkThreshold: Number(autoMarkThreshold),
          soundEffects,
          emailReminders,
          streakAlerts,
          reminderTime,
          studyDaysSchedule,
          defaultTab,
          ...customPayload.preferences,
        },
        ...customPayload,
      }

      const data = await updateProfile(payload)
      updateUser(data.user)
      if (typeof setUser === 'function') {
        setUser(data.user)
      }
      showToast(successMessage)
    } catch (err) {
      setError(err.message || 'Failed to update preferences.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Interest Tag Toggle
  const handleToggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  // Calculate Password Strength
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'var(--border-color)' }
    let score = 0
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 10) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 2) return { score: 1, label: 'Weak', color: '#ef4444' }
    if (score <= 4) return { score: 2, label: 'Good', color: '#f59e0b' }
    return { score: 3, label: 'Strong', color: '#10b981' }
  }

  const pwdStrength = calculatePasswordStrength(newPassword)

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!currentPassword) {
      setPasswordError('Current password is required.')
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      setPasswordLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.')
      setPasswordLoading(false)
      return
    }

    try {
      await updateProfile({
        currentPassword,
        newPassword,
      })
      setPasswordSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated securely!')
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Verify your current password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Browser Notification Requester & Tester
  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      alert('Desktop notifications are not supported in this browser.')
      return
    }

    const permission = await Notification.requestPermission()
    setBrowserNotificationsGranted(permission === 'granted')

    if (permission === 'granted') {
      new Notification('Shyoran Courses ✦ Study Reminder', {
        body: `Ready for your daily ${dailyGoal} minute learning session? Your streak is counting on you!`,
        icon: '/favicon.ico',
      })
      showToast('Notification test sent!')
    } else {
      alert('Notification permission was not granted. Check browser permissions.')
    }
  }

  // Export Account Progress Data
  const handleExportData = () => {
    const exportObject = {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp || 0,
        bio: user.bio,
        avatarColor: user.avatarColor,
        dailyGoal: user.dailyGoal,
        interests: user.interests,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
      exportedAt: new Date().toISOString(),
      app: 'Shyoran Courses Learning Workspace',
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute(
      'download',
      `shyoran-courses-account-${user.name ? user.name.toLowerCase().replace(/\s+/g, '-') : 'data'}.json`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showToast('Account data exported successfully!')
  }

  // Danger Zone: Reset Local Progress Cache
  const handleResetCache = () => {
    setModalConfig({
      title: 'Reset Local Study Cache?',
      message: 'This will clear your local recent video position, cached player tab state, and dismissed announcements. Your enrolled courses and database streaks will remain safe.',
      actionText: 'Yes, Clear Local Cache',
      onConfirm: () => {
        localStorage.removeItem('lastPlayed')
        localStorage.removeItem('dismissedHeroBanner')
        setModalConfig(null)
        showToast('Local player cache cleared!')
      },
    })
  }

  const initials = (name || user?.name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  // Monthly commitment calculation
  const hoursPerMonth = ((dailyGoal * 30) / 60).toFixed(1)

  return (
    <div className={styles.settingsContainer}>
      {/* Header Banner */}
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>
            <span>⚙️ Settings & Learning Engine</span>
          </h2>
          <p className={styles.paneSubtitle}>
            Configure your learning identity, daily study habits, player defaults, smart reminder schedules, and privacy controls.
          </p>
        </div>

        {savedToast && (
          <div className={styles.savedToast}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{savedToast}</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Command Center */}
      <div className={styles.settingsLayout}>
        {/* Left Column: User Snapshot & Navigation */}
        <div className={styles.settingsSidebar}>
          <div className={styles.userQuickCard}>
            <div className={styles.cardGlowBg} style={{ backgroundColor: avatarColor }}></div>
            <div className={styles.userCardHeader}>
              <div
                className={styles.liveAvatar}
                style={{ backgroundColor: avatarColor, boxShadow: `0 4px 18px ${avatarColor}66` }}
              >
                {initials}
              </div>
              <div className={styles.userCardMeta}>
                <h4 className={styles.userCardName}>{name || user?.name}</h4>
                <span className={styles.userCardRoleBadge}>✦ {user?.role || 'STUDENT'}</span>
              </div>
            </div>

            <div className={styles.quickStatsRow}>
              <div className={styles.statMiniBox}>
                <span className={styles.statMiniLabel}>Daily Target</span>
                <span className={styles.statMiniVal}>{dailyGoal}m / day</span>
              </div>
              <div className={styles.statMiniBox}>
                <span className={styles.statMiniLabel}>Total XP</span>
                <span className={styles.statMiniVal}>{user?.xp || 0} XP</span>
              </div>
            </div>
            <div className={styles.sidebarThemeToggle}>
              <span className={styles.sidebarThemeLabel}>
                <span>{theme === 'light' ? '☀️' : '🌙'}</span>
                <span>Theme Mode</span>
              </span>
              <div className={styles.themePillSwitch}>
                <button
                  type="button"
                  className={`${styles.themePillBtn} ${theme === 'dark' ? styles.themePillBtnActive : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  🌙 Dark
                </button>
                <button
                  type="button"
                  className={`${styles.themePillBtn} ${theme === 'light' ? styles.themePillBtnActive : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  ☀️ Light
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className={styles.navMenu}>
            <button
              type="button"
              className={`${styles.navMenuItem} ${activeSection === 'profile' ? styles.navMenuItemActive : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <div className={styles.navItemIcon}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span className={styles.navItemLabel}>Profile & Identity</span>
            </button>

            <button
              type="button"
              className={`${styles.navMenuItem} ${activeSection === 'habits' ? styles.navMenuItemActive : ''}`}
              onClick={() => setActiveSection('habits')}
            >
              <div className={styles.navItemIcon}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <span className={styles.navItemLabel}>Habits & Goals</span>
            </button>

            <button
              type="button"
              className={`${styles.navMenuItem} ${activeSection === 'player' ? styles.navMenuItemActive : ''}`}
              onClick={() => setActiveSection('player')}
            >
              <div className={styles.navItemIcon}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <span className={styles.navItemLabel}>Player & Study Engine</span>
            </button>

            <button
              type="button"
              className={`${styles.navMenuItem} ${activeSection === 'notifications' ? styles.navMenuItemActive : ''}`}
              onClick={() => setActiveSection('notifications')}
            >
              <div className={styles.navItemIcon}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <span className={styles.navItemLabel}>Smart Reminders</span>
              <span className={styles.navItemPill}>Active</span>
            </button>

            <button
              type="button"
              className={`${styles.navMenuItem} ${activeSection === 'security' ? styles.navMenuItemActive : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <div className={styles.navItemIcon}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span className={styles.navItemLabel}>Security & Privacy</span>
            </button>
          </div>
        </div>

        {/* Right Column: Active Section Panels */}
        <div className={styles.settingsPanel}>
          {error && <div className={styles.savedToast} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>{error}</div>}

          {/* ============================================================
              1. PROFILE & IDENTITY
              ============================================================ */}
          {activeSection === 'profile' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h3 className={styles.sectionHeaderTitle}>
                    <span>👤 Profile & Personalization</span>
                  </h3>
                  <p className={styles.sectionHeaderDesc}>
                    Update your public display name, theme accent color, headline, and skill domain interests.
                  </p>
                </div>
              </div>

              {/* Avatar Accent Picker */}
              <div className={styles.avatarSectionBox}>
                <div
                  className={styles.avatarPreviewLarge}
                  style={{ backgroundColor: avatarColor, boxShadow: `0 6px 24px ${avatarColor}55` }}
                >
                  {initials}
                </div>
                <div className={styles.avatarPickerContent}>
                  <div className={styles.labelWrapper}>
                    <label className={styles.formLabel}>Avatar Theme Color</label>
                    <span className={styles.formHint}>Select your signature profile glow</span>
                  </div>
                  <div className={styles.colorChipsList}>
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        className={`${styles.colorChipBtn} ${avatarColor === c.value ? styles.colorChipBtnActive : ''}`}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setAvatarColor(c.value)}
                        title={c.name}
                      >
                        {avatarColor === c.value && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workspace Appearance & Theme Selector */}
              <div className={styles.formGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.formLabel}>
                    <span>🎨</span> Workspace Appearance & Theme
                  </label>
                  <span className={styles.formHint}>Select your visual theme preference</span>
                </div>

                <div className={styles.themeGrid}>
                  <div
                    className={`${styles.themeCard} ${theme === 'dark' ? styles.themeCardActive : ''}`}
                    onClick={() => handleThemeChange('dark')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.themeCardHeader}>
                      <div className={styles.themeIconTitle}>
                        <span>🌙</span>
                        <span>Dark Indigo (Default)</span>
                      </div>
                      {theme === 'dark' && (
                        <div className={styles.themeCheckmark}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className={`${styles.themePreviewBox} ${styles.themePreviewDark}`}>
                      <div className={`${styles.themeMiniCard} ${styles.themeMiniCardDark}`}>
                        <div className={styles.themeMiniDot} style={{ backgroundColor: avatarColor }}></div>
                        <div className={styles.themeMiniBar} style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}></div>
                      </div>
                      <div className={`${styles.themeMiniCard} ${styles.themeMiniCardDark}`} style={{ flex: 1.5 }}>
                        <div className={styles.themeMiniBar} style={{ backgroundColor: 'var(--primary-color)', width: '80%' }}></div>
                        <div className={styles.themeMiniBar} style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: '50%' }}></div>
                      </div>
                    </div>
                    <p className={styles.themeDesc}>
                      Deep midnight obsidian palette with vibrant saffron accents. Easy on eyes during long night sessions.
                    </p>
                  </div>

                  <div
                    className={`${styles.themeCard} ${theme === 'light' ? styles.themeCardActive : ''}`}
                    onClick={() => handleThemeChange('light')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.themeCardHeader}>
                      <div className={styles.themeIconTitle}>
                        <span>☀️</span>
                        <span>Warm Sand Light Mode</span>
                      </div>
                      {theme === 'light' && (
                        <div className={styles.themeCheckmark}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className={`${styles.themePreviewBox} ${styles.themePreviewLight}`}>
                      <div className={`${styles.themeMiniCard} ${styles.themeMiniCardLight}`}>
                        <div className={styles.themeMiniDot} style={{ backgroundColor: avatarColor }}></div>
                        <div className={styles.themeMiniBar} style={{ backgroundColor: 'rgba(15, 18, 29, 0.4)' }}></div>
                      </div>
                      <div className={`${styles.themeMiniCard} ${styles.themeMiniCardLight}`} style={{ flex: 1.5 }}>
                        <div className={styles.themeMiniBar} style={{ backgroundColor: '#d84f33', width: '80%' }}></div>
                        <div className={styles.themeMiniBar} style={{ backgroundColor: 'rgba(15, 18, 29, 0.2)', width: '50%' }}></div>
                      </div>
                    </div>
                    <p className={styles.themeDesc}>
                      Clean ivory sand & cream palette with terracotta contrast. High clarity for bright daytime study.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className={styles.formGridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={styles.formInput}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.labelWrapper}>
                    <label className={styles.formLabel}>Email Address</label>
                    <span
                      className={styles.formHint}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--text-tertiary)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      Cannot be changed
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    className={styles.formInput}
                    style={{
                      cursor: 'not-allowed',
                      opacity: 0.72,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    }}
                    title="Account email address cannot be modified"
                  />
                  <span className={styles.formHint} style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)' }}>
                    Email is permanently associated with your account authentication.
                  </span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.formLabel}>Bio / Learning Mission</label>
                  <span className={styles.formHint}>{bio.length}/180 characters</span>
                </div>
                <textarea
                  value={bio}
                  maxLength={180}
                  onChange={e => setBio(e.target.value)}
                  className={styles.formTextarea}
                  rows="3"
                  placeholder="Share what you are currently mastering, your career goals, or favourite tech stack..."
                />
              </div>

              {/* Interests Multi-Select */}
              <div className={styles.formGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.formLabel}>Skill Domains & Interests</label>
                  <span className={styles.formHint}>Tailors recommendations and quick tracks</span>
                </div>
                <div className={styles.interestsContainer}>
                  {AVAILABLE_INTERESTS.map(interest => {
                    const isSelected = selectedInterests.includes(interest)
                    return (
                      <button
                        key={interest}
                        type="button"
                        className={`${styles.interestTag} ${isSelected ? styles.interestTagActive : ''}`}
                        onClick={() => handleToggleInterest(interest)}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{interest}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={styles.sectionActionFooter}>
                <button
                  type="button"
                  className={styles.saveSectionBtn}
                  onClick={() => handleSaveSection({}, 'Profile & Identity saved successfully!')}
                  disabled={loading}
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              2. HABITS & LEARNING GOALS
              ============================================================ */}
          {activeSection === 'habits' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h3 className={styles.sectionHeaderTitle}>
                    <span>🎯 Habits & Learning Goals</span>
                  </h3>
                  <p className={styles.sectionHeaderDesc}>
                    Set realistic daily study targets and select your weekly commitment rhythm.
                  </p>
                </div>
              </div>

              {/* Goal Presets & Slider */}
              <div className={styles.formGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.formLabel}>Daily Target Study Duration</label>
                  <span className={styles.formHint} style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                    {dailyGoal} Minutes per day
                  </span>
                </div>

                <div className={styles.goalPresetGroup}>
                  {[15, 30, 45, 60, 90, 120].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      className={`${styles.goalPillBtn} ${Number(dailyGoal) === mins ? styles.goalPillBtnActive : ''}`}
                      onClick={() => setDailyGoal(mins)}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>

                <div className={styles.sliderRangeWrapper} style={{ marginTop: '8px' }}>
                  <input
                    type="range"
                    min="10"
                    max="180"
                    step="5"
                    value={dailyGoal}
                    onChange={e => setDailyGoal(Number(e.target.value))}
                    className={styles.sliderTrack}
                  />
                </div>
              </div>

              {/* Projected Commitment Card */}
              <div className={styles.projectionCard}>
                <div className={styles.projectionText}>
                  <span className={styles.projectionTitle}>
                    <span>📈</span> Projected Habit Momentum
                  </span>
                  <span className={styles.projectionSub}>
                    At <strong>{dailyGoal} minutes/day</strong>, you will invest approx:
                  </span>
                </div>
                <div className={styles.projectionMetric}>
                  ~{hoursPerMonth} <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>hrs / month</span>
                </div>
              </div>

              {/* Schedule & Default Landing Tab */}
              <div className={styles.formGridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Study Days Schedule</label>
                  <select
                    value={studyDaysSchedule}
                    onChange={e => setStudyDaysSchedule(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="all">Every Day (7 Days / Week - Maximum Streak)</option>
                    <option value="weekdays">Weekdays Only (Monday - Friday)</option>
                    <option value="weekends">Weekends Heavy (Saturday & Sunday)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Default Dashboard Landing Tab</label>
                  <select
                    value={defaultTab}
                    onChange={e => setDefaultTab(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="overview">Overview (Tracks, Resume Hero & Milestones)</option>
                    <option value="analytics">Learning Analytics (Telemetry & Breakdown)</option>
                    <option value="checklist">Checklist & Streaks (Heatmap & Timetable)</option>
                    <option value="rewards">Rewards & Certificates (Badges & PDF)</option>
                  </select>
                </div>
              </div>

              <div className={styles.sectionActionFooter}>
                <button
                  type="button"
                  className={styles.saveSectionBtn}
                  onClick={() => handleSaveSection({}, 'Habit goals updated successfully!')}
                  disabled={loading}
                >
                  {loading ? 'Saving Changes...' : 'Save Habit Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              3. PLAYER & STUDY ENGINE
              ============================================================ */}
          {activeSection === 'player' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h3 className={styles.sectionHeaderTitle}>
                    <span>🎬 Video Player & Study Engine</span>
                  </h3>
                  <p className={styles.sectionHeaderDesc}>
                    Tailor your default playback rate, autoplay transitions, completion threshold, and audio chimes.
                  </p>
                </div>
              </div>

              {/* Playback Speed */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Default Video Playback Speed</label>
                <div className={styles.goalPresetGroup}>
                  {PLAYBACK_SPEEDS.map(speed => (
                    <button
                      key={speed}
                      type="button"
                      className={`${styles.goalPillBtn} ${Number(playbackSpeed) === speed ? styles.goalPillBtnActive : ''}`}
                      onClick={() => setPlaybackSpeed(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Autoplay Switch */}
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <h4 className={styles.toggleTitle}>
                    <span>⚡</span> Continuous Autoplay
                  </h4>
                  <p className={styles.toggleDesc}>
                    Automatically advance to and start the next lesson once the current video finishes.
                  </p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={autoplay}
                    onChange={e => setAutoplay(e.target.checked)}
                  />
                  <span className={styles.sliderRound}></span>
                </label>
              </div>

              {/* Auto-Mark Video Completed Threshold */}
              <div className={styles.formGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.formLabel}>Auto-Mark Video Completed Threshold</label>
                  <span className={styles.formHint} style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                    {autoMarkThreshold}% of video duration
                  </span>
                </div>
                <div className={styles.sliderRangeWrapper}>
                  <input
                    type="range"
                    min="75"
                    max="98"
                    step="1"
                    value={autoMarkThreshold}
                    onChange={e => setAutoMarkThreshold(Number(e.target.value))}
                    className={styles.sliderTrack}
                  />
                </div>
                <span className={styles.formHint}>
                  When you reach this point in a lesson, it automatically registers as completed in your streak.
                </span>
              </div>

              {/* Audio Celebration Chime */}
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <h4 className={styles.toggleTitle}>
                    <span>🔔</span> Lesson Completion Audio Chime
                  </h4>
                  <p className={styles.toggleDesc}>
                    Play a subtle harmonic celebration sound when you mark a lesson or reach a milestone.
                  </p>
                </div>
                <div className={styles.inlineActionRow}>
                  <button
                    type="button"
                    className={styles.testNotificationBtn}
                    onClick={playPreviewChime}
                    title="Listen to sound preview"
                  >
                    🔊 Test Audio
                  </button>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={e => setSoundEffects(e.target.checked)}
                    />
                    <span className={styles.sliderRound}></span>
                  </label>
                </div>
              </div>

              <div className={styles.sectionActionFooter}>
                <button
                  type="button"
                  className={styles.saveSectionBtn}
                  onClick={() => handleSaveSection({}, 'Player preferences saved!')}
                  disabled={loading}
                >
                  {loading ? 'Saving Changes...' : 'Save Player Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              4. SMART REMINDERS & NOTIFICATIONS
              ============================================================ */}
          {activeSection === 'notifications' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h3 className={styles.sectionHeaderTitle}>
                    <span>🔔 Smart Reminders & Alerts</span>
                  </h3>
                  <p className={styles.sectionHeaderDesc}>
                    Configure reminder times, streak risk notifications, and browser alerts to maintain consistent habits.
                  </p>
                </div>
              </div>

              {/* Preferred Study Hour Time Picker */}
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <h4 className={styles.toggleTitle}>
                    <span>⏰</span> Daily Study Hour Reminder
                  </h4>
                  <p className={styles.toggleDesc}>
                    Choose your daily peak learning hour when you wish to receive prompts.
                  </p>
                </div>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className={styles.timeInput}
                />
              </div>

              {/* Email Reminders Toggle */}
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <h4 className={styles.toggleTitle}>
                    <span>✉️</span> Daily Motivational Email Reminders
                  </h4>
                  <p className={styles.toggleDesc}>
                    Receive friendly nudges with your pending lessons and streak updates.
                  </p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={emailReminders}
                    onChange={e => setEmailReminders(e.target.checked)}
                  />
                  <span className={styles.sliderRound}></span>
                </label>
              </div>

              {/* Midnight Streak Risk Alert */}
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <h4 className={styles.toggleTitle}>
                    <span>🔥</span> Streak At-Risk Midnight Warning
                  </h4>
                  <p className={styles.toggleDesc}>
                    Warn me 2 hours prior to IST midnight if no lesson has been logged for the day yet.
                  </p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={streakAlerts}
                    onChange={e => setStreakAlerts(e.target.checked)}
                  />
                  <span className={styles.sliderRound}></span>
                </label>
              </div>

              {/* Desktop Browser Notifications */}
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <h4 className={styles.toggleTitle}>
                    <span>🖥️</span> Desktop Browser Push Alerts
                  </h4>
                  <p className={styles.toggleDesc}>
                    Allow notifications directly in your desktop browser while studying.
                  </p>
                </div>
                <div className={styles.inlineActionRow}>
                  <button
                    type="button"
                    className={styles.testNotificationBtn}
                    onClick={handleRequestNotification}
                  >
                    {browserNotificationsGranted ? '✓ Send Test Push' : 'Enable & Test'}
                  </button>
                </div>
              </div>

              <div className={styles.sectionActionFooter}>
                <button
                  type="button"
                  className={styles.saveSectionBtn}
                  onClick={() => handleSaveSection({}, 'Notification preferences saved!')}
                  disabled={loading}
                >
                  {loading ? 'Saving Changes...' : 'Save Notification Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              5. SECURITY, DATA & PRIVACY
              ============================================================ */}
          {activeSection === 'security' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h3 className={styles.sectionHeaderTitle}>
                    <span>🔒 Security & Data Privacy</span>
                  </h3>
                  <p className={styles.sectionHeaderDesc}>
                    Change your password, export your entire learning portfolio, or manage local cache.
                  </p>
                </div>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.labelWrapper}>
                  <label className={styles.formLabel}>Change Password</label>
                  <button
                    type="button"
                    className={styles.resetBtn}
                    style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                  </button>
                </div>

                {passwordError && <div className={styles.savedToast} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>{passwordError}</div>}
                {passwordSuccess && <div className={styles.savedToast}>{passwordSuccess}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.formHint}>Current Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGridTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.formHint}>New Password (min 6 characters)</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className={styles.formInput}
                    />
                    {newPassword && (
                      <div className={styles.passwordStrengthBox}>
                        <div className={styles.strengthBarContainer}>
                          <div
                            className={styles.strengthBarSegment}
                            style={{ backgroundColor: pwdStrength.score >= 1 ? pwdStrength.color : 'var(--border-color)' }}
                          ></div>
                          <div
                            className={styles.strengthBarSegment}
                            style={{ backgroundColor: pwdStrength.score >= 2 ? pwdStrength.color : 'var(--border-color)' }}
                          ></div>
                          <div
                            className={styles.strengthBarSegment}
                            style={{ backgroundColor: pwdStrength.score >= 3 ? pwdStrength.color : 'var(--border-color)' }}
                          ></div>
                        </div>
                        <span className={styles.strengthText} style={{ color: pwdStrength.color }}>
                          Strength: {pwdStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formHint}>Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className={styles.saveSectionBtn}
                    disabled={passwordLoading || !currentPassword || !newPassword}
                  >
                    {passwordLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>

              {/* Data Export Box */}
              <div className={styles.exportCard}>
                <div className={styles.toggleInfo}>
                  <h4 className={styles.toggleTitle}>
                    <span>📥</span> Export Portfolio & Account Data
                  </h4>
                  <p className={styles.toggleDesc}>
                    Download a comprehensive JSON snapshot of your profile, courses, notes, XP, and streak telemetry.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.exportBtn}
                  onClick={handleExportData}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download JSON</span>
                </button>
              </div>

              {/* Danger Zone */}
              <div className={`${styles.sectionCard} ${styles.dangerZoneCard}`}>
                <div>
                  <h4 className={`${styles.sectionHeaderTitle} ${styles.dangerHeaderTitle}`}>
                    <span>⚠️ Danger Zone</span>
                  </h4>
                  <p className={styles.sectionHeaderDesc}>
                    Actions here clear local storage artifacts or reset study caches.
                  </p>
                </div>

                <div className={styles.dangerActionRow}>
                  <div className={styles.toggleInfo}>
                    <h5 style={{ margin: '0 0 2px 0', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      Clear Local Video & Player Cache
                    </h5>
                    <p className={styles.toggleDesc}>
                      Clears local playback bookmark timestamps without affecting your registered database progress.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={handleResetCache}
                  >
                    Clear Player Cache
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalConfig && (
        <div className={styles.modalOverlay} onClick={() => setModalConfig(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{modalConfig.title}</h3>
            <p className={styles.modalMessage}>{modalConfig.message}</p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setModalConfig(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmDangerBtn}
                onClick={modalConfig.onConfirm}
              >
                {modalConfig.actionText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardProfile
