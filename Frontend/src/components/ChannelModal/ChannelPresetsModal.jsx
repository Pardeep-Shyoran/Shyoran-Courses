import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getChannelPresets, addChannel } from '../../services/api'
import styles from './ChannelModal.module.css'

export default function ChannelPresetsModal({ isOpen, onClose, onChannelSubscribed }) {
  const [presets, setPresets] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribingId, setSubscribingId] = useState(null)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const loadPresets = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getChannelPresets()
        if (data.presets) {
          setPresets(data.presets)
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load recommended presets.')
      } finally {
        setLoading(false)
      }
    }

    loadPresets()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubscribe = async (preset) => {
    setSubscribingId(preset.channelId)
    try {
      await addChannel({
        input: preset.channelId,
        category: preset.category,
        customTitle: preset.channelTitle
      })
      setPresets(prev =>
        prev.map(p => (p.channelId === preset.channelId ? { ...p, isSubscribed: true } : p))
      )
      if (onChannelSubscribed) onChannelSubscribed()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to subscribe to channel.')
    } finally {
      setSubscribingId(null)
    }
  }

  const filteredPresets = activeCategory === 'all' 
    ? presets 
    : presets.filter(p => p.category === activeCategory)

  const categories = [
    { id: 'all', label: 'All Channels', icon: '🌐' },
    { id: 'motivation', label: 'Motivation', icon: '⚡' },
    { id: 'knowledge', label: 'GK & Docs', icon: '🧠' },
    { id: 'news', label: 'Daily News', icon: '📰' },
    { id: 'tech', label: 'Tech & AI', icon: '💻' },
    { id: 'academics', label: 'Academics', icon: '📚' },
    { id: 'finance', label: 'Finance', icon: '💼' }
  ]

  const categoryLabels = {
    motivation: '⚡ Motivation & Mindset',
    knowledge: '🧠 General Knowledge & Documentaries',
    news: '📰 Daily News & Current Affairs',
    tech: '💻 Tech, AI & Computer Science',
    academics: '📚 Exam Prep & Higher Academics',
    finance: '💼 Finance, Business & Productivity'
  }

  // Group filtered presets by category
  const groupedCategories = ['motivation', 'knowledge', 'news', 'tech', 'academics', 'finance'].filter(cat =>
    filteredPresets.some(p => p.category === cat)
  )

  const modalElement = (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={`${styles.modal} ${styles.modalLarge}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.headerTitle}>
              <span>✨</span> Curated Student Channels
            </h3>
            <p className={styles.headerSubtitle}>
              Hand-picked educational channels to power your daily focus, general knowledge, tech skills, and exam preparation.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Category Filter Pills */}
        <div className={styles.categoryPills} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryPill} ${activeCategory === cat.id ? styles.categoryPillActive : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <p>Loading curated channels...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {groupedCategories.map(cat => {
              const catPresets = filteredPresets.filter(p => p.category === cat)
              if (catPresets.length === 0) return null

              return (
                <div key={cat} className={styles.presetCategorySection}>
                  <div className={styles.presetCategoryTitle}>
                    {categoryLabels[cat] || cat} ({catPresets.length})
                  </div>

                  <div className={styles.presetsGrid}>
                    {catPresets.map(preset => (
                      <div key={preset.channelId} className={styles.presetCard}>
                        <div>
                          <div className={styles.presetHeader}>
                            {preset.avatarUrl ? (
                              <img src={preset.avatarUrl} alt={preset.channelTitle} className={styles.presetAvatar} />
                            ) : (
                              <div className={styles.presetAvatarFallback}>📺</div>
                            )}
                            <div>
                              <h4 className={styles.presetTitle}>{preset.channelTitle}</h4>
                              <p className={styles.presetHandle}>{preset.channelHandle}</p>
                            </div>
                          </div>
                          <p className={styles.presetDesc} style={{ marginTop: '0.6rem' }}>
                            {preset.description}
                          </p>
                        </div>

                        {preset.isSubscribed ? (
                          <div className={styles.subscribedBadge}>✓ Subscribed</div>
                        ) : (
                          <button
                            className={styles.subscribeBtn}
                            onClick={() => handleSubscribe(preset)}
                            disabled={subscribingId === preset.channelId}
                          >
                            {subscribingId === preset.channelId ? 'Subscribing...' : '+ Add to Feeds'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return typeof document !== 'undefined'
    ? createPortal(modalElement, document.body)
    : modalElement
}
