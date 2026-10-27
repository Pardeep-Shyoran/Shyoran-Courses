import React, { useState, useEffect } from 'react'
import { getTodos, createTodo, toggleTodo, deleteTodo } from '../../../services/api'
import { getISTDateStr } from '../../../utils/dateUtils'
import DashboardTimetable from './DashboardTimetable'
import styles from '../Dashboard.module.css'

const DashboardChecklist = ({ streak, trackerStats, trackerLoading }) => {
  const [todos, setTodos] = useState([])
  const [todoLoading, setTodoLoading] = useState(true)
  const [newTodoText, setNewTodoText] = useState('')
  const [todoSubmitting, setTodoSubmitting] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('timetable') // 'timetable' or 'todos'

  useEffect(() => {
    const fetchTodos = async () => {
      setTodoLoading(true)
      try {
        const data = await getTodos()
        setTodos(data)
      } catch (err) {
        console.error(err)
      } finally {
        setTodoLoading(false)
      }
    }
    fetchTodos()
  }, [])

  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!newTodoText || !newTodoText.trim()) return
    setTodoSubmitting(true)
    try {
      const addedTodo = await createTodo(newTodoText.trim())
      setTodos([addedTodo, ...todos])
      setNewTodoText('')
    } catch (err) {
      alert(err.message || 'Failed to add task.')
    } finally {
      setTodoSubmitting(false)
    }
  }

  const handleToggleTodo = async (id) => {
    try {
      const updatedTodo = await toggleTodo(id)
      setTodos(todos.map(t => t._id === id ? { ...t, completed: updatedTodo.completed } : t))
    } catch (err) {
      alert(err.message || 'Failed to toggle task.')
    }
  }

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id)
      setTodos(todos.filter(t => t._id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete task.')
    }
  }

  const streakExtension = trackerStats?.streakExtension
  const isGraceActive = !!streakExtension?.isGraceActive
  const graceDaysUsed = streakExtension?.graceDaysUsed || 0
  const graceDaysRemaining = streakExtension?.graceDaysRemaining !== undefined ? streakExtension.graceDaysRemaining : 2
  const frozenDatesSet = new Set(streakExtension?.frozenDates || [])

  // Generate day items for consistency calendar heatmap
  const generateHeatmapDays = () => {
    const days = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364)

    // Pad the start to align weekdays (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = startDate.getDay()
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ isPadding: true })
    }

    const curDate = new Date(startDate)
    while (curDate <= today) {
      const dateStr = getISTDateStr(curDate)
      const count = trackerStats?.heatmap?.[dateStr] || 0
      const isFrozen = frozenDatesSet.has(dateStr) && count === 0
      days.push({
        date: new Date(curDate),
        dateStr,
        dayOfWeek: curDate.getDay(),
        month: curDate.toLocaleString('default', { month: 'short' }),
        count,
        isFrozen
      })
      curDate.setDate(curDate.getDate() + 1)
    }
    return days
  }

  const remainingTodosCount = todos.filter(t => !t.completed).length

  return (
    <div className={styles.tabPane}>
      {/* 1. Header */}
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>Consistency Tracker & Tasks</h2>
          <p className={styles.paneSubtitle}>Build daily study habits, follow your regular time table schedule, and manage tasks.</p>
        </div>
      </div>

      {/* 1.5. Streak Grace / Extension Protection Alert Banner */}
      {isGraceActive && (
        <section className={styles.streakGraceBanner}>
          <div className={styles.streakGraceContent}>
            <span className={styles.streakGraceBadge}>🛡️ 2-DAY EXTENSION ACTIVE</span>
            <div className={styles.streakGraceText}>
              <strong>Your {streak}-day study streak is currently protected!</strong>
              <p>
                You missed {graceDaysUsed} {graceDaysUsed === 1 ? 'day' : 'days'} ({graceDaysRemaining} grace {graceDaysRemaining === 1 ? 'day' : 'days'} remaining). Complete a video lesson or update lecture notes today to preserve your continuous streak!
              </p>
            </div>
          </div>
          <div className={styles.streakGracePill}>
            <span>{graceDaysRemaining === 0 ? '⚠️ Last Chance Today' : '🛡️ 1 Day Left'}</span>
          </div>
        </section>
      )}

      {/* 2. Top Streak & Activity Stats Row */}
      <section className={styles.topStreakRow}>
        <div className={`${styles.streakSubCard} ${isGraceActive ? styles.streakSubCardProtected : ''}`}>
          <span className={styles.streakEmoji}>{isGraceActive ? '🛡️' : '🔥'}</span>
          <div>
            <div className={styles.streakValRow}>
              <span className={styles.streakVal}>{streak} {streak === 1 ? 'Day' : 'Days'}</span>
              {isGraceActive && (
                <span className={styles.streakProtectedTag}>Grace Active</span>
              )}
            </div>
            <span className={styles.streakLbl}>
              {isGraceActive ? 'Protected Streak' : 'Current Streak'}
            </span>
          </div>
        </div>
        <div className={styles.streakSubCard}>
          <span className={styles.streakEmoji}>🏆</span>
          <div>
            <span className={styles.streakVal}>{trackerStats?.longestStreak || 0} Days</span>
            <span className={styles.streakLbl}>Longest Streak</span>
          </div>
        </div>
        <div className={styles.streakSubCard}>
          <span className={styles.streakEmoji}>📚</span>
          <div>
            <span className={styles.streakVal}>{trackerStats?.totalActivities || 0}</span>
            <span className={styles.streakLbl}>Total Activities</span>
          </div>
        </div>
      </section>

      {/* 3. Heatmap Graph Section (Top Position) */}
      <section className={styles.heatmapFullRow}>
        <div className={styles.heatmapCardFull}>
          <div className={styles.heatmapHeader}>
            <span>📊 Contribution Grid & Habit Analytics (Past 365 Days)</span>
            <div className={styles.heatmapLegend}>
              <span>Less</span>
              <div className={`${styles.legendBox} ${styles.lvl0}`} title="0 activities"></div>
              <div className={`${styles.legendBox} ${styles.lvl1}`} title="1 activity"></div>
              <div className={`${styles.legendBox} ${styles.lvl2}`} title="2 activities"></div>
              <div className={`${styles.legendBox} ${styles.lvl3}`} title="3 activities"></div>
              <div className={`${styles.legendBox} ${styles.lvl4}`} title="4+ activities"></div>
              <span>More</span>
              <span style={{ margin: '0 4px', opacity: 0.5 }}>•</span>
              <div className={`${styles.legendBox} ${styles.lvlFrozen}`} title="2-Day Streak Extension (Frozen Day)"></div>
              <span>Protected</span>
            </div>
          </div>

          {trackerLoading ? (
            <div className={styles.trackerLoading}>
              <div className={styles.miniSpinner}></div>
              <p>Loading activity grid...</p>
            </div>
          ) : (
            <div className={styles.heatmapGridWrapper}>
              <div className={styles.heatmapRowLabels}>
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div className={styles.heatmapGrid}>
                {generateHeatmapDays().map((day, idx) => {
                  if (day.isPadding) {
                    return <div key={`pad-${idx}`} className={styles.heatmapCellPad}></div>
                  }
                  
                  let lvlClass = styles.lvl0
                  if (day.isFrozen) lvlClass = styles.lvlFrozen
                  else if (day.count === 1) lvlClass = styles.lvl1
                  else if (day.count === 2) lvlClass = styles.lvl2
                  else if (day.count === 3) lvlClass = styles.lvl3
                  else if (day.count >= 4) lvlClass = styles.lvl4

                  const formattedDate = day.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })

                  const tooltipText = day.isFrozen
                    ? `${formattedDate}: 🛡️ Protected by 2-Day Streak Extension (Frozen Day)`
                    : `${formattedDate}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'} logged`

                  return (
                    <div 
                      key={day.dateStr} 
                      className={`${styles.heatmapCell} ${lvlClass}`}
                      title={tooltipText}
                    ></div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Sub-Tabs Navigation Bar (Below Heatmap) */}
      <div className={styles.subTabNavigation}>
        <button 
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === 'timetable' ? styles.activeSubTabBtn : ''}`}
          onClick={() => setActiveSubTab('timetable')}
        >
          <span>📅 Time Table & Schedule</span>
        </button>

        <button 
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === 'todos' ? styles.activeSubTabBtn : ''}`}
          onClick={() => setActiveSubTab('todos')}
        >
          <span>📋 Daily Checklist</span>
          {remainingTodosCount > 0 && (
            <span className={styles.subTabBadge}>{remainingTodosCount}</span>
          )}
        </button>
      </div>

      {/* 5. Sub-Tab Content */}

      {/* (A) Timely Study Schedule & Time Table */}
      {activeSubTab === 'timetable' && (
        <DashboardTimetable />
      )}

      {/* (B) Daily Checklist / To-Do List */}
      {activeSubTab === 'todos' && (
        <section className={styles.todoSection}>
          <h3 className={styles.columnTitle}>📋 Daily Checklist / To-Do List</h3>
          <div className={styles.todoCard}>
            <form onSubmit={handleAddTodo} className={styles.todoForm}>
              <input 
                type="text" 
                placeholder="Add a study task..." 
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className={styles.todoInput}
                disabled={todoSubmitting}
                maxLength={80}
              />
              <button 
                type="submit" 
                disabled={todoSubmitting || !newTodoText.trim()} 
                className={styles.btnTodoAdd}
              >
                {todoSubmitting ? '+' : 'Add'}
              </button>
            </form>

            {todoLoading ? (
              <div className={styles.todoLoading}>
                <div className={styles.miniSpinner}></div>
                <p>Loading checklist...</p>
              </div>
            ) : todos.length === 0 ? (
              <p className={styles.todoEmpty}>No tasks remaining! Add some goals to stay focused today.</p>
            ) : (
              <div className={styles.todoList}>
                {todos.map(todo => (
                  <div key={todo._id} className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}>
                    <label className={styles.todoCheckboxContainer}>
                      <input 
                        type="checkbox" 
                        checked={todo.completed} 
                        onChange={() => handleToggleTodo(todo._id)}
                        className={styles.todoCheckbox}
                      />
                      <span className={styles.todoText}>{todo.text}</span>
                    </label>
                    <button 
                      onClick={() => handleDeleteTodo(todo._id)} 
                      className={styles.btnTodoDelete}
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default DashboardChecklist
