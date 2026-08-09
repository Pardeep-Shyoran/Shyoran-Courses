import React, { useState } from 'react'
import NotesRenderer from '../../../components/NotesRenderer/NotesRenderer'
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
  const [copySuccess, setCopySuccess] = useState(false)

  // Calculate note statistics
  const trimmedText = noteContent ? noteContent.trim() : ''
  const wordCount = trimmedText ? trimmedText.split(/\s+/).length : 0
  const charCount = noteContent.length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  // Insert markdown helper into textarea at selection
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = notesTextareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end) || 'text'
    const replacement = `${prefix}${selectedText}${suffix}`

    const newContent = text.substring(0, start) + replacement + text.substring(end)
    setNoteContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length)
    }, 0)
  }

  // Insert timestamp helper
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
    const after = text.substring(end)

    const newContent = before + timeStr + after
    setNoteContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + timeStr.length, start + timeStr.length)
    }, 0)
  }

  // Copy notes to clipboard
  const handleCopyNotes = () => {
    if (!noteContent) return
    navigator.clipboard.writeText(noteContent)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  // Download notes as .md file
  const handleDownloadNotes = () => {
    if (!noteContent) return
    const blob = new Blob([noteContent], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `study_notes_${Date.now()}.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={styles.notesContainer}>
      {/* Top Toolbar: View Mode Selector & Main Actions */}
      <div className={styles.notesToolbar}>
        <div className={styles.viewModeBtns}>
          <button 
            className={`${styles.viewModeBtn} ${notesViewMode === 'edit' ? styles.activeViewMode : ''}`}
            onClick={() => setNotesViewMode('edit')}
            title="Write and edit markdown notes"
          >
            ✏️ Write
          </button>
          <button 
            className={`${styles.viewModeBtn} ${notesViewMode === 'preview' ? styles.activeViewMode : ''}`}
            onClick={() => setNotesViewMode('preview')}
            title="Render notes with rich formatting and outline"
          >
            👁️ Render
          </button>
          <button 
            className={`${styles.viewModeBtn} ${notesViewMode === 'split' ? styles.activeViewMode : ''}`}
            onClick={() => setNotesViewMode('split')}
            title="Side-by-side live editor and rendered view"
          >
            ⚡ Split View
          </button>
        </div>

        <div className={styles.saveActions}>
          {isOwner && (
            <button
              onClick={handleInsertTimestamp}
              className={styles.insertTimestampBtn}
              title="Insert current video timestamp at cursor"
            >
              ⏱️ Insert Time
            </button>
          )}

          {noteContent.trim().length > 0 && (
            <>
              <button
                onClick={handleCopyNotes}
                className={styles.notesActionBtn}
                title="Copy notes to clipboard"
              >
                {copySuccess ? '✓ Copied' : '📋 Copy'}
              </button>
              <button
                onClick={handleDownloadNotes}
                className={styles.notesActionBtn}
                title="Download notes as Markdown file"
              >
                📥 Download .md
              </button>
            </>
          )}

          {noteSuccess && <span className={styles.saveSuccessMsg}>Saved!</span>}

          {isOwner && (
            <button
              onClick={handleSaveNotes}
              className={styles.saveNotesBtn}
              disabled={noteSaving}
            >
              {noteSaving ? 'Saving...' : '💾 Save Notes'}
            </button>
          )}
        </div>
      </div>

      {/* Editor Quick Formatting Shortcut Bar (Shown in edit or split mode) */}
      {(notesViewMode === 'edit' || notesViewMode === 'split') && isOwner && (
        <div className={styles.editorFormatBar}>
          <span className={styles.formatLabel}>Format:</span>
          <button onClick={() => insertFormatting('### ', '')} title="Heading 3">H3</button>
          <button onClick={() => insertFormatting('**', '**')} title="Bold text"><strong>B</strong></button>
          <button onClick={() => insertFormatting('*', '*')} title="Italic text"><em>I</em></button>
          <button onClick={() => insertFormatting('`', '`')} title="Inline code"><code>&lt;&gt;</code></button>
          <button onClick={() => insertFormatting('\n```javascript\n', '\n```\n')} title="Code block">``` Code</button>
          <button onClick={() => insertFormatting('- ')} title="Bullet list">• List</button>
          <button onClick={() => insertFormatting('> [!NOTE]\n> ')} title="Note Callout">💡 Note</button>
          <button onClick={() => insertFormatting('> [!KEY TAKENAWAY]\n> ')} title="Key Takeaway Callout">🔑 Key</button>
        </div>
      )}

      {/* Content Body Layout based on View Mode */}
      {notesViewMode === 'edit' && (
        <div className={styles.editorWrapper}>
          {isOwner ? (
            <textarea
              ref={notesTextareaRef}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Take structured study notes... Use markdown headings (###), bullet points (-), code blocks (```js), callouts (> [!NOTE]), or timestamps."
              className={styles.notesTextarea}
              rows="12"
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
      )}

      {notesViewMode === 'preview' && (
        <div className={styles.markdownPreviewWrapper}>
          {noteContent.trim() ? (
            <NotesRenderer content={noteContent} onSeek={handleSeek} />
          ) : (
            <div className={styles.emptyNotesPlaceholder}>
              <p>No notes written for this video yet. Switch to <strong>Write</strong> mode to add your notes!</p>
            </div>
          )}
        </div>
      )}

      {notesViewMode === 'split' && (
        <div className={styles.splitViewContainer}>
          <div className={styles.splitColumn}>
            <div className={styles.splitHeader}>✏️ Editor</div>
            {isOwner ? (
              <textarea
                ref={notesTextareaRef}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type markdown notes here..."
                className={`${styles.notesTextarea} ${styles.splitTextarea}`}
              />
            ) : (
              <div className={styles.disabledNotesPlaceholder}>
                <p>Enroll to edit notes.</p>
              </div>
            )}
          </div>
          <div className={styles.splitColumn}>
            <div className={styles.splitHeader}>👁️ Live Preview</div>
            <div className={styles.splitPreviewWrapper}>
              {noteContent.trim() ? (
                <NotesRenderer content={noteContent} onSeek={handleSeek} showTocToggle={false} />
              ) : (
                <p className={styles.emptyNotesPlaceholder}>Live preview will render here...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Note Stats Footer */}
      {noteContent.trim().length > 0 && (
        <div className={styles.notesStatsFooter}>
          <span>📊 <strong>{wordCount}</strong> words</span>
          <span className={styles.statsDot}>•</span>
          <span><strong>{charCount}</strong> characters</span>
          <span className={styles.statsDot}>•</span>
          <span>⏱️ <strong>{readTime}</strong> min read</span>
        </div>
      )}
    </div>
  )
}

export default PlayerNotesTab
