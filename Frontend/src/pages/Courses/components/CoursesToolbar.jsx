import React from 'react'
import styles from '../Courses.module.css'

const CoursesToolbar = ({ 
  activeMainTab, 
  searchQuery, 
  setSearchQuery, 
  filterType, 
  setFilterType,
  sortBy, 
  setSortBy,
  resultCount, 
  totalCount, 
  hasActiveFilters, 
  onResetFilters,
  availableTags = [],
  selectedTag = 'all',
  setSelectedTag,
  viewMode = 'grid',
  setViewMode
}) => {
  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbarRow}>
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search by title, description or tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button 
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
              title="Clear search"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs (Library Only) */}
        {activeMainTab === 'library' && (
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.filterTab} ${filterType === 'all' ? styles.activeFilter : ''}`}
              onClick={() => setFilterType('all')}
            >
              <span>⚡ All</span>
            </button>
            <button 
              className={`${styles.filterTab} ${filterType === 'in-progress' ? styles.activeFilter : ''}`}
              onClick={() => setFilterType('in-progress')}
            >
              <span>⏳ In Progress</span>
            </button>
            <button 
              className={`${styles.filterTab} ${filterType === 'not-started' ? styles.activeFilter : ''}`}
              onClick={() => setFilterType('not-started')}
            >
              <span>🎯 Not Started</span>
            </button>
            <button 
              className={`${styles.filterTab} ${filterType === 'completed' ? styles.activeFilter : ''}`}
              onClick={() => setFilterType('completed')}
            >
              <span>✅ Completed</span>
            </button>
          </div>
        )}

        {/* Sort & View Mode Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className={styles.sortWrapper}>
            <label htmlFor="course-sort-select" className={styles.sortLabel}>
              <svg 
                width="15" 
                height="15" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="6" y1="12" x2="18" y2="12"></line>
                <line x1="9" y1="18" x2="15" y2="18"></line>
              </svg>
              <span>Sort by:</span>
            </label>
            <select 
              id="course-sort-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">✨ Newly Added First</option>
              <option value="oldest">⏳ Oldest Added First</option>
              <option value="title-asc">🔤 Title (A → Z)</option>
              <option value="title-desc">🔤 Title (Z → A)</option>
              {activeMainTab === 'library' && (
                <>
                  <option value="progress-desc">📈 Highest Progress</option>
                  <option value="progress-asc">📉 Lowest Progress</option>
                </>
              )}
              <option value="videos-desc">📹 Most Lessons / Videos</option>
              <option value="updated">⚡ Recently Updated</option>
            </select>
          </div>

          {/* View Mode Toggle Switcher: Grid vs List */}
          {setViewMode && (
            <div className={styles.viewToggleGroup} title="Switch between Grid and Compact List view">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.activeViewToggle : ''}`}
                title="Grid View"
                aria-label="Grid View"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.activeViewToggle : ''}`}
                title="List View"
                aria-label="List View"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Topic Tag Quick-Filter Pills */}
      {availableTags && availableTags.length > 0 && setSelectedTag && (
        <div className={styles.tagsScrollRow}>
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`${styles.tagPill} ${selectedTag === 'all' ? styles.activeTagPill : ''}`}
          >
            <span>🏷️ All Topics</span>
          </button>
          {availableTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
              className={`${styles.tagPill} ${selectedTag === tag ? styles.activeTagPill : ''}`}
            >
              <span>#{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Counter & Active Filter summary bar */}
      <div className={styles.metaRow}>
        <span className={styles.resultCountBadge}>
          Showing {resultCount} of {totalCount} {activeMainTab === 'library' ? 'enrolled courses' : 'public courses'}
          {selectedTag !== 'all' && <span> • Topic: <strong>#{selectedTag}</strong></span>}
        </span>

        {hasActiveFilters && (
          <button 
            onClick={onResetFilters} 
            className={styles.resetFiltersBtn}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Reset Filters
          </button>
        )}
      </div>
    </div>
  )
}

export default CoursesToolbar

