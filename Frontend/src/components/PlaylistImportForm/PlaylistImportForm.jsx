import { useState } from 'react'
import { importPlaylistPreview, createCourse } from '../../services/api'
import styles from './PlaylistImportForm.module.css'

const PlaylistImportForm = ({ onSuccess, onCancel }) => {
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  // Handle Playlist Fetching for preview
  const handleFetchPlaylist = async (e) => {
    e.preventDefault()
    if (!playlistUrl) return
    setImportLoading(true)
    setImportError(null)
    setPreviewData(null)
    try {
      const data = await importPlaylistPreview(playlistUrl)
      setPreviewData(data)
    } catch (err) {
      setImportError(err.message || 'Failed to parse playlist. Check URL or ensure it is public.')
    } finally {
      setImportLoading(false)
    }
  }

  // Handle Save Course from Playlist Preview
  const handleSaveImportedCourse = async () => {
    if (!previewData) return
    setImportLoading(true)
    setImportError(null)
    try {
      const created = await createCourse({
        title: previewData.title,
        description: previewData.description,
        playlistId: previewData.playlistId,
        thumbnail: previewData.thumbnail,
        videos: previewData.videos
      })
      if (onSuccess) {
        onSuccess(created)
      }
    } catch (err) {
      setImportError(err.message || 'Failed to save course.')
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {!previewData ? (
        <form onSubmit={handleFetchPlaylist} className={styles.form}>
          <p className={styles.instruction}>
            Paste a public YouTube Playlist link or Playlist ID. We will index all videos for custom roadmap progress tracking.
          </p>
          <div className={styles.inputGroup}>
            <label className={styles.label}>YouTube Playlist URL or ID</label>
            <input 
              type="text" 
              placeholder="https://www.youtube.com/playlist?list=..." 
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              className={styles.input}
              required
              disabled={importLoading}
            />
          </div>
          {importError && <div className={styles.error}>{importError}</div>}
          
          <div className={styles.actions}>
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel} 
                className={styles.secondaryBtn} 
                disabled={importLoading}
              >
                Cancel
              </button>
            )}
            <button type="submit" className={styles.primaryBtn} disabled={importLoading}>
              {importLoading ? 'Processing...' : 'Fetch Playlist Videos'}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.previewContainer}>
          <div className={styles.previewMeta}>
            {previewData.thumbnail ? (
              <img src={previewData.thumbnail} alt={previewData.title} className={styles.previewThumb} />
            ) : (
              <div className={styles.previewThumbPlaceholder}>🎬</div>
            )}
            <div className={styles.previewInfo}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Course Title</label>
                <input 
                  type="text" 
                  value={previewData.title} 
                  onChange={(e) => setPreviewData({ ...previewData, title: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Course Description</label>
                <textarea 
                  value={previewData.description || ''} 
                  onChange={(e) => setPreviewData({ ...previewData, description: e.target.value })}
                  className={styles.textarea}
                  placeholder="Course description..."
                  rows="3"
                />
              </div>
              <p className={styles.previewCount}>Prepared to import <strong>{previewData.videos.length} videos</strong></p>
            </div>
          </div>

          <div className={styles.previewListWrapper}>
            <h4 className={styles.listHeader}>Playlist Videos ({previewData.videos.length})</h4>
            <ul className={styles.previewList}>
              {previewData.videos.map((vid, idx) => (
                <li key={idx} className={styles.previewItem}>
                  <span className={styles.previewIdx}>{idx + 1}</span>
                  <span className={styles.previewVidTitle}>{vid.title}</span>
                  <span className={styles.previewVidDuration}>{vid.duration || 'Video'}</span>
                </li>
              ))}
            </ul>
          </div>

          {importError && <div className={styles.error}>{importError}</div>}

          <div className={styles.previewActions}>
            <button 
              type="button" 
              className={styles.secondaryBtn} 
              onClick={() => setPreviewData(null)} 
              disabled={importLoading}
            >
              Back
            </button>
            <button 
              type="button" 
              className={styles.primaryBtn} 
              onClick={handleSaveImportedCourse} 
              disabled={importLoading}
            >
              {importLoading ? 'Saving...' : 'Import and Create Course'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaylistImportForm
