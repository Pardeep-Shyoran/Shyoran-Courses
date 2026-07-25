import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses } from '../../services/api'
import styles from './CommandPalette.module.css'

const CommandPalette = ({ isOpen, setIsOpen }) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const resultsContainerRef = useRef(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  // Fetch courses list for search index when opened
  useEffect(() => {
    if (!isOpen || !token) return
    let isMounted = true

    const loadIndex = async () => {
      setLoading(true)
      try {
        const data = await getCourses()
        if (isMounted && Array.isArray(data)) {
          setCourses(data)
        }
      } catch (err) {
        console.error('Failed to load courses for command palette:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadIndex()
    return () => { isMounted = false }
  }, [isOpen, token])

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Global keyboard shortcut listener (Cmd+K / Ctrl+K & Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setIsOpen])

  // Define static Quick Links
  const staticQuickLinks = useMemo(() => [
    {
      id: 'ql-dashboard',
      category: 'Quick Links',
      title: 'Dashboard',
      subtitle: 'Overview of learning progress, streaks, and certificates',
      url: '/dashboard',
      type: 'link',
      badge: 'Page'
    },
    {
      id: 'ql-courses',
      category: 'Quick Links',
      title: 'My Courses Library',
      subtitle: 'Browse all imported YouTube playlists and courses',
      url: '/courses',
      type: 'link',
      badge: 'Page'
    },
    {
      id: 'ql-add-course',
      category: 'Quick Links',
      title: 'Import New Playlist',
      subtitle: 'Convert a YouTube playlist link into an interactive course',
      url: '/dashboard?tab=add-course',
      type: 'link',
      badge: 'Action'
    },
    {
      id: 'ql-home',
      category: 'Quick Links',
      title: 'Home Page',
      subtitle: 'Main landing page and features highlight',
      url: '/',
      type: 'link',
      badge: 'Page'
    },
    {
      id: 'ql-about',
      category: 'Quick Links',
      title: 'About Shyoran Courses',
      subtitle: 'Learn about our interactive learning methodology',
      url: '/about',
      type: 'link',
      badge: 'Page'
    },
    {
      id: 'ql-contact',
      category: 'Quick Links',
      title: 'Contact & Support',
      subtitle: 'Get assistance or share product feedback',
      url: '/contact',
      type: 'link',
      badge: 'Page'
    }
  ], [])

  // Build Filtered Results List
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase()

    // 1. Filter Quick Links
    const matchedQuickLinks = staticQuickLinks.filter(item =>
      !q || item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    )

    // 2. Filter Courses
    const matchedCourses = courses
      .filter(c => !q || c.title.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)))
      .map(c => ({
        id: `course-${c._id}`,
        category: 'Courses',
        title: c.title,
        subtitle: `${c.videos?.length || 0} lessons • Playlist Workspace`,
        url: `/courses/${c._id}`,
        type: 'course',
        badge: 'Course'
      }))

    // 3. Filter Individual Video Lessons (Limit to top 8)
    const matchedLessons = []
    if (q) {
      courses.forEach(c => {
        if (!c.videos) return
        c.videos.forEach(v => {
          if (v.title && v.title.toLowerCase().includes(q)) {
            if (matchedLessons.length < 8) {
              matchedLessons.push({
                id: `lesson-${v._id}`,
                category: 'Lessons & Videos',
                title: v.title,
                subtitle: `In course: ${c.title}`,
                url: `/courses/${c._id}?videoId=${v._id}`,
                type: 'lesson',
                badge: 'Lesson'
              })
            }
          }
        })
      })
    }

    return [...matchedQuickLinks, ...matchedCourses, ...matchedLessons]
  }, [query, staticQuickLinks, courses])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle item execution / selection
  const handleSelect = (item) => {
    if (!item) return
    setIsOpen(false)
    navigate(item.url)
  }

  // Handle arrow key navigation & Enter key selection
  const handleKeyDownInput = (e) => {
    if (filteredResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % filteredResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(filteredResults[selectedIndex])
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!isOpen) return null

  // Render SVG icons according to type
  const renderItemIcon = (type) => {
    switch (type) {
      case 'course':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        )
      case 'lesson':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        )
    }
  }

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Search Header */}
        <div className={styles.searchHeader}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Type a command or search courses & lessons..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')}>
              ✕
            </button>
          )}
          <span className={styles.escBadge}>ESC</span>
        </div>

        {/* Search Results List */}
        <div className={styles.resultsContainer} ref={resultsContainerRef}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <span>Searching workspace index...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🔍</span>
              <p>No results found for "<strong>{query}</strong>"</p>
              <span>Try searching for course titles, topics, or dashboard pages.</span>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex
              const showCategoryHeader = idx === 0 || filteredResults[idx - 1].category !== item.category

              return (
                <React.Fragment key={item.id}>
                  {showCategoryHeader && (
                    <div className={styles.categoryHeader}>
                      {item.category}
                    </div>
                  )}
                  <div
                    data-index={idx}
                    className={`${styles.resultItem} ${isSelected ? styles.selectedItem : ''}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className={styles.itemIconWrapper}>
                      {renderItemIcon(item.type)}
                    </div>
                    <div className={styles.itemTextContent}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <div className={styles.itemSubtitle}>{item.subtitle}</div>
                    </div>
                    <span className={styles.itemBadge}>{item.badge}</span>
                  </div>
                </React.Fragment>
              )
            })
          )}
        </div>

        {/* Modal Footer Keyboard Hints */}
        <div className={styles.modalFooter}>
          <div className={styles.hintKeyGroup}>
            <kbd>↑</kbd><kbd>↓</kbd>
            <span>Navigate</span>
          </div>
          <div className={styles.hintKeyGroup}>
            <kbd>↵</kbd>
            <span>Select</span>
          </div>
          <div className={styles.hintKeyGroup}>
            <kbd>ESC</kbd>
            <span>Dismiss</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
