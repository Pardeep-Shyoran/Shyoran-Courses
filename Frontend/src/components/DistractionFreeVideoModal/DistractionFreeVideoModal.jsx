import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { saveChannelVideoToCourse } from '../../services/api'
import styles from './DistractionFreeVideoModal.module.css'

export default function DistractionFreeVideoModal({ video, onClose, onSaveSuccess }) {
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [onClose])

  if (!video) return null

  const categoryLabel = {
    motivation: '⚡ Motivation',
    knowledge: '🧠 GK & Documentary',
    news: '📰 Daily News',
    tech: '💻 Tech & AI',
    academics: '📚 Academics',
    finance: '💼 Finance',
    other: '🌟 Topic'
  }[video.category] || '📺 Feed'

  const categoryClass = {
    motivation: styles.badgeMotivation,
    knowledge: styles.badgeKnowledge,
    news: styles.badgeNews
  }[video.category] || ''

  const handleSaveToCourse = async () => {
    setSaving(true)
    setError(null)
    try {
      await saveChannelVideoToCourse({
        youtubeId: video.youtubeId,
        title: video.title,
        channelTitle: video.channelTitle,
        description: video.description || '',
        notes: notes.trim(),
        courseTitle: `Study: ${video.title.slice(0, 50)}`
      })
      setSaveSuccess(true)
      if (onSaveSuccess) onSaveSuccess()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to save video to courses.')
    } finally {
      setSaving(false)
    }
  }

  const publishedDate = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null

  const modalElement = (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`${styles.badge} ${categoryClass}`}>
              {categoryLabel}
            </span>
            <div className={styles.distractionFreeTag}>
              <span className={styles.distractionFreeDot}></span>
              <span>Distraction-Free Focus Mode</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Embedded YouTube Player without Recommendations */}
        <div className={styles.videoWrapper}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            className={styles.videoPlayer}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Video Information & Actions */}
        <div className={styles.contentBody}>
          <div className={styles.titleRow}>
            <h2 className={styles.videoTitle}>{video.title}</h2>
          </div>

          <div className={styles.metaRow}>
            <div className={styles.channelInfo}>
              {video.channelAvatar ? (
                <img
                  src={video.channelAvatar}
                  alt={video.channelTitle}
                  className={styles.channelAvatar}
                />
              ) : (
                <div className={styles.channelInitial}>
                  {video.channelTitle ? video.channelTitle[0].toUpperCase() : '📺'}
                </div>
              )}
              <span>{video.channelTitle}</span>
            </div>

            {publishedDate && <span>• Uploaded {publishedDate}</span>}
            {video.viewCount && <span>• {Number(video.viewCount).toLocaleString()} views</span>}
          </div>

          {/* Action Row */}
          <div className={styles.actionsRow}>
            <button
              className={styles.saveCourseBtn}
              onClick={handleSaveToCourse}
              disabled={saving || saveSuccess}
            >
              {saving ? (
                <span>⏳ Saving to Library...</span>
              ) : saveSuccess ? (
                <span>✓ Added to Courses</span>
              ) : (
                <>
                  <span>📌</span>
                  <span>Save to My Courses</span>
                </>
              )}
            </button>

            <button
              className={styles.notesToggleBtn}
              onClick={() => setShowNotes(!showNotes)}
            >
              <span>📝</span>
              <span>{showNotes ? 'Hide Study Notes' : 'Quick Study Notes'}</span>
            </button>
          </div>

          {saveSuccess && (
            <div className={styles.successNotice}>
              <span>✓ Successfully created a study module from this lecture in your personal library!</span>
            </div>
          )}

          {error && (
            <div style={{ color: '#f87171', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Study Notes Section */}
          {showNotes && (
            <div className={styles.notesSection}>
              <div className={styles.notesHeader}>
                <span>Personal Study Notes</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Saved with course module</span>
              </div>
              <textarea
                className={styles.notesTextarea}
                placeholder="Jot down key points, timestamps, or insights while watching..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {/* Video Description */}
          {video.description && (
            <div className={styles.descriptionBox}>
              {video.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined'
    ? createPortal(modalElement, document.body)
    : modalElement
}
