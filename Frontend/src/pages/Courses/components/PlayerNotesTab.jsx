import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { parseTimestamps } from '../../../utils/timestamps'
import styles from '../CoursePlayer.module.css'

const PlayerNotesTab = ({
  isOwner,
  noteContent,
  setNoteContent,
  noteSaving,
  noteSuccess,
  notesViewMode,
  setNotesViewMode,
  handleSaveNotes,
  handleEnroll,
  notesTextareaRef,
  playerTime,
  handleSeek
}) => {
  const handleInsertTimestamp = () => {
    const textarea = notesTextareaRef.current
    if (!textarea) return

    const h = Math.floor(playerTime / 3600)
    const m = Math.floor((playerTime % 3600) / 60)
    const s = Math.floor(playerTime % 60)

    const timeStr = h > 0 
      ? `[${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}]`
      : `[${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}]`

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)

    const newContent = before + timeStr + after
    setNoteContent(newContent)

    // Reset focus and position cursor right after the timestamp
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + timeStr.length, start + timeStr.length)
    }, 0)
  }

  return (
    <div className={styles.notesContainer}>
      <div className={styles.notesToolbar}>
        <div className={styles.viewModeBtns}>
          <button 
            className={`${styles.viewModeBtn} ${notesViewMode === 'edit' ? styles.activeViewMode : ''}`}
            onClick={() => setNotesViewMode('edit')}
          >
            ✏️ Write
          </button>
          <button 
            className={`${styles.viewModeBtn} ${notesViewMode === 'preview' ? styles.activeViewMode : ''}`}
            onClick={() => setNotesViewMode('preview')}
          >
            👁️ Render
          </button>
        </div>
        
        <div className={styles.saveActions}>
          {notesViewMode === 'edit' && isOwner && (
            <button
              onClick={handleInsertTimestamp}
              className={styles.insertTimestampBtn}
              title="Insert current video timestamp"
              style={{ marginRight: '10px' }}
            >
              ⏱️ Insert Time
            </button>
          )}
          {noteSuccess && <span className={styles.saveSuccessMsg}>Saved!</span>}
          {isOwner && (
            <button
              onClick={handleSaveNotes}
              className={styles.saveNotesBtn}
              disabled={noteSaving}
            >
              {noteSaving ? 'Saving...' : 'Save Notes'}
            </button>
          )}
        </div>
      </div>

      {notesViewMode === 'edit' ? (
        <div className={styles.editorWrapper}>
          {isOwner ? (
            <textarea
              ref={notesTextareaRef}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Take structured markdown study notes... Use headings (###), bullet points (-), code blocks (```js), or links."
              className={styles.notesTextarea}
              rows="10"
            />
          ) : (
            <div className={styles.disabledNotesPlaceholder}>
              <p>Taking study notes is only available to enrolled students.</p>
              <button onClick={handleEnroll} className={styles.notesEnrollBtn}>
                Enroll to Take Notes
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`${styles.markdownPreview} markdown-body`}>
          {noteContent.trim() ? (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                a: ({ href, children, ...props }) => {
                  if (href && href.startsWith('seek://')) {
                    const seconds = parseInt(href.replace('seek://', ''), 10)
                    return (
                      <button
                        onClick={() => handleSeek(seconds)}
                        className={styles.timestampBadge}
                        title={`Seek to ${children}`}
                      >
                        ⏱️ {children}
                      </button>
                    )
                  }
                  return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                }
              }}
            >
              {parseTimestamps(noteContent)}
            </ReactMarkdown>
          ) : (
            <p className={styles.emptyNotesPlaceholder}>
              No notes written for this video yet. Start writing in the editor tab!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default PlayerNotesTab
