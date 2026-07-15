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
      <div className={styles.inputGroup}>
        <label className={styles.label}>Course Title *</label>
        <input 
          type="text" 
          placeholder="e.g. Master React and Vite" 
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
          placeholder="What will you learn in this custom study roadmap?" 
          value={customDesc}
          onChange={(e) => setCustomDesc(e.target.value)}
          className={styles.textarea}
          rows="3"
          disabled={loading}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Course Thumbnail Image URL (optional)</label>
        <input 
          type="text" 
          placeholder="https://images.unsplash.com/..." 
          value={customThumb}
          onChange={(e) => setCustomThumb(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
      </div>

      {/* Add Custom Videos Section */}
      <div className={styles.customVideosSection}>
        <h3 className={styles.sectionHeader}>Manage Course Videos ({customVideos.length})</h3>
        
        <div className={styles.addVideoRow}>
          <div className={styles.rowInputGroup}>
            <input 
              type="text" 
              placeholder="Video Title" 
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
              className={styles.rowInput}
              disabled={loading}
            />
          </div>
          <div className={styles.rowInputGroup}>
            <input 
              type="text" 
              placeholder="YouTube URL or Video ID" 
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
            Add
          </button>
        </div>

        {customVideos.length > 0 && (
          <div className={styles.customVideosListWrapper}>
            <ul className={styles.customVideosList}>
              {customVideos.map((v, i) => (
                <li key={i} className={styles.customVideoItem}>
                  <span className={styles.customVideoTitle}>📺 {v.title}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveCustomVideo(i)} 
                    className={styles.removeVideoBtn}
                    disabled={loading}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

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
          {loading ? 'Creating Course...' : `Create Course with ${customVideos.length} Videos`}
        </button>
      </div>
    </form>
  )
}

export default CustomCourseForm
