import React from 'react'
import Modal from '../Modal/Modal'
import styles from './KeyboardShortcutsModal.module.css'

const SHORTCUTS = [
  { keys: ['Shift', 'N'], desc: 'Next video lesson' },
  { keys: ['Shift', 'P'], desc: 'Previous video lesson' },
  { keys: ['M'], desc: 'Toggle video completed / unwatched' },
  { keys: ['F'], desc: 'Toggle Focus / Theatre Mode' },
  { keys: ['T'], desc: 'Jump to Notes & insert current timestamp' },
  { keys: ['?'], desc: 'Open / close this shortcuts guide' },
  { keys: ['Esc'], desc: 'Close modals & description drawers' }
]

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⌨️ Keyboard Shortcuts">
      <div className={styles.shortcutsList}>
        {SHORTCUTS.map((s, idx) => (
          <div key={idx} className={styles.shortcutItem}>
            <span className={styles.shortcutDesc}>{s.desc}</span>
            <div className={styles.keysCombo}>
              {s.keys.map((k, kIdx) => (
                <React.Fragment key={kIdx}>
                  <kbd className={styles.keyBadge}>{k}</kbd>
                  {kIdx < s.keys.length - 1 && <span className={styles.plusSign}>+</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className={styles.footerHint}>
        Shortcuts are automatically disabled when typing in notes, chat, or search inputs.
      </p>
    </Modal>
  )
}

export default KeyboardShortcutsModal
