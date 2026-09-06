import { useState } from 'react'
import { createCourse } from '../../services/api'
import styles from './CustomCourseForm.module.css'

const CustomCourseForm = ({ onSuccess, onCancel }) => {
  const [customTitle, setCustomTitle] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [customThumb, setCustomThumb] = useState('')
  const [customVideos, setCustomVideos] = useState([])
  const [newVideoTitle, setNewVideoTitle] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Extract Video ID helper for manual inputs
  const extractVideoId = (url) => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : url.trim()
  }

  // Add custom video to manual form list
  const handleAddCustomVideo = (e) => {
    e.preventDefault()
    if (!newVideoTitle || !newVideoUrl) return
    
    const youtubeId = extractVideoId(newVideoUrl)
    if (!youtubeId || youtubeId.length !== 11) {
      alert('Invalid YouTube URL or ID (must be an 11-character video ID or full YouTube video URL)')
      return
    }

    setCustomVideos([
      ...customVideos,
      {
        title: newVideoTitle,
        youtubeId,
        duration: 'Manual',
        completed: false,
        notes: ''
      }
    ])
    setNewVideoTitle('')
    setNewVideoUrl('')
  }

  // Remove custom video from manual list
  const handleRemoveCustomVideo = (index) => {
    setCustomVideos(customVideos.filter((_, i) => i !== index))
  }

  // Save manual course
  const handleSaveCustomCourse = async (e) => {
    e.preventDefault()
    if (!customTitle) return
    if (customVideos.length === 0) {
      setError('Please add at least one video to your custom course.')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const created = await createCourse({
        title: customTitle,
        description: customDesc,
        thumbnail: customThumb || undefined,
        videos: customVideos
      })
      if (onSuccess) {
        onSuccess(created)
      }
    } catch (err) {
      setError(err.message || 'Failed to create custom course.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSaveCustomCourse} className={styles.form}>
      {/* Step 1: Course Info */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.stepBadge}>STEP 1</span>
          <h4 className={styles.sectionCardTitle}>Course Information</h4>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Course Title *</label>
          <input 
            type="text" 
            placeholder="e.g. Master React, TypeScript and Vite" 
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Description</label>
          <textarea 
            placeholder="What learning milestones or objectives will this custom track cover?" 
            value={customDesc}
            onChange={(e) => setCustomDesc(e.target.value)}
            className={styles.textarea}
            rows="3"
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Cover Thumbnail URL (optional)</label>
          <input 
            type="text" 
            placeholder="https://images.unsplash.com/... or image link" 
            value={customThumb}
            onChange={(e) => setCustomThumb(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
        </div>
      </div>

      {/* Step 2: Add Custom Videos Section */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.stepBadge}>STEP 2</span>
          <div className={styles.sectionTitleRow}>
            <h4 className={styles.sectionCardTitle}>Add Video Lessons</h4>
            <span className={styles.counterBadge}>{customVideos.length} lessons added</span>
          </div>
        </div>
        
        <div className={styles.addVideoRow}>
          <div className={styles.rowInputGroup}>
            <input 
              type="text" 
              placeholder="Lesson Title (e.g. 01 - Getting Started)" 
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
              className={styles.rowInput}
              disabled={loading}
            />
          </div>
          <div className={styles.rowInputGroup}>
            <input 
              type="text" 
              placeholder="YouTube Video URL or 11-char ID" 
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className={styles.rowInput}
              disabled={loading}
            />
          </div>
          <button 
            type="button" 
            onClick={handleAddCustomVideo} 
            className={styles.rowAddBtn}
            disabled={loading || !newVideoTitle || !newVideoUrl}
          >
            <span>+ Add</span>
          </button>
        </div>

        {customVideos.length > 0 ? (
          <div className={styles.customVideosListWrapper}>
            <ul className={styles.customVideosList}>
              {customVideos.map((v, i) => (
                <li key={i} className={styles.customVideoItem}>
                  <div className={styles.videoItemLeft}>
                    <span className={styles.videoItemIdx}>{i + 1}</span>
                    <span className={styles.customVideoTitle}>{v.title}</span>
                  </div>
                  <div className={styles.videoItemRight}>
                    <span className={styles.ytIdBadge}>{v.youtubeId}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCustomVideo(i)} 
                      className={styles.removeVideoBtn}
                      title="Remove lesson"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={styles.emptyLessonsPlaceholder}>
            <p>No lessons added yet. Fill in the title and YouTube link above to begin structuring your track.</p>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.actions}>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className={styles.secondaryBtn} 
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className={styles.primaryBtn} 
          disabled={loading || customVideos.length === 0}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              <span>Creating Course...</span>
            </>
          ) : (
            <>
              <span>Create Course ({customVideos.length} Lessons)</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default CustomCourseForm
