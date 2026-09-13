import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getChannelFeed } from '../../../services/api'
import DistractionFreeVideoModal from '../../../components/DistractionFreeVideoModal/DistractionFreeVideoModal'
import AddChannelModal from '../../../components/ChannelModal/AddChannelModal'
import ChannelPresetsModal from '../../../components/ChannelModal/ChannelPresetsModal'
import styles from './DashboardDailyPulse.module.css'

export default function DashboardDailyPulse() {
  const [videos, setVideos] = useState([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false)

  const fetchFeed = useCallback(async (cat = category) => {
    setLoading(true)
    try {
      const data = await getChannelFeed(cat, 6)
      if (data.videos) {
        setVideos(data.videos)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchFeed(category)
  }, [fetchFeed, category])

  return (
    <section className={styles.pulseSection}>
      <div className={styles.pulseGlow}></div>
      <div className={styles.pulseHeader}>
        <div className={styles.titleArea}>
          <div className={styles.pulseIcon}>⚡</div>
          <div>
            <h3 className={styles.pulseTitle}>
              Daily Focus Feeds & Pulse
              <span className={styles.pulseTag}>Distraction-Free</span>
            </h3>
          </div>
        </div>

        <Link to="/courses?tab=channels" className={styles.viewAllLink}>
          <span>View All Feeds</span>
          <span>→</span>
        </Link>
      </div>

      {/* Filter Category Pills */}
      <div className={styles.filterRow}>
        <button
          className={`${styles.filterPill} ${category === 'all' ? styles.filterPillActive : ''}`}
          onClick={() => setCategory('all')}
        >
          <span>🌐</span> All Feeds
        </button>

        <button
          className={`${styles.filterPill} ${category === 'motivation' ? styles.filterPillActive : ''}`}
          onClick={() => setCategory('motivation')}
        >
          <span>⚡</span> Motivation
        </button>

        <button
          className={`${styles.filterPill} ${category === 'knowledge' ? styles.filterPillActive : ''}`}
          onClick={() => setCategory('knowledge')}
        >
          <span>🧠</span> GK & Docs
        </button>

        <button
          className={`${styles.filterPill} ${category === 'news' ? styles.filterPillActive : ''}`}
          onClick={() => setCategory('news')}
        >
          <span>📰</span> Daily News
        </button>

        <button
          className={`${styles.filterPill} ${category === 'tech' ? styles.filterPillActive : ''}`}
          onClick={() => setCategory('tech')}
        >
          <span>💻</span> Tech & AI
        </button>

        <button
          className={`${styles.filterPill} ${category === 'academics' ? styles.filterPillActive : ''}`}
          onClick={() => setCategory('academics')}
        >
          <span>📚</span> Academics
        </button>

        <button
          className={`${styles.filterPill} ${category === 'finance' ? styles.filterPillActive : ''}`}
          onClick={() => setCategory('finance')}
        >
          <span>💼</span> Finance
        </button>
      </div>

      {/* Feed Content */}
      {loading ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          Loading daily focus updates...
        </div>
      ) : videos.length === 0 ? (
        <div className={styles.emptyCard}>
          <p className={styles.emptyTitle}>No Channel Updates in this Category</p>
          <p className={styles.emptySub}>
            Subscribe to your favourite creators or choose our curated educational starter channels for zero-distraction morning motivation and daily GK.
          </p>
          <div className={styles.emptyBtns}>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={() => setIsAddModalOpen(true)}
            >
              + Add Channel
            </button>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              onClick={() => setIsPresetsModalOpen(true)}
            >
              ✨ Pick Starter Presets
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.videoGrid}>
          {videos.slice(0, 4).map(video => {
            const timeAgo = video.publishedAt
              ? new Date(video.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })
              : ''

            return (
              <div
                key={video.youtubeId}
                className={styles.pulseCard}
                onClick={() => setActiveVideo(video)}
              >
                <div className={styles.thumbWrap}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className={styles.thumbImg}
                    loading="lazy"
                  />
                  {video.duration && (
                    <span className={styles.durationBadge}>{video.duration}</span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <h4 className={styles.cardTitle}>{video.title}</h4>
                  <div className={styles.channelRow}>
                    <span className={styles.channelName}>{video.channelTitle}</span>
                    {timeAgo && <span>{timeAgo}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <AddChannelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchFeed(category)}
      />

      <ChannelPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onChannelSubscribed={() => fetchFeed(category)}
      />

      {activeVideo && (
        <DistractionFreeVideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          onSaveSuccess={() => {}}
        />
      )}
    </section>
  )
}
