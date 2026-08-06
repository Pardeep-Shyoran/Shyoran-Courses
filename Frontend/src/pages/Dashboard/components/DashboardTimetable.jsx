import React, { useState, useEffect } from 'react'
import { 
  getTimetable, 
  createTimetableSlot, 
  updateTimetableSlot, 
  deleteTimetableSlot, 
  toggleTimetableSlotDate 
} from '../../../services/api'
import { getISTDateStr } from '../../../utils/dateUtils'
import styles from './DashboardTimetable.module.css'

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const WEEKENDS = ["Saturday", "Sunday"]
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const CATEGORY_COLORS = {
  Study: "#e2583e",
  Revision: "#8b5cf6",
  Practice: "#ec4899",
  Break: "#34d399",
  Exercise: "#ea9e24",
  Other: "#06b6d4"
}

const CATEGORY_ICONS = {
  Study: "📘",
  Revision: "📝",
  Practice: "💻",
  Break: "☕",
  Exercise: "🏃",
  Other: "📌"
}

const formatTime12h = (timeStr) => {
  if (!timeStr) return ""
  const [hStr, mStr] = timeStr.split(':')
  let hours = parseInt(hStr, 10)
  const minutes = parseInt(mStr, 10)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  const formattedMins = minutes < 10 ? `0${minutes}` : minutes
  return `${hours}:${formattedMins} ${ampm}`
}

const DashboardTimetable = () => {
  const [timetableSlots, setTimetableSlots] = useState([])
  const [timetableLoading, setTimetableLoading] = useState(true)
  const [selectedDayFilter, setSelectedDayFilter] = useState('Today') // 'Today', 'Monday'..., 'All'
  const [showModal, setShowModal] = useState(false)
  const [editingSlotId, setEditingSlotId] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [now, setNow] = useState(new Date())

  // Form Initial State
  const initialFormState = {
    title: '',
    startTime: '08:00',
    endTime: '09:30',
    daysOfWeek: [...WEEKDAYS],
    category: 'Study',
    colorTag: '#e2583e',
    notes: ''
  }
  const [formState, setFormState] = useState(initialFormState)

  // Real-time minute tick to update active slot badge dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Timetable Data
  const fetchTimetable = async () => {
    setTimetableLoading(true)
    try {
      const data = await getTimetable()
      setTimetableSlots(data)
    } catch (err) {
      console.error("Failed to load timetable:", err)
    } finally {
      setTimetableLoading(false)
    }
  }

  useEffect(() => {
    fetchTimetable()
  }, [])

  // --- Actions ---
  const handleOpenAddModal = () => {
    setEditingSlotId(null)
    setFormState(initialFormState)
    setShowModal(true)
  }

  const handleOpenEditModal = (slot) => {
    setEditingSlotId(slot._id)
    setFormState({
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      daysOfWeek: slot.daysOfWeek || [],
      category: slot.category || 'Study',
      colorTag: slot.colorTag || CATEGORY_COLORS[slot.category] || '#6366f1',
      notes: slot.notes || ''
    })
    setShowModal(true)
  }

  const handleDayToggleInForm = (day) => {
    if (formState.daysOfWeek.includes(day)) {
      if (formState.daysOfWeek.length === 1) return // Keep at least 1 day selected
      setFormState({
        ...formState,
        daysOfWeek: formState.daysOfWeek.filter(d => d !== day)
      })
    } else {
      setFormState({
        ...formState,
        daysOfWeek: [...formState.daysOfWeek, day]
      })
    }
  }

  const handleSelectPresetDays = (presetType) => {
    if (presetType === 'weekdays') {
      setFormState({ ...formState, daysOfWeek: [...WEEKDAYS] })
    } else if (presetType === 'weekends') {
      setFormState({ ...formState, daysOfWeek: [...WEEKENDS] })
    } else if (presetType === 'all') {
      setFormState({ ...formState, daysOfWeek: [...ALL_DAYS] })
    }
  }

  const handleSaveTimetableSlot = async (e) => {
    e.preventDefault()
    if (!formState.title.trim()) return alert("Please enter a title for the time slot.")
    if (!formState.startTime || !formState.endTime) return alert("Please specify start and end times.")
    if (!formState.daysOfWeek.length) return alert("Please select at least one day.")

    setFormSubmitting(true)
    try {
      if (editingSlotId) {
        const updated = await updateTimetableSlot(editingSlotId, formState)
        setTimetableSlots(timetableSlots.map(s => s._id === editingSlotId ? updated : s))
      } else {
        const created = await createTimetableSlot(formState)
        setTimetableSlots([...timetableSlots, created])
      }
      setShowModal(false)
    } catch (err) {
      alert(err.message || "Failed to save timetable slot.")
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule slot?")) return
    try {
      await deleteTimetableSlot(id)
      setTimetableSlots(timetableSlots.filter(s => s._id !== id))
    } catch (err) {
      alert(err.message || "Failed to delete slot.")
    }
  }

  const handleToggleSlotCompletedToday = async (slotId) => {
    const todayStr = getISTDateStr()
    try {
      const updated = await toggleTimetableSlotDate(slotId, todayStr)
      setTimetableSlots(timetableSlots.map(s => s._id === slotId ? updated : s))
    } catch (err) {
      alert(err.message || "Failed to toggle completion status.")
    }
  }

  const handleAddTemplateSlot = async (preset) => {
    try {
      const created = await createTimetableSlot(preset)
      setTimetableSlots([...timetableSlots, created])
    } catch (err) {
      alert(err.message || "Failed to add template slot.")
    }
  }

  // --- Helper Calculations ---
  const todayDayName = DAY_NAMES[now.getDay()]
  const todayDateStr = getISTDateStr(now)

  const isSlotActiveNow = (slot) => {
    if (!slot.daysOfWeek.includes(todayDayName)) return false
    const [startH, startM] = slot.startTime.split(':').map(Number)
    const [endH, endM] = slot.endTime.split(':').map(Number)

    const startMin = startH * 60 + startM
    const endMin = endH * 60 + endM
    const currentMin = now.getHours() * 60 + now.getMinutes()

    return currentMin >= startMin && currentMin < endMin
  }

  const isSlotCompletedToday = (slot) => {
    return slot.completedDates && slot.completedDates.includes(todayDateStr)
  }

  const filteredSlots = timetableSlots
    .filter(slot => {
      if (selectedDayFilter === 'All') return true
      if (selectedDayFilter === 'Today') return slot.daysOfWeek.includes(todayDayName)
      return slot.daysOfWeek.includes(selectedDayFilter)
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const todaySlots = timetableSlots.filter(s => s.daysOfWeek.includes(todayDayName))
  const todayCompletedCount = todaySlots.filter(isSlotCompletedToday).length
  const activeNowSlot = timetableSlots.find(isSlotActiveNow)

  return (
    <section className={styles.timetableSection}>
      <div className={styles.timetableHeaderCard}>
        <div className={styles.timetableHeaderInfo}>
          <div className={styles.timetableTitleGroup}>
            <h3 className={styles.timetableTitle}>📅 Timely Study Schedule & Time Table</h3>
            <p className={styles.timetableSubtitle}>
              Follow your structured daily routine to maximize productivity and streak consistency.
            </p>
          </div>

          <div className={styles.timetableStatsRow}>
            {activeNowSlot && (
              <div className={styles.activeNowBadge}>
                <span className={styles.pulseDot}></span>
                <span>Active Now: <strong>{activeNowSlot.title}</strong> ({formatTime12h(activeNowSlot.startTime)} - {formatTime12h(activeNowSlot.endTime)})</span>
              </div>
            )}
            <div className={styles.timetableProgressBadge}>
              <span>Today's Progress: <strong>{todayCompletedCount}/{todaySlots.length}</strong> Completed</span>
            </div>
            <button onClick={handleOpenAddModal} className={styles.btnAddSlot}>
              <span>+ Add Schedule Slot</span>
            </button>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className={styles.dayFilterBar}>
          {['Today', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'].map((day) => {
            const isToday = day === 'Today' || day === todayDayName
            return (
              <button
                key={day}
                type="button"
                className={`${styles.dayFilterPill} ${selectedDayFilter === day ? styles.activeDayPill : ''} ${isToday && selectedDayFilter !== day ? styles.highlightTodayPill : ''}`}
                onClick={() => setSelectedDayFilter(day)}
              >
                {day === 'Today' ? `Today (${todayDayName.slice(0, 3)})` : day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Timetable List Grid */}
      {timetableLoading ? (
        <div className={styles.timetableLoadingState}>
          <div className={styles.miniSpinner}></div>
          <p>Loading your time table schedule...</p>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className={styles.timetableEmptyState}>
          <div className={styles.emptyIcon}>🗓️</div>
          <h4>No time table slots scheduled {selectedDayFilter === 'Today' ? 'for Today' : selectedDayFilter === 'All' ? 'yet' : `for ${selectedDayFilter}`}</h4>
          <p>Set up your study slots to keep a disciplined daily learning pattern.</p>
          
          <div className={styles.quickPresetContainer}>
            <span>Quick Presets:</span>
            <button 
              className={styles.presetBtn} 
              onClick={() => handleAddTemplateSlot({
                title: 'Morning Focus & Deep Work',
                startTime: '07:00',
                endTime: '08:30',
                category: 'Study',
                colorTag: '#e2583e',
                daysOfWeek: [...WEEKDAYS],
                notes: 'Focus on core subjects and challenging problems.'
              })}
            >
              + Morning Study (7:00-8:30 AM)
            </button>
            <button 
              className={styles.presetBtn} 
              onClick={() => handleAddTemplateSlot({
                title: 'Afternoon Practice & Coding',
                startTime: '14:00',
                endTime: '16:00',
                category: 'Practice',
                colorTag: '#ec4899',
                daysOfWeek: [...WEEKDAYS],
                notes: 'Hands-on practice and project building.'
              })}
            >
              + Afternoon Practice (2:00-4:00 PM)
            </button>
            <button 
              className={styles.presetBtn} 
              onClick={() => handleAddTemplateSlot({
                title: 'Evening Revision & Quiz',
                startTime: '20:00',
                endTime: '21:30',
                category: 'Revision',
                colorTag: '#8b5cf6',
                daysOfWeek: [...WEEKDAYS],
                notes: 'Review notes, flashcards, and summary topics.'
              })}
            >
              + Evening Revision (8:00-9:30 PM)
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.timetableGrid}>
          {filteredSlots.map((slot) => {
            const active = isSlotActiveNow(slot)
            const completed = isSlotCompletedToday(slot)
            const catColor = slot.colorTag || CATEGORY_COLORS[slot.category] || '#6366f1'
            const icon = CATEGORY_ICONS[slot.category] || '📌'

            return (
              <div 
                key={slot._id} 
                className={`${styles.timetableSlotCard} ${active ? styles.activeSlotGlow : ''} ${completed ? styles.completedSlotCard : ''}`}
                style={{ borderLeftColor: catColor }}
              >
                <div className={styles.slotTimeColumn}>
                  <div className={styles.slotTimeBadge}>
                    <span>{formatTime12h(slot.startTime)}</span>
                    <span className={styles.timeDash}>-</span>
                    <span>{formatTime12h(slot.endTime)}</span>
                  </div>

                  {active && (
                    <span className={styles.slotActiveBadge}>
                      🟢 Active Now
                    </span>
                  )}

                  {completed && (
                    <span className={styles.slotCompletedBadge}>
                      ✅ Done Today
                    </span>
                  )}
                </div>

                <div className={styles.slotContentColumn}>
                  <div className={styles.slotTitleRow}>
                    <div className={styles.slotCategoryTag} style={{ backgroundColor: `${catColor}22`, color: catColor, borderColor: `${catColor}44` }}>
                      <span>{icon} {slot.category}</span>
                    </div>
                    <h4 className={styles.slotTitle}>{slot.title}</h4>
                  </div>

                  {slot.notes && <p className={styles.slotNotes}>{slot.notes}</p>}

                  <div className={styles.slotDaysRow}>
                    {ALL_DAYS.map(day => {
                      const isScheduled = slot.daysOfWeek.includes(day)
                      const isDayToday = day === todayDayName
                      return (
                        <span 
                          key={day} 
                          className={`${styles.miniDayPill} ${isScheduled ? styles.miniDayActive : ''} ${isDayToday ? styles.miniDayIsToday : ''}`}
                          title={isScheduled ? `Scheduled on ${day}` : `Not scheduled on ${day}`}
                        >
                          {day.slice(0, 3)}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.slotActionsColumn}>
                  {slot.daysOfWeek.includes(todayDayName) && (
                    <button 
                      onClick={() => handleToggleSlotCompletedToday(slot._id)}
                      className={`${styles.btnToggleSlotCheck} ${completed ? styles.btnChecked : ''}`}
                      title={completed ? "Mark as incomplete for today" : "Mark completed for today"}
                    >
                      {completed ? '✓ Completed' : 'Mark Done'}
                    </button>
                  )}
                  
                  <div className={styles.slotIconBtnGroup}>
                    <button 
                      onClick={() => handleOpenEditModal(slot)} 
                      className={styles.btnSlotAction}
                      title="Edit slot"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteSlot(slot._id)} 
                      className={`${styles.btnSlotAction} ${styles.btnSlotDelete}`}
                      title="Delete slot"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* --- ADD / EDIT TIMETABLE MODAL --- */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingSlotId ? '✏️ Edit Schedule Slot' : '➕ Add Time Table Slot'}</h3>
              <button className={styles.modalCloseBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveTimetableSlot} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Schedule Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Morning Math Practice, React Development" 
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  required
                  maxLength={100}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select 
                    value={formState.category} 
                    onChange={(e) => {
                      const cat = e.target.value
                      setFormState({ 
                        ...formState, 
                        category: cat,
                        colorTag: CATEGORY_COLORS[cat] || '#6366f1'
                      })
                    }}
                    className={styles.modalSelect}
                  >
                    <option value="Study">📘 Study</option>
                    <option value="Revision">📝 Revision</option>
                    <option value="Practice">💻 Practice</option>
                    <option value="Break">☕ Break</option>
                    <option value="Exercise">🏃 Exercise</option>
                    <option value="Other">📌 Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Start Time *</label>
                  <input 
                    type="time" 
                    value={formState.startTime}
                    onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                    required
                    className={styles.modalInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>End Time *</label>
                  <input 
                    type="time" 
                    value={formState.endTime}
                    onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                    required
                    className={styles.modalInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.daysLabelRow}>
                  <label>Active Days of Week *</label>
                  <div className={styles.presetLinkGroup}>
                    <button type="button" onClick={() => handleSelectPresetDays('weekdays')}>Weekdays</button>
                    <span>|</span>
                    <button type="button" onClick={() => handleSelectPresetDays('weekends')}>Weekends</button>
                    <span>|</span>
                    <button type="button" onClick={() => handleSelectPresetDays('all')}>All Days</button>
                  </div>
                </div>

                <div className={styles.formDaysGrid}>
                  {ALL_DAYS.map(day => {
                    const isSelected = formState.daysOfWeek.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`${styles.formDayChip} ${isSelected ? styles.formDayChipSelected : ''}`}
                        onClick={() => handleDayToggleInForm(day)}
                      >
                        {day.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Notes / Description (Optional)</label>
                <textarea 
                  placeholder="e.g. Chapter 4 exercises & mock questions" 
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  rows={2}
                  className={styles.modalTextarea}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting} className={styles.btnSubmit}>
                  {formSubmitting ? 'Saving...' : editingSlotId ? 'Update Slot' : 'Save Time Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default DashboardTimetable
