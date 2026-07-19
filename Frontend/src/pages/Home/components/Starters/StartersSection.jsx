import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './StartersSection.module.css'

const categories = [
  { id: 'all', label: 'All Tracks' },
  { id: 'webdev', label: 'Web Dev' },
  { id: 'programming', label: 'Programming' },
  { id: 'cs', label: 'Computer Science' }
]

const startersData = [
  {
    id: 'html-css',
    title: 'HTML & CSS Foundations',
    author: 'Net Ninja',
    videosCount: 15,
    duration: '6.5 hrs',
    emoji: '🎯',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ivBEEkowgQnPEpHHCIPgIp',
    level: 'Beginner',
    tag: 'Web Development',
    category: 'webdev'
  },
  {
    id: 'modern-js',
    title: 'Modern JavaScript Bootcamp',
    author: 'Net Ninja',
    videosCount: 24,
    duration: '11.2 hrs',
    emoji: '💻',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9i9Ae2D9GoMYSpMkc4_1ui9',
    level: 'Beginner - Inter',
    tag: 'Programming',
    category: 'programming'
  },
  {
    id: 'react-hooks',
    title: 'React & Hooks Masterclass',
    author: 'Net Ninja',
    videosCount: 30,
    duration: '14.8 hrs',
    emoji: '⚛️',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-TkyM96M367ZoZoNmDX',
    level: 'Intermediate',
    tag: 'Frontend Eng',
    category: 'webdev'
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    author: 'mycodeschool',
    videosCount: 45,
    duration: '18.5 hrs',
    emoji: '📊',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL2_aWCzGMAwI3W_yfNzCOIZ7Mx5oMaUtX',
    level: 'All Levels',
    tag: 'Computer Science',
    category: 'cs'
  },
  {
    id: 'nodejs-express',
    title: 'Node.js & Express API',
    author: 'Traversy Media',
    videosCount: 22,
    duration: '9.4 hrs',
    emoji: '🟢',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLillGF-RqqbdEw5zC3Yp4k-7O2D9c-j7d',
    level: 'Intermediate',
    tag: 'Backend Systems',
    category: 'programming'
  },
  {
    id: 'python-basics',
    title: 'Python Core & Scripting',
    author: 'Programming with Mosh',
    videosCount: 28,
    duration: '8.2 hrs',
    emoji: '🐍',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLTjRvDozrdlxj5wgH4qkvwSOdHLOC6V1f',
    level: 'Beginner',
    tag: 'Programming',
    category: 'programming'
  }
]

const StartersSection = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredPlaylists = activeCategory === 'all' 
    ? startersData 
    : startersData.filter(item => item.category === activeCategory)

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
