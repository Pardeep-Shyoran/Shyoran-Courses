import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getUserChannels, getChannelFeed, deleteChannel, updateChannel } from '../../../services/api'
import DistractionFreeVideoModal from '../../../components/DistractionFreeVideoModal/DistractionFreeVideoModal'
import AddChannelModal from '../../../components/ChannelModal/AddChannelModal'
import ChannelPresetsModal from '../../../components/ChannelModal/ChannelPresetsModal'
import styles from './FocusFeedsTab.module.css'

// Helper to determine format: full video, short, or live stream
function detectFormat(video) {
  if (video.videoType === 'short' || video.videoType === 'live') {
    return video.videoType
  }

  const title = (video.title || '').toLowerCase()
  const desc = (video.description || '').toLowerCase()
  const dur = video.duration || ''

  // Live detection
  if (
    title.includes('live') ||
    title.includes('stream') ||
    title.includes('🔴') ||
    title.includes('the hindu analysis') ||
    title.includes('daily current affairs') ||
    desc.includes('streamed live')
  ) {
    return 'live'
  }

  // Shorts detection
  if (
    /#\w*short/i.test(title) ||
    /#\w*short/i.test(desc) ||
    title.includes('trendingshorts') ||
    title.includes('ytshorts')
  ) {
    return 'short'
  }

  // Duration checks
  if (dur) {
    const parts = dur.split(':').map(Number)
    let totalSec = 0
    if (parts.length === 3) totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2]
    else if (parts.length === 2) totalSec = parts[0] * 60 + parts[1]

    if (totalSec > 0 && totalSec <= 60) {
      return 'short'
    }
    if (totalSec > 60 && totalSec <= 180 && title.includes('#')) {
      return 'short'
    }
  }

  return 'video'
}

const categoryMeta = {
  motivation: { label: 'Motivation', icon: '⚡' },
  knowledge: { label: 'GK & Docs', icon: '🧠' },
  news: { label: 'Daily News', icon: '📰' },
  tech: { label: 'Tech & AI', icon: '💻' },
  academics: { label: 'Academics', icon: '📚' },
  finance: { label: 'Finance', icon: '💼' },
  other: { label: 'Other', icon: '🌟' }
}

export default function FocusFeedsTab() {
  const [channels, setChannels] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedLoading, setFeedLoading] = useState(false)
  const [error, setError] = useState(null)

  // Filters & Views
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedChannelId, setSelectedChannelId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formatFilter, setFormatFilter] = useState('all') // 'all', 'video', 'short', 'live'
  const [hideShorts, setHideShorts] = useState(false) // Distraction-free toggle
  const [durationFilter, setDurationFilter] = useState('all') // 'all', 'short', 'long'
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'by-channel'

  // Per-shelf format filters for "by-channel" mode
  const [shelfFormatMap, setShelfFormatMap] = useState({})

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)

  const categories = [
    { id: 'all', label: 'All Feeds', icon: '🌐', className: '' },
    { id: 'motivation', label: 'Motivation', icon: '⚡', className: styles.categoryTabMotivation },
    { id: 'knowledge', label: 'GK & Docs', icon: '🧠', className: styles.categoryTabKnowledge },
    { id: 'news', label: 'Daily News', icon: '📰', className: styles.categoryTabNews },
    { id: 'tech', label: 'Tech & AI', icon: '💻', className: styles.categoryTabTech },
    { id: 'academics', label: 'Academics', icon: '📚', className: styles.categoryTabAcademics },
    { id: 'finance', label: 'Finance', icon: '💼', className: styles.categoryTabFinance }
  ]

  // Load user's subscribed channels
  const loadChannels = useCallback(async () => {
    try {
      const data = await getUserChannels()
      if (data.channels) {
        setChannels(data.channels)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load your channels.')
    }
  }, [])

  // Load aggregated video feed
  const loadFeed = useCallback(async (category = selectedCategory, channelId = selectedChannelId) => {
    setFeedLoading(true)
    try {
      const data = await getChannelFeed(category, channelId)
      if (data.videos) {
        setVideos(data.videos)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to refresh feed.')
    } finally {
      setFeedLoading(false)
    }
  }, [selectedCategory, selectedChannelId])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadChannels(), loadFeed(selectedCategory, selectedChannelId)])
      setLoading(false)
    }
    init()
  }, [loadChannels, loadFeed, selectedCategory, selectedChannelId])

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setSelectedChannelId(null)
    loadFeed(cat, null)
  }

  const handleSelectChannel = (channelId) => {
    if (selectedChannelId === channelId) {
      setSelectedChannelId(null)
      loadFeed(selectedCategory, null)
    } else {
      setSelectedChannelId(channelId)
      loadFeed('all', channelId)
    }
  }

  const handleDeleteChannel = async (id, title) => {
    if (!window.confirm(`Unsubscribe from "${title}"? Videos from this channel will no longer appear in your feed.`)) {
      return
    }

    try {
      await deleteChannel(id)
      setChannels(channels.filter(c => c._id !== id))
      if (selectedChannelId === id) setSelectedChannelId(null)
      loadFeed(selectedCategory, null)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to unsubscribe.')
    }
  }

  const handleUpdateChannelCategory = async (channelId, newCategory) => {
    try {
      await updateChannel(channelId, { category: newCategory })
      setChannels(prev =>
        prev.map(c => (c._id === channelId ? { ...c, category: newCategory } : c))
      )
      loadFeed(selectedCategory, selectedChannelId)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update channel category.')
    }
  }

  // Parse duration string to minutes
  const parseDurationMinutes = (durationStr) => {
    if (!durationStr) return 0
    const parts = durationStr.split(':').map(Number)
    if (parts.length === 3) return parts[0] * 60 + parts[1]
    if (parts.length === 2) return parts[0]
    return 0
  }

  // Count videos by format
  const formatCounts = useMemo(() => {
    let videoCount = 0
    let shortCount = 0
    let liveCount = 0

    let baseList = videos
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      baseList = baseList.filter(v =>
        v.title?.toLowerCase().includes(q) ||
        v.channelTitle?.toLowerCase().includes(q)
      )
    }

    baseList.forEach(v => {
      const fmt = detectFormat(v)
      if (fmt === 'short') shortCount++
      else if (fmt === 'live') liveCount++
      else videoCount++
    })

    return {
      all: baseList.length,
      video: videoCount,
      short: shortCount,
      live: liveCount
    }
  }, [videos, searchQuery])

  // Filter videos by search query, format (video/short/live), duration, and hideShorts toggle
  const filteredVideos = useMemo(() => {
    let list = videos

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(v =>
        v.title?.toLowerCase().includes(q) ||
        v.channelTitle?.toLowerCase().includes(q)
      )
    }

    // Format division: video, short, live
    if (hideShorts) {
      list = list.filter(v => detectFormat(v) !== 'short')
    } else if (formatFilter !== 'all') {
      list = list.filter(v => detectFormat(v) === formatFilter)
    }

    // Duration filter
    if (durationFilter === 'short') {
      list = list.filter(v => parseDurationMinutes(v.duration) <= 10)
    } else if (durationFilter === 'long') {
      list = list.filter(v => parseDurationMinutes(v.duration) >= 15)
    }

    return list
  }, [videos, searchQuery, formatFilter, hideShorts, durationFilter])

  // Group videos by channel for "by-channel" view mode
  const videosByChannel = useMemo(() => {
    const map = new Map()
    channels.forEach(ch => {
      map.set(ch.channelId, {
        channel: ch,
        videos: []
      })
    })

    filteredVideos.forEach(v => {
      if (map.has(v.channelId)) {
        map.get(v.channelId).videos.push(v)
      } else {
        map.set(v.channelId, {
          channel: {
            _id: v.channelDbId,
            channelId: v.channelId,
            channelTitle: v.channelTitle,
            avatarUrl: v.channelAvatar,
            category: v.category
          },
          videos: [v]
        })
      }
    })

    return Array.from(map.values()).filter(group =>
      selectedCategory === 'all' || group.channel?.category === selectedCategory
    )
  }, [channels, filteredVideos, selectedCategory])

  const activeChannelDoc = useMemo(() => {
    return channels.find(c => c.channelId === selectedChannelId || c._id === selectedChannelId)
  }, [channels, selectedChannelId])

  return (
    <div className={styles.container}>
      {error && (
        <div style={{ color: '#f87171', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
          {error}
        </div>
      )}

      {/* Hero Header with Sans-Serif and Terracotta Gradient */}
      <section className={styles.feedHero}>
        <div className={styles.feedHeroGlow}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroTextGroup}>
            <div className={styles.heroBadge}>
              <span>🛡️</span> Distraction-Free Student Hub
            </div>
            <h1 className={styles.heroTitle}>
              Focus Feeds & <span className={styles.gradientText}>Student Channels</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Clean, categorized YouTube updates for daily motivation, GK documentaries, tech tutorials, and daily news divided into lectures, shorts, and live streams without algorithmic rabbit holes.
            </p>
          </div>

          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.addChannelBtn}
              onClick={() => setIsAddModalOpen(true)}
            >
              <span>+</span>
              <span>Add Channel</span>
            </button>

            <button
              type="button"
              className={styles.explorePresetsBtn}
              onClick={() => setIsPresetsModalOpen(true)}
            >
              <span>✨</span>
              <span>Curated Channels</span>
            </button>
          </div>
        </div>
      </section>

      {/* Subscribed Channels Rail with Interactive Filtering */}
      {channels.length > 0 && (
        <section className={styles.channelsRailSection}>
          <div className={styles.railHeader}>
            <div className={styles.railTitleGroup}>
              <span className={styles.railTitle}>
                <span>📺</span> Subscribed Channels
              </span>
              <span className={styles.railCounterBadge}>
                {channels.length} {channels.length === 1 ? 'Creator' : 'Creators'}
              </span>
              <span className={styles.railSubtext}>• Click any card to filter feed</span>
            </div>

            <div className={styles.railActionsGroup}>
              {selectedChannelId && (
                <button
                  type="button"
                  className={styles.clearFilterBtn}
                  onClick={() => setSelectedChannelId(null)}
                >
                  Show All Channels ✕
                </button>
              )}
              <button
                type="button"
                className={styles.addChannelSmallBtn}
                onClick={() => setIsAddModalOpen(true)}
              >
                <span>+</span> Add Channel
              </button>
            </div>
          </div>

          <div className={styles.creatorCardsList}>
            {channels.map(ch => {
              const isSelected = selectedChannelId === ch.channelId || selectedChannelId === ch._id
              const catInfo = categoryMeta[ch.category] || { label: ch.category || 'Feed', icon: '📺' }
              return (
                <div
                  key={ch._id}
                  className={`${styles.creatorCard} ${isSelected ? styles.creatorCardActive : ''}`}
                  onClick={() => handleSelectChannel(ch.channelId)}
                  title={`Click to ${isSelected ? 'clear filter' : `filter feed by ${ch.channelTitle}`}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectChannel(ch.channelId)}
                >
                  <div className={styles.creatorCardAvatarWrap}>
                    {ch.avatarUrl ? (
                      <img src={ch.avatarUrl} alt={ch.channelTitle} className={styles.creatorCardAvatar} />
                    ) : (
                      <div className={styles.creatorCardAvatarFallback}>📺</div>
                    )}
                    {isSelected && <span className={styles.activeCheckDot}>✓</span>}
                  </div>

                  <div className={styles.creatorCardInfo}>
                    <div className={styles.creatorCardTitleRow}>
                      <span className={styles.creatorCardTitle}>
                        {ch.customTitle || ch.channelTitle}
                      </span>
                      {isSelected && (
                        <span className={styles.creatorFilteringBadge}>Filtered</span>
                      )}
                    </div>
                    <div className={styles.creatorCardMetaRow}>
                      <span className={styles.creatorCategoryPill}>
                        <span>{catInfo.icon}</span> {catInfo.label}
                      </span>
                      {ch.channelHandle && (
                        <span className={styles.creatorHandleText}>{ch.channelHandle}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.creatorCardUnsubBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteChannel(ch._id, ch.channelTitle)
                    }}
                    title={`Unsubscribe from ${ch.channelTitle}`}
                    aria-label={`Unsubscribe from ${ch.channelTitle}`}
                  >
                    ✕
                  </button>
                </div>
              )
            })}

            {/* Quick Add Channel Card */}
            <button
              type="button"
              className={styles.addCreatorCard}
              onClick={() => setIsAddModalOpen(true)}
              title="Subscribe to another YouTube channel"
            >
              <div className={styles.addCreatorIcon}>+</div>
              <div className={styles.addCreatorInfo}>
                <span className={styles.addCreatorTitle}>Add Channel</span>
                <span className={styles.addCreatorSub}>Custom feed</span>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* Active Channel Filter Banner */}
      {activeChannelDoc && (
        <div className={styles.filterBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Filtered by creator:</span>
            <strong>{activeChannelDoc.customTitle || activeChannelDoc.channelTitle}</strong>
            <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>({filteredVideos.length} videos found)</span>
          </div>
          <button
            type="button"
            className={styles.clearFilterBtn}
            onClick={() => setSelectedChannelId(null)}
          >
            Show All Channels ✕
          </button>
        </div>
      )}

      {/* Unified 2-Row Controls System */}
      <section className={styles.toolbarContainer}>
        {/* Row 1: Category Navigation Tabs & View Mode Switcher */}
        <div className={styles.toolbarRowPrimary}>
          <div className={styles.categoryTabs}>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryTab} ${cat.className} ${selectedCategory === cat.id ? styles.categoryTabActive : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.toolbarRightGroup}>
            {/* View Mode Toggle */}
            <div className={styles.viewModeToggle} title="Switch view layout">
              <button
                type="button"
                className={`${styles.viewModeBtn} ${viewMode === 'grid' ? styles.viewModeBtnActive : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Feed Grid</span>
              </button>

              <button
                type="button"
                className={`${styles.viewModeBtn} ${viewMode === 'by-channel' ? styles.viewModeBtnActive : ''}`}
                onClick={() => setViewMode('by-channel')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 6h16M4 12h16M4 18h7"></path>
                </svg>
                <span>By Channel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Search Input, Format Tabs, Distraction-Free Shield & Duration */}
        <div className={styles.toolbarRowSecondary}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search feed by title or channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.formatControlsGroup}>
            {/* Format Tabs with Counts */}
            <div className={styles.formatTabs}>
              <button
                type="button"
                className={`${styles.formatTab} ${formatFilter === 'all' && !hideShorts ? styles.formatTabActive : ''}`}
                onClick={() => {
                  setFormatFilter('all')
                  setHideShorts(false)
                }}
              >
                <span>🌐 All</span>
                <span className={styles.formatBadgeCount}>{formatCounts.all}</span>
              </button>

              <button
                type="button"
                className={`${styles.formatTab} ${formatFilter === 'video' ? styles.formatTabActive : ''}`}
                onClick={() => {
                  setFormatFilter('video')
                  setHideShorts(false)
                }}
              >
                <span>📹 Videos</span>
                <span className={styles.formatBadgeCount}>{formatCounts.video}</span>
              </button>

              <button
                type="button"
                className={`${styles.formatTab} ${formatFilter === 'short' && !hideShorts ? styles.formatTabActive : ''}`}
                onClick={() => {
                  setFormatFilter('short')
                  setHideShorts(false)
                }}
              >
                <span>⚡ Shorts</span>
                <span className={styles.formatBadgeCount}>{formatCounts.short}</span>
              </button>

              <button
                type="button"
                className={`${styles.formatTab} ${formatFilter === 'live' ? styles.formatTabActive : ''}`}
                onClick={() => {
                  setFormatFilter('live')
                  setHideShorts(false)
                }}
              >
                <span>🔴 Live</span>
                <span className={styles.formatBadgeCount}>{formatCounts.live}</span>
              </button>
            </div>

            {/* Distraction-Free Shorts Shield Toggle */}
            <button
              type="button"
              className={`${styles.shortsShieldBtn} ${hideShorts ? styles.shortsShieldBtnActive : ''}`}
              onClick={() => setHideShorts(!hideShorts)}
              title="Toggle hiding short-form content for deep student focus"
            >
              <span>🛡️</span>
              <span>{hideShorts ? 'Shorts Blocked' : 'Hide Shorts'}</span>
            </button>

            {/* Duration Filters */}
            <div className={styles.durationFilters}>
              <span className={styles.durationLabel}>Length:</span>
              <button
                type="button"
                className={`${styles.durationBtn} ${durationFilter === 'all' ? styles.durationBtnActive : ''}`}
                onClick={() => setDurationFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`${styles.durationBtn} ${durationFilter === 'short' ? styles.durationBtnActive : ''}`}
                onClick={() => setDurationFilter('short')}
              >
                &lt; 10m
              </button>
              <button
                type="button"
                className={`${styles.durationBtn} ${durationFilter === 'long' ? styles.durationBtnActive : ''}`}
                onClick={() => setDurationFilter('long')}
              >
                &gt; 15m
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feed Presentation: Shimmer Skeleton vs Grid vs Group By Channel Mode */}
      {loading || feedLoading ? (
        <div className={styles.feedGrid}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className={styles.skeletonCard}>
              <div className={styles.skeletonThumb}></div>
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} style={{ width: '85%' }}></div>
                <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
                <div className={styles.skeletonLine} style={{ width: '40%', marginTop: '0.4rem' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📺</div>
          <h3 className={styles.emptyTitle}>
            {channels.length === 0
              ? 'No Channels Subscribed Yet'
              : selectedCategory !== 'all'
              ? `No videos found in ${selectedCategory} category`
              : 'No videos match current filters'}
          </h3>
          <p className={styles.emptySubtitle}>
            {channels.length === 0
              ? 'Subscribe to your favourite YouTube creators or start with our curated student presets for instant morning motivation and daily GK.'
              : 'Try clearing your search query, switching format filters (All, Videos, Shorts, Live), or exploring recommended channels.'}
          </p>
          <div className={styles.emptyButtons}>
            <button
              type="button"
              className={styles.addChannelBtn}
              onClick={() => setIsAddModalOpen(true)}
            >
              + Add Channel
            </button>
            <button
              type="button"
              className={styles.explorePresetsBtn}
              onClick={() => setIsPresetsModalOpen(true)}
            >
              ✨ Pick Starter Presets
            </button>
          </div>
        </div>
      ) : viewMode === 'by-channel' ? (
        /* Group by Channel View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {videosByChannel.map(group => {
            const ch = group.channel
            const shelfKey = ch.channelId || ch._id
            const currentShelfFormat = shelfFormatMap[shelfKey] || 'all'

            let shelfVideos = group.videos
            if (currentShelfFormat !== 'all') {
              shelfVideos = shelfVideos.filter(v => detectFormat(v) === currentShelfFormat)
            }

            const shelfCounts = {
              all: group.videos.length,
              video: group.videos.filter(v => detectFormat(v) === 'video').length,
              short: group.videos.filter(v => detectFormat(v) === 'short').length,
              live: group.videos.filter(v => detectFormat(v) === 'live').length
            }

            if (group.videos.length === 0) return null

            return (
              <div key={shelfKey} className={styles.channelShelf}>
                <div className={styles.channelShelfHeader}>
                  <div className={styles.channelShelfInfo}>
                    {ch.avatarUrl ? (
                      <img src={ch.avatarUrl} alt={ch.channelTitle} className={styles.channelShelfAvatar} />
                    ) : (
                      <div className={styles.channelShelfAvatar} style={{ background: 'rgba(226, 88, 62, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📺</div>
                    )}
                    <div>
                      <h3 className={styles.channelShelfTitle}>
                        {ch.customTitle || ch.channelTitle}
                      </h3>
                      <p className={styles.channelShelfMeta}>
                        {ch.channelHandle ? `${ch.channelHandle} • ` : ''}{group.videos.length} videos
                      </p>
                    </div>
                  </div>

                  <div className={styles.channelShelfActions}>
                    {/* Shelf-specific format filter tabs */}
                    <div className={styles.shelfFormatTabs}>
                      <button
                        type="button"
                        className={`${styles.shelfFormatTab} ${currentShelfFormat === 'all' ? styles.shelfFormatTabActive : ''}`}
                        onClick={() => setShelfFormatMap(prev => ({ ...prev, [shelfKey]: 'all' }))}
                      >
                        All ({shelfCounts.all})
                      </button>
                      {shelfCounts.video > 0 && (
                        <button
                          type="button"
                          className={`${styles.shelfFormatTab} ${currentShelfFormat === 'video' ? styles.shelfFormatTabActive : ''}`}
                          onClick={() => setShelfFormatMap(prev => ({ ...prev, [shelfKey]: 'video' }))}
                        >
                          📹 Videos ({shelfCounts.video})
                        </button>
                      )}
                      {shelfCounts.short > 0 && (
                        <button
                          type="button"
                          className={`${styles.shelfFormatTab} ${currentShelfFormat === 'short' ? styles.shelfFormatTabActive : ''}`}
                          onClick={() => setShelfFormatMap(prev => ({ ...prev, [shelfKey]: 'short' }))}
                        >
                          ⚡ Shorts ({shelfCounts.short})
                        </button>
                      )}
                      {shelfCounts.live > 0 && (
                        <button
                          type="button"
                          className={`${styles.shelfFormatTab} ${currentShelfFormat === 'live' ? styles.shelfFormatTabActive : ''}`}
                          onClick={() => setShelfFormatMap(prev => ({ ...prev, [shelfKey]: 'live' }))}
                        >
                          🔴 Live ({shelfCounts.live})
                        </button>
                      )}
                    </div>

                    <select
                      className={styles.categorySelectDropdown}
                      value={ch.category || 'motivation'}
                      onChange={(e) => handleUpdateChannelCategory(ch._id, e.target.value)}
                    >
                      <option value="motivation">⚡ Motivation</option>
                      <option value="knowledge">🧠 GK & Docs</option>
                      <option value="news">📰 Daily News</option>
                      <option value="tech">💻 Tech & AI</option>
                      <option value="academics">📚 Academics</option>
                      <option value="finance">💼 Finance</option>
                      <option value="other">🌟 Other</option>
                    </select>

                    <button
                      type="button"
                      className={styles.clearFilterBtn}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleDeleteChannel(ch._id, ch.channelTitle)}
                    >
                      Unsubscribe
                    </button>
                  </div>
                </div>

                <div className={styles.feedGrid}>
                  {shelfVideos.slice(0, 12).map(video => (
                    <VideoCardItem
                      key={video.youtubeId}
                      video={video}
                      onPlay={() => setActiveVideo(video)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Chronological Feed Grid */
        <div className={styles.feedGrid}>
          {filteredVideos.map(video => (
            <VideoCardItem
              key={video.youtubeId}
              video={video}
              onPlay={() => setActiveVideo(video)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddChannelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadChannels()
          loadFeed(selectedCategory, selectedChannelId)
        }}
      />

      <ChannelPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onChannelSubscribed={() => {
          loadChannels()
          loadFeed(selectedCategory, selectedChannelId)
        }}
      />

      {activeVideo && (
        <DistractionFreeVideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          onSaveSuccess={() => {}}
        />
      )}
    </div>
  )
}

function VideoCardItem({ video, onPlay }) {
  const format = detectFormat(video)
  const timeAgo = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : ''

  const categoryTag = {
    motivation: '⚡ Motivation',
    knowledge: '🧠 GK & Docs',
    news: '📰 News',
    tech: '💻 Tech & AI',
    academics: '📚 Academics',
    finance: '💼 Finance'
  }[video.category] || '📺 Feed'

  return (
    <div className={styles.videoCard} onClick={onPlay} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onPlay()}>
      <div className={styles.thumbnailWrapper}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className={styles.thumbnailImg}
          loading="lazy"
        />

        {/* Play Icon Overlay on Hover */}
        <div className={styles.playHoverOverlay}>
          <div className={styles.playIconCircle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>

        {/* Category Badge on Card */}
        <span className={styles.categoryBadgeOnCard}>{categoryTag}</span>

        {/* Format Badge: Short / Live / Video */}
        {format === 'short' ? (
          <span className={`${styles.formatBadgeTag} ${styles.formatBadgeShort}`}>
            ⚡ Short
          </span>
        ) : format === 'live' ? (
          <span className={`${styles.formatBadgeTag} ${styles.formatBadgeLive}`}>
            <span className={styles.livePulseDot}></span>
            Live
          </span>
        ) : (
          <span className={`${styles.formatBadgeTag} ${styles.formatBadgeVideo}`}>
            📹 Video
          </span>
        )}

        {video.duration && (
          <span className={styles.durationBadge}>{video.duration}</span>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{video.title}</h3>
        <div className={styles.cardMeta}>
          <div className={styles.cardChannel} title={video.channelTitle}>
            {video.channelAvatar ? (
              <img
                src={video.channelAvatar}
                alt={video.channelTitle}
                className={styles.cardChannelAvatar}
              />
            ) : (
              <span>📺</span>
            )}
            <span>{video.channelTitle}</span>
          </div>
          {timeAgo && <span>{timeAgo}</span>}
        </div>
      </div>
    </div>
  )
}
