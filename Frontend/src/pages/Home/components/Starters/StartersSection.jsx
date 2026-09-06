import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import { CURATED_TRACKS_CATEGORIES } from '../../../../data/curatedTracksData'
import styles from './StartersSection.module.css'

const LeftScoop = () => (
  <svg 
    className={styles.leftScoop} 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M0 16 C8.84 16 16 8.84 16 0 L16 16 Z" 
      fill="var(--curated-bg)" 
    />
    <path 
      d="M0 16 C8.84 16 16 8.84 16 0" 
      stroke="var(--curated-border)" 
      strokeWidth="1.5" 
      fill="none"
    />
  </svg>
)

const RightScoop = () => (
  <svg 
    className={styles.rightScoop} 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M0 0 C0 8.84 7.16 16 16 16 L0 16 Z" 
      fill="var(--curated-bg)" 
    />
    <path 
      d="M0 0 C0 8.84 7.16 16 16 16" 
      stroke="var(--curated-border)" 
      strokeWidth="1.5" 
      fill="none"
    />
  </svg>
)

const getItemIcon = (id) => {
  switch (id) {
    case 'banking-exams':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      )
    case 'ssc-railway':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="16" rx="2"></rect>
          <path d="M4 11h16"></path>
          <path d="M12 3v8"></path>
          <path d="m8 19-2 3"></path>
          <path d="m16 19 2 3"></path>
          <circle cx="8" cy="15" r="1"></circle>
          <circle cx="16" cy="15" r="1"></circle>
        </svg>
      )
    case 'engineering-entrance':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      )
    case 'medical-entrance':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      )
    case 'fullstack-webdev':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      )
    case 'datascience-ai':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
          <path d="M9 1v3"></path>
          <path d="M15 1v3"></path>
          <path d="M9 20v3"></path>
          <path d="M15 20v3"></path>
          <path d="M20 9h3"></path>
          <path d="M20 14h3"></path>
          <path d="M1 9h3"></path>
          <path d="M1 14h3"></path>
        </svg>
      )
    case 'upsc-cse':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    case 'state-psc-judiciary':
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"></path>
          <path d="M3 10h18"></path>
          <path d="M5 6l7-3 7 3"></path>
          <path d="M4 10v11"></path>
          <path d="M20 10v11"></path>
          <path d="M8 14v4"></path>
          <path d="M12 14v4"></path>
          <path d="M16 14v4"></path>
        </svg>
      )
  }
}

const StartersSection = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [activeCategoryId, setActiveCategoryId] = useState('gov-jobs')

  const activeCategory = CURATED_TRACKS_CATEGORIES.find(cat => cat.id === activeCategoryId) || CURATED_TRACKS_CATEGORIES[0]
  const activeIndex = CURATED_TRACKS_CATEGORIES.findIndex(cat => cat.id === activeCategoryId)
  const isFirstActive = activeIndex === 0
  const isLastActive = activeIndex === CURATED_TRACKS_CATEGORIES.length - 1

  const handleExploreTrack = (playlistUrl, searchQuery) => {
    if (playlistUrl) {
      if (token) {
        navigate(`/courses?playlistUrl=${encodeURIComponent(playlistUrl)}`)
      } else {
        navigate(`/register?playlistUrl=${encodeURIComponent(playlistUrl)}`)
      }
    } else if (searchQuery) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate('/courses')
    }
  }

  const handleSubCategoryClick = (sub) => {
    if (sub.searchQuery) {
      navigate(`/courses?search=${encodeURIComponent(sub.searchQuery)}`)
    } else {
      navigate(`/courses?search=${encodeURIComponent(sub.title)}`)
    }
  }

  return (
    <section className={styles.curatedSection}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>Curated Directory</span>
        <h2 className={styles.sectionTitle}>Explore Curated Learning Tracks</h2>
        <p className={styles.sectionSubtitle}>
          Select a category to browse structured exam syllabus, engineering pathways, and career tracks curated for focused learning.
        </p>
      </div>

      {/* Stepped Contiguous Curated Frame */}
      <div className={styles.steppedCuratedWrapper}>
        {/* Top Category Tabs Bar sitting along top edge */}
        <div className={styles.tabBar} role="tablist">
          {CURATED_TRACKS_CATEGORIES.map((category, index) => {
            const isActive = category.id === activeCategoryId
            const isFirst = index === 0
            const isLast = index === CURATED_TRACKS_CATEGORIES.length - 1
            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategoryId(category.id)}
                className={`
                  ${styles.tabButton} 
                  ${styles['tab_' + category.id]} 
                  ${isActive ? styles.activeTabButton : styles.inactiveTabButton}
                  ${isActive && isFirst ? styles.activeFirstTab : ''}
                  ${isActive && isLast ? styles.activeLastTab : ''}
                `}
              >
                {/* SVG Curves for continuous corner scoop */}
                {isActive && !isFirst && <LeftScoop />}
                {isActive && !isLast && <RightScoop />}

                <div className={styles.tabText}>
                  <span className={styles.tabLine1}>{category.name}</span>
                  {category.nameSecondLine && (
                    <span className={styles.tabLine2}>{category.nameSecondLine}</span>
                  )}
                </div>
                <div className={styles.tabThumb}>
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className={styles.tabThumbImg}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Main Curated Container seamlessly continuous with the active tab */}
        <div 
          className={`
            ${styles.mainContainer} 
            ${isFirstActive ? styles.firstTabActive : ''}
            ${isLastActive ? styles.lastTabActive : ''}
          `}
        >
          {/* Content Area for Active Category */}
          <div className={styles.contentArea} key={activeCategoryId}>
            {/* Row 1: Featured Cards (2 Columns) */}
            <div className={styles.featuredGrid}>
              {activeCategory.featured.map((item) => (
                <div key={item.id} className={styles.featuredCard}>
                  <div className={styles.featuredContent}>
                    {/* Top Row: Icon Badge & Status Tag */}
                    <div className={styles.cardHeaderRow}>
                      <div className={styles.badgeIconWrapper}>
                        {getItemIcon(item.id)}
                      </div>
                      <span className={styles.featuredTag}>Featured Pathway</span>
                    </div>

                    {/* Title & Subtext */}
                    <h3 className={styles.featuredTitle}>{item.title}</h3>
                    <p className={styles.featuredSubtext}>{item.subtext}</p>

                    {/* Action Pill Button */}
                    <div className={styles.actionBtnWrapper}>
                      <button
                        onClick={() => handleExploreTrack(item.playlistUrl, item.searchQuery)}
                        className={styles.featuredActionBtn}
                      >
                        <span>{item.buttonText || 'Explore Exams'}</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={styles.btnArrow}
                        >
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Framed Media Visual on Right */}
                  <div className={styles.featuredImageWrapper}>
                    <div className={styles.imageInnerFrame}>
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className={styles.featuredImage}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className={styles.imageOverlayGradient}></div>
                      <span className={styles.trackPillBadge}>Curated</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2 & 3: Subcategory Cards Grid (3 Columns) */}
            <div className={styles.subcategoriesGrid}>
              {activeCategory.subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className={styles.subCard}
                  onClick={() => handleSubCategoryClick(sub)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSubCategoryClick(sub)
                    }
                  }}
                >
                  {/* Badge Icon */}
                  <div className={styles.badgeIconWrapper}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 21h18"></path>
                      <path d="M3 10h18"></path>
                      <path d="M5 6l7-3 7 3"></path>
                      <path d="M4 10v11"></path>
                      <path d="M20 10v11"></path>
                      <path d="M8 14v4"></path>
                      <path d="M12 14v4"></path>
                      <path d="M16 14v4"></path>
                    </svg>
                  </div>

                  <h4 className={styles.subCardTitle}>{sub.title}</h4>
                  <p className={styles.subCardSubtext}>{sub.subtext}</p>

                  {/* Explore Link with Arrow */}
                  <div className={styles.exploreLinkRow}>
                    <span className={styles.exploreLinkText}>Explore Exams</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.exploreLinkArrow}
                    >
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StartersSection
