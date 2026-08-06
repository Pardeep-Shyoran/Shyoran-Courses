import React, { useState, useEffect } from 'react'
import { updateProfile } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import styles from '../Dashboard.module.css'

const PRESET_COLORS = [
  { name: 'Saffron (Default)', value: '#e2583e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Indigo', value: '#6366f1' },
]

const AVAILABLE_INTERESTS = [
  'Web Development',
  'Data Science',
  'Artificial Intelligence',
  'Mobile Development',
  'System Design',
  'DevOps & Cloud',
  'UI/UX Design',
  'Cybersecurity'
]

const DashboardProfile = ({ user, setUser }) => {
  const { updateUser } = useAuth()
  
  // Settings sub-nav state: 'profile' | 'goals' | 'notifications' | 'security'
  const [settingsTab, setSettingsTab] = useState('profile')

  // Form States
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#e2583e')
  const [selectedInterests, setSelectedInterests] = useState(user?.interests || [])

  // Learning Goals & Player
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 30)
  const [autoplay, setAutoplay] = useState(user?.preferences?.autoplay ?? true)
  const [playbackSpeed, setPlaybackSpeed] = useState(user?.preferences?.playbackSpeed ?? 1)

  // Notifications
  const [emailReminders, setEmailReminders] = useState(user?.preferences?.emailReminders ?? true)
  const [streakAlerts, setStreakAlerts] = useState(user?.preferences?.streakAlerts ?? true)

  // Passwords
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Submit status
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(null)

  // Sync state if user changes in parent
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '')
      setProfileEmail(user.email || '')
      setBio(user.bio || '')
      setAvatarColor(user.avatarColor || '#e2583e')
      setSelectedInterests(user.interests || [])
      setDailyGoal(user.dailyGoal || 30)
      setAutoplay(user.preferences?.autoplay ?? true)
      setPlaybackSpeed(user.preferences?.playbackSpeed ?? 1)
      setEmailReminders(user.preferences?.emailReminders ?? true)
      setStreakAlerts(user.preferences?.streakAlerts ?? true)
    }
  }, [user])

  if (!user) return null

  const handleInterestToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault()
    setProfileLoading(true)
    setProfileError(null)
    setProfileSuccess(null)

    if (newPassword) {
      if (!currentPassword) {
        setProfileError('Current password is required to set a new password.')
        setProfileLoading(false)
        return
      }
      if (newPassword !== confirmPassword) {
        setProfileError('New password and confirm password do not match.')
        setProfileLoading(false)
        return
      }
    }

    try {
      const payload = {
        name: profileName,
        email: profileEmail,
        bio,
        avatarColor,
        dailyGoal: Number(dailyGoal),
        interests: selectedInterests,
        preferences: {
          autoplay,
          playbackSpeed: Number(playbackSpeed),
          emailReminders,
          streakAlerts,
        }
      }

      if (newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }

      const data = await updateProfile(payload)
      updateUser(data.user)
      if (typeof setUser === 'function') {
        setUser(data.user)
      }
      setProfileSuccess('Account settings saved successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setProfileError(err.message || 'Failed to update settings.')
    } finally {
      setProfileLoading(false)
    }
  }

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
      app: 'Shyoran Courses'
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `shyoran-courses-account-data-${user.name.toLowerCase().replace(/\s+/g, '-')}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const initials = (profileName || user.name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className={styles.tabPane}>
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>Account Settings & Preferences</h2>
          <p className={styles.paneSubtitle}>Customize your profile, daily learning goals, player defaults, and security configurations.</p>
        </div>
      </div>

      {/* Main Settings Wrapper */}
      <div className={styles.profileLayoutGrid}>
        {/* Left Side: Overview & Navigation Cards */}
        <div className={styles.profileSidebar}>
          <div className={styles.profileCardFull}>
            <div className={styles.avatarSection}>
              <div 
                className={styles.profileAvatarLarge}
                style={{ backgroundColor: avatarColor, boxShadow: `0 4px 20px ${avatarColor}55` }}
              >
                {initials}
              </div>
              <div className={styles.avatarMeta}>
                <h4>{user.name}</h4>
                <span className={styles.roleBadge}>{user.role}</span>
              </div>
            </div>

            <p className={styles.userBioSnippet}>{bio || 'No bio added yet.'}</p>

            <div className={styles.detailsList}>
              <div className={styles.detailsItem}>
                <span className={styles.detailsLabel}>Daily Study Goal</span>
                <span className={styles.detailsValue}>{dailyGoal} mins/day</span>
              </div>
              <div className={styles.detailsItem}>
                <span className={styles.detailsLabel}>Total XP Earned</span>
                <span className={styles.detailsValue}>{user.xp || 0} XP</span>
              </div>
              <div className={styles.detailsItem}>
                <span className={styles.detailsLabel}>Member Since</span>
                <span className={styles.detailsValue}>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Subtabs Vertical Navigation */}
          <div className={styles.settingsNavGroup}>
            <button
              className={`${styles.settingsNavItem} ${settingsTab === 'profile' ? styles.settingsNavItemActive : ''}`}
              onClick={() => setSettingsTab('profile')}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Profile & Personalization</span>
            </button>

            <button
              className={`${styles.settingsNavItem} ${settingsTab === 'goals' ? styles.settingsNavItemActive : ''}`}
              onClick={() => setSettingsTab('goals')}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              <span>Learning & Player Preferences</span>
            </button>

            <button
              className={`${styles.settingsNavItem} ${settingsTab === 'notifications' ? styles.settingsNavItemActive : ''}`}
              onClick={() => setSettingsTab('notifications')}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span>Notifications & Reminders</span>
              <span className={styles.betaBadgeNav}>BETA</span>
            </button>

            <button
              className={`${styles.settingsNavItem} ${settingsTab === 'security' ? styles.settingsNavItemActive : ''}`}
              onClick={() => setSettingsTab('security')}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Security & Data Privacy</span>
            </button>
          </div>
        </div>

        {/* Right Side: Tab Form Panel */}
        <div className={styles.profileFormCard}>
          {profileError && <div className={styles.formError}>{profileError}</div>}
          {profileSuccess && <div className={styles.formSuccess}>{profileSuccess}</div>}

          <form onSubmit={handleSaveSettings} className={styles.profileEditForm}>
            {/* TAB 1: Profile & Bio */}
            {settingsTab === 'profile' && (
              <div className={styles.settingsSection}>
                <h3 className={styles.sectionHeading}>👤 Profile Information</h3>
                <p className={styles.sectionDescription}>Update your basic details, public headline, and theme colors.</p>

                <div className={styles.formRowTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel}>Full Name</label>
                    <input 
                      type="text" 
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className={styles.formInput}
                      required
                      disabled={profileLoading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel}>Email Address</label>
                    <input 
                      type="email" 
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className={styles.formInput}
                      required
                      disabled={profileLoading}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Bio / Headline</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about your learning goals and interests..."
                    className={styles.formTextarea}
                    rows="3"
                    disabled={profileLoading}
                  />
                </div>

                {/* Avatar Color Picker */}
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Avatar Theme Color</label>
                  <div className={styles.colorPaletteGrid}>
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        className={`${styles.colorChip} ${avatarColor === c.value ? styles.colorChipActive : ''}`}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setAvatarColor(c.value)}
                        title={c.name}
                      >
                        {avatarColor === c.value && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Learning Interests & Categories</label>
                  <div className={styles.interestsGrid}>
                    {AVAILABLE_INTERESTS.map(interest => {
                      const isSelected = selectedInterests.includes(interest)
                      return (
                        <button
                          key={interest}
                          type="button"
                          className={`${styles.interestChip} ${isSelected ? styles.interestChipSelected : ''}`}
                          onClick={() => handleInterestToggle(interest)}
                        >
                          {isSelected ? '✓ ' : '+ '}{interest}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Learning Goals & Player */}
            {settingsTab === 'goals' && (
              <div className={styles.settingsSection}>
                <h3 className={styles.sectionHeading}>🎯 Learning & Player Preferences</h3>
                <p className={styles.sectionDescription}>Set target daily study durations and customize video playback defaults.</p>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Daily Target Study Goal (Minutes)</label>
                  <div className={styles.goalPresetRow}>
                    {[15, 30, 45, 60, 90, 120].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        className={`${styles.goalBtn} ${Number(dailyGoal) === mins ? styles.goalBtnActive : ''}`}
                        onClick={() => setDailyGoal(mins)}
                      >
                        {mins} Mins
                      </button>
                    ))}
                  </div>

                  <div className={styles.customGoalContainer}>
                    <label className={styles.fieldLabel} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Or enter custom daily goal:
                    </label>
                    <div className={styles.customGoalInputGroup}>
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={dailyGoal || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1)
                          setDailyGoal(val)
                        }}
                        placeholder="e.g. 25"
                        className={styles.formInput}
                        style={{ maxWidth: '140px' }}
                      />
                      <span className={styles.goalUnitText}>Minutes / Day</span>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Default Video Playback Speed</label>
                  <select 
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className={styles.formSelect}
                  >
                    <option value={0.75}>0.75x (Slower)</option>
                    <option value={1}>1.0x (Normal)</option>
                    <option value={1.25}>1.25x (Faster)</option>
                    <option value={1.5}>1.5x (Speedy)</option>
                    <option value={2}>2.0x (Double Speed)</option>
                  </select>
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <h4 className={styles.toggleTitle}>Autoplay Next Lesson</h4>
                    <p className={styles.toggleDesc}>Automatically start playing the next course video upon completion.</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox"
                      checked={autoplay}
                      onChange={(e) => setAutoplay(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: Notifications */}
            {settingsTab === 'notifications' && (
              <div className={styles.settingsSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 className={styles.sectionHeading}>🔔 Notification Preferences</h3>
                  <span className={styles.betaBadge}>BETA</span>
                </div>
                <p className={styles.sectionDescription}>Manage how and when you receive reminders and streak alerts.</p>

                <div className={styles.betaNoticeBox}>
                  <div className={styles.betaIcon}>🧪</div>
                  <div>
                    <h4>Feature in Beta Testing</h4>
                    <p>Email reminders and device alerts are currently under active Beta testing. Enabling these toggles registers your preference for automated dispatches as testing rollout completes.</p>
                  </div>
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <h4 className={styles.toggleTitle}>Daily Study Email Reminders</h4>
                    <p className={styles.toggleDesc}>Receive daily motivational emails to keep up your study routine.</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox"
                      checked={emailReminders}
                      onChange={(e) => setEmailReminders(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <h4 className={styles.toggleTitle}>Streak Risk Warning Alerts</h4>
                    <p className={styles.toggleDesc}>Get notified before midnight if your current study streak is at risk of resetting.</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox"
                      checked={streakAlerts}
                      onChange={(e) => setStreakAlerts(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: Security & Data Privacy */}
            {settingsTab === 'security' && (
              <div className={styles.settingsSection}>
                <h3 className={styles.sectionHeading}>🔒 Password & Account Data</h3>
                <p className={styles.sectionDescription}>Update your password, view session metadata, and export your account data.</p>

                <div className={styles.passwordDivider}>
                  <span>🔒 Change Password</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="Required to set new password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.formInput}
                    disabled={profileLoading}
                  />
                </div>

                <div className={styles.formRowTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel}>New Password</label>
                    <input 
                      type="password" 
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.formInput}
                      disabled={profileLoading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel}>Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={styles.formInput}
                      disabled={profileLoading}
                    />
                  </div>
                </div>

                <div className={styles.dataExportBox}>
                  <div>
                    <h4>📥 Export Account Progress Data</h4>
                    <p>Download a formatted JSON snapshot of your profile, XP history, interests, and active preferences.</p>
                  </div>
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={handleExportData}
                  >
                    Download Data
                  </button>
                </div>
              </div>
            )}

            {/* Global Save Button */}
            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={styles.saveProfileBtn}
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving Changes...' : 'Save All Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DashboardProfile
