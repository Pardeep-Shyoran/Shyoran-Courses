import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { addChannel } from '../../services/api'
import styles from './ChannelModal.module.css'

export default function AddChannelModal({ isOpen, onClose, onSuccess }) {
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('motivation')
  const [customTitle, setCustomTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) {
      setError('Please enter a YouTube channel URL, handle (@name), or channel ID.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await addChannel({
        input: input.trim(),
        category,
        customTitle: customTitle.trim()
      })
      setInput('')
      setCustomTitle('')
      setCategory('motivation')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to add YouTube channel. Please check the URL or handle.')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = [
    { id: 'motivation', label: 'Motivation', icon: '⚡' },
    { id: 'knowledge', label: 'GK & Docs', icon: '🧠' },
    { id: 'news', label: 'Daily News', icon: '📰' },
    { id: 'tech', label: 'Tech & AI', icon: '💻' },
    { id: 'academics', label: 'Academics', icon: '📚' },
    { id: 'finance', label: 'Finance', icon: '💼' }
  ]

  const modalElement = (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.headerTitle}>
              <span>📺</span> Add Student Channel
            </h3>
            <p className={styles.headerSubtitle}>
              Subscribe to any YouTube channel for clean, distraction-free feeds without algorithmic traps.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Channel Link / Handle Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Channel Link or Handle</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. @kurzgesagt or https://youtube.com/@veritasium"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <p className={styles.helpText}>
              Supports YouTube handles (@handle), full channel URLs, or channel IDs.
            </p>
          </div>

          {/* Student Category Selector */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Feed Category</label>
            <div className={styles.categoryPills}>
              {categoryOptions.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.categoryPill} ${category === cat.id ? styles.categoryPillActive : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Nickname / Title */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Custom Label (Optional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Daily UPSC Editorial or Deep Work Focus"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              disabled={loading}
            />
            <p className={styles.helpText}>
              A friendly nickname for your dashboard feed (leave blank to use the official channel name).
            </p>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !input.trim()}
          >
            {loading ? '⏳ Verifying & Adding Channel...' : '✓ Add Channel to Feeds'}
          </button>
        </form>
      </div>
    </div>
  )

  return typeof document !== 'undefined'
    ? createPortal(modalElement, document.body)
    : modalElement
}
