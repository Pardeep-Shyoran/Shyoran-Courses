import React from 'react'
import styles from '../CoursePlayer.module.css'

const PlayerSettingsTab = ({
  isActualCreator,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  editTags,
  setEditTags,
  settingsSaving,
  handleSaveSettings,
  handleDeleteCourse
}) => {
  return (
    <div className={styles.settingsContainer}>
      {isActualCreator ? (
        <form onSubmit={handleSaveSettings} className={styles.settingsForm}>
          <div className={styles.inputGroup}>
            <label>Course Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows="4"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Tags (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. javascript, tutorial, coding"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
            />
          </div>

          <div className={styles.settingsActions}>
            <button
              type="submit"
              className={styles.saveSettingsBtn}
              disabled={settingsSaving}
            >
              {settingsSaving ? 'Saving...' : 'Update Settings'}
            </button>

            <button
              type="button"
              onClick={handleDeleteCourse}
              className={styles.deleteCourseBtn}
            >
              ❌ Delete Course
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.nonCreatorSettings}>
          <p className={styles.settingsNotice}>
            You are enrolled in this public course. You can track progress and write notes, but editing course details is restricted to the course registrar.
          </p>
          <div className={styles.settingsActions}>
            <button
              type="button"
              onClick={handleDeleteCourse}
              className={styles.unenrollBtn}
            >
              🚪 Leave Course
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerSettingsTab
