import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import { QUICK_IMPORT_PRESETS } from '../../../../data/quickImportPresets'
import styles from './StartersSection.module.css'

const categories = [
  { id: 'all', label: 'All Tracks' },
  { id: 'webdev', label: 'Web Dev' },
  { id: 'programming', label: 'Programming' },
  { id: 'cs', label: 'Computer Science' },
  { id: 'backend', label: 'Backend & AI' }
]

const StartersSection = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredPlaylists = activeCategory === 'all' 
    ? QUICK_IMPORT_PRESETS 
    : QUICK_IMPORT_PRESETS.filter(item => item.category === activeCategory)

  const handleImport = (playlistUrl) => {
    if (token) {
      navigate(`/courses?playlistUrl=${encodeURIComponent(playlistUrl)}`)
    } else {
      navigate(`/register?playlistUrl=${encodeURIComponent(playlistUrl)}`)
    }
  }

  return (
    <section className={styles.starters}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionHeaderBadge}>✨ Quick Start Tracks</span>
        <h2>Popular Recommended Playlists</h2>
        <p>Don't have a playlist link ready? Start instantly with these curated tracks.</p>
      </div>

      {/* Filter Tabs */}
      <div className={styles.categoryBar}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.activeTab : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Minimal Cards */}
      <div className={styles.startersGrid}>
        {filteredPlaylists.map((course) => (
          <div key={course.id} className={styles.starterCard}>
            <div className={styles.cardHeader}>
              <div className={styles.emojiWrapper}>
                <span>{course.emoji}</span>
              </div>
              <span className={styles.levelBadge}>{course.level}</span>
            </div>

            <div className={styles.cardBody}>
              <span className={styles.tagLabel}>{course.tag}</span>
              <h3 className={styles.cardTitle}>{course.title}</h3>
              <p className={styles.authorName}>By {course.author}</p>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.metaInfo}>
                <span>🎥 {course.videosCount} Lessons</span>
                <span className={styles.metaDot}>•</span>
                <span>⏱️ {course.duration}</span>
              </div>

              <button 
                onClick={() => handleImport(course.playlistUrl)}
                className={styles.importBtn}
              >
                <span>{token ? 'Import Track ⚡' : 'Enroll & Import 🚀'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StartersSection
