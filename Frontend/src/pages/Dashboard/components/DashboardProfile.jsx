import React, { useState } from 'react'
import { updateProfile } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import styles from '../Dashboard.module.css'

const DashboardProfile = ({ user, setUser }) => {
  const { updateUser } = useAuth()
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(null)

  if (!user) return null

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError(null)
    setProfileSuccess(null)
    try {
      const payload = { name: profileName, email: profileEmail }
      if (newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }
      const data = await updateProfile(payload)
      updateUser(data.user)
      if (typeof setUser === 'function') {
        setUser(data.user)
      }
      setProfileSuccess('Profile updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className={styles.tabPane}>
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>Account Settings</h2>
          <p className={styles.paneSubtitle}>Manage your profile details and update security configurations.</p>
        </div>
      </div>

      <div className={styles.profileLayoutGrid}>
        {/* Left side details */}
        <div className={styles.profileCardFull}>
          <h3>Overview</h3>
          <div className={styles.avatarSection}>
            <div className={styles.profileAvatarLarge}>{initials}</div>
            <div className={styles.avatarMeta}>
              <h4>{user.name}</h4>
              <span className={styles.roleBadge}>{user.role}</span>
            </div>
          </div>

          <div className={styles.detailsList}>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Registered Email</span>
              <span className={styles.detailsValue}>{user.email}</span>
            </div>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Account Status</span>
              <span className={`${styles.detailsValue} ${styles.statusActive}`}>Active</span>
            </div>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Member Since</span>
              <span className={styles.detailsValue}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        {/* Right side form */}
        <div className={styles.profileFormCard}>
          <h3>Update Profile Info</h3>
          
          {profileError && <div className={styles.formError}>{profileError}</div>}
          {profileSuccess && <div className={styles.formSuccess}>{profileSuccess}</div>}

          <form onSubmit={handleUpdateProfile} className={styles.profileEditForm}>
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

            <div className={styles.passwordDivider}>
              <span>🔒 Change Password (optional)</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.fieldLabel}>Current Password</label>
              <input 
                type="password" 
                placeholder="Required only to set a new password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.formInput}
                disabled={profileLoading}
              />
            </div>

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

            <button 
              type="submit" 
              className={styles.saveProfileBtn}
              disabled={profileLoading}
            >
              {profileLoading ? 'Saving Profile...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DashboardProfile
