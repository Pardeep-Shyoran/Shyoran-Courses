import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
import styles from './Auth.module.css'

const Register = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const params = new URLSearchParams(window.location.search)
  const playlistUrl = params.get('playlistUrl')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // Default role is student
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Calculate real-time password strength score
  const passwordStrength = useMemo(() => {
    const pwd = form.password
    if (!pwd) return { score: 0, label: '', color: 'transparent' }
    
    let score = 0
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 10) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak (min 6 characters)', color: '#ef4444' }
    if (score === 2) return { score: 2, label: 'Fair (add numbers or symbols)', color: '#f59e0b' }
    if (score === 3) return { score: 3, label: 'Good (secure password)', color: '#3b82f6' }
    return { score: 4, label: 'Strong (excellent protection)', color: '#10b981' }
  }, [form.password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await registerUser(form)
      login(data.user)
      if (playlistUrl) {
        navigate(`/courses?playlistUrl=${encodeURIComponent(playlistUrl)}`)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join thousands mastering skills with structured curricula & AI notes"
      badge="Start Free Today"
      footerText="Already have an account?"
      footerLink={playlistUrl ? `/login?playlistUrl=${encodeURIComponent(playlistUrl)}` : '/login'}
      footerLinkText="Sign In"
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Role Switcher */}
        <div className={styles.field}>
          <label className={styles.label}>Account Purpose</label>
          <div className={styles.roleSelector}>
            <button
              type="button"
              className={`${styles.roleOption} ${form.role === 'student' ? styles.roleActive : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, role: 'student' }))}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.roleIcon}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span>Student</span>
            </button>
            <button
              type="button"
              className={`${styles.roleOption} ${form.role === 'educator' ? styles.roleActive : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, role: 'educator' }))}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.roleIcon}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Educator</span>
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="register-name" className={styles.label}>
            Full Name
          </label>
          <div className={styles.inputWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.inputIcon}
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="register-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="e.g. Alex Sharma"
              autoComplete="name"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="register-email" className={styles.label}>
            Email Address
          </label>
          <div className={styles.inputWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.inputIcon}
              aria-hidden="true"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              id="register-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="register-password" className={styles.label}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.inputIcon}
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className={`${styles.input} ${styles.inputWithToggle}`}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.toggleIcon}>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.toggleIcon}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Real-time Password Strength Meter */}
          {form.password && (
            <div className={styles.strengthContainer}>
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={styles.strengthBar}
                    style={{
                      backgroundColor:
                        passwordStrength.score >= step ? passwordStrength.color : 'rgba(255, 255, 255, 0.1)',
                    }}
                  />
                ))}
              </div>
              <span className={styles.strengthLabel} style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className={styles.error}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.errorIcon}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? (
            <div className={styles.spinner} />
          ) : (
            <>
              <span>Create Free Account</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={styles.submitArrow}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register

