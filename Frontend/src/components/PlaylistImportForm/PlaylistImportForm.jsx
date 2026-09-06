import { useState, useEffect } from 'react'
import { importPlaylistPreview, createCourse } from '../../services/api'
import { QUICK_IMPORT_PRESETS } from '../../data/quickImportPresets'
import styles from './PlaylistImportForm.module.css'

const PlaylistImportForm = ({ onSuccess, onCancel, initialUrl = '' }) => {
  const [playlistUrl, setPlaylistUrl] = useState(initialUrl)

  useEffect(() => {
    if (initialUrl) {
      setPlaylistUrl(initialUrl)
    }
  }, [initialUrl])

  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  // Quick preset click handler
  const handleSelectPresetChip = (url) => {
    setPlaylistUrl(url)
    fetchPlaylistByUrl(url)
  }

  const fetchPlaylistByUrl = async (targetUrl) => {
    if (!targetUrl) return
    setImportLoading(true)
    setImportError(null)
    setPreviewData(null)
    try {
      const data = await importPlaylistPreview(targetUrl)
      setPreviewData(data)
    } catch (err) {
      setImportError(err.message || 'Failed to parse playlist. Please verify the URL is public or unlisted.')
    } finally {
      setImportLoading(false)
    }
  }

  // Handle Playlist Fetching for preview
  const handleFetchPlaylist = async (e) => {
    e.preventDefault()
    fetchPlaylistByUrl(playlistUrl)
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
      setImportError(err.message || 'Failed to save course into workspace.')
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {!previewData ? (
        <form onSubmit={handleFetchPlaylist} className={styles.form}>
          <div className={styles.formHeader}>
            <div className={styles.formBadge}>📥 YOUTUBE PARSER ENGINE</div>
            <h3 className={styles.formTitle}>Import YouTube Playlist</h3>
            <p className={styles.instruction}>
              Paste any public YouTube playlist link or choose a curated starter below to automatically extract titles, sequences, and durations.
            </p>
          </div>

          <div className={styles.presetsWrapper}>
            <span className={styles.presetsLabel}>⚡ Quick Presets:</span>
            <div className={styles.presetChips}>
              {QUICK_IMPORT_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  className={styles.presetChip}
                  onClick={() => handleSelectPresetChip(preset.playlistUrl)}
                  disabled={importLoading}
                >
                  <span>{preset.emoji}</span>
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>YouTube Playlist URL or Playlist ID</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.ytInputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
              <input 
                type="text" 
                placeholder="https://www.youtube.com/playlist?list=PL..." 
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className={styles.input}
                required
                disabled={importLoading}
              />
              {playlistUrl && (
                <button 
                  type="button" 
                  className={styles.clearBtn} 
                  onClick={() => setPlaylistUrl('')}
                  title="Clear link"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {importError && (
            <div className={styles.errorBanner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{importError}</span>
            </div>
          )}
          
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
              {importLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  <span>Fetching Playlist Data...</span>
                </>
              ) : (
                <>
                  <span>Fetch Playlist Videos</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.previewContainer}>
          <div className={styles.previewHeaderRow}>
            <div>
              <span className={styles.previewBadge}>✨ CURRICULUM READY</span>
              <h3 className={styles.previewHeading}>Review Playlist Curriculum</h3>
            </div>
            <span className={styles.videoCountPill}>
              {previewData.videos.length} videos extracted
            </span>
          </div>

          {/* Top Meta Area */}
          <div className={styles.previewMeta}>
            <div className={styles.thumbWrap}>
              {previewData.thumbnail ? (
                <img src={previewData.thumbnail} alt={previewData.title} className={styles.previewThumb} />
              ) : (
                <div className={styles.previewThumbPlaceholder}>🎬</div>
              )}
            </div>

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
            </div>
          </div>

          {/* Video List Preview */}
          <div className={styles.previewListWrapper}>
            <div className={styles.listHeaderRow}>
              <h4 className={styles.listHeader}>Extracted Syllabus ({previewData.videos.length})</h4>
              <span className={styles.listSub}>Sequential lesson hierarchy</span>
            </div>
            <ul className={styles.previewList}>
              {previewData.videos.map((vid, idx) => (
                <li key={idx} className={styles.previewItem}>
                  <span className={styles.previewIdx}>{idx + 1}</span>
                  <span className={styles.previewVidTitle}>{vid.title}</span>
                  <span className={styles.previewVidDuration}>{vid.duration || 'Lesson'}</span>
                </li>
              ))}
            </ul>
          </div>

          {importError && (
            <div className={styles.errorBanner}>
              <span>{importError}</span>
            </div>
          )}

          <div className={styles.previewActions}>
            <button 
              type="button" 
              className={styles.secondaryBtn} 
              onClick={() => setPreviewData(null)} 
              disabled={importLoading}
            >
              ← Choose Another Link
            </button>
            <button 
              type="button" 
              className={styles.primaryBtn} 
              onClick={handleSaveImportedCourse} 
              disabled={importLoading}
            >
              {importLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  <span>Saving to Workspace...</span>
                </>
              ) : (
                <>
                  <span>Import & Create Course</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaylistImportForm
