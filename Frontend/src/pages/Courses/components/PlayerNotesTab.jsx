import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
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
  notesTextareaRef
}) => {
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
            >
              {noteContent}
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
