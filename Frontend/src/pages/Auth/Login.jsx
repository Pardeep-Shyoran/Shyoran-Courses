import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/api'
import AuthLayout from './AuthLayout'
import styles from './Auth.module.css'

const Login = () => {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const playlistUrl = params.get('playlistUrl')

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginUser(form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (playlistUrl) {
        navigate(`/courses?playlistUrl=${encodeURIComponent(playlistUrl)}`)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Access your account to continue learning"
      footerText="Don't have an account?"
      footerLink={playlistUrl ? `/register?playlistUrl=${encodeURIComponent(playlistUrl)}` : '/register'}
      footerLinkText="Register"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Email Address</label>
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
            >
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
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
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className={styles.input}
              placeholder="••••••••"
            />
          </div>
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
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? <div className={styles.spinner} /> : 'Login'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
