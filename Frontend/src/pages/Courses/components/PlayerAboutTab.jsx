import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import styles from '../CoursePlayer.module.css'

// Helper function to extract valid URLs from markdown/raw text
function extractUrls(text) {
  if (!text) return []
  const urlRegex = /(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)/gi
  const matches = text.match(urlRegex) || []
  
  const cleanUrls = matches.map(url => {
    let clean = url.replace(/[.,;)]+$/, '')
    if (clean.startsWith('www.')) {
      clean = 'https://' + clean
    }
    return clean
  })

  return Array.from(new Set(cleanUrls))
}

function getUrlDomain(url) {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return 'external link'
  }
}

function getLinkIcon(url) {
  const domain = getUrlDomain(url).toLowerCase()
  if (domain.includes('github')) return '🐙'
  if (domain.includes('youtube') || domain.includes('youtu.be')) return '📺'
  if (domain.includes('docs') || domain.includes('documentation')) return '📚'
  if (domain.includes('python')) return '🐍'
  if (domain.includes('mozilla') || domain.includes('mdn')) return '🌐'
  if (domain.includes('medium') || domain.includes('dev.to')) return '📝'
  if (domain.includes('leetcode') || domain.includes('geeksforgeeks')) return '💡'
  return '🔗'
}

const PlayerAboutTab = ({ course, activeVideo }) => {
  if (!course) return null

  // Collect all links from course description & active video notes/description
  const allExtractedLinks = useMemo(() => {
    const combinedText = `${course.description || ''} ${activeVideo?.notes || ''}`
    return extractUrls(combinedText)
  }, [course.description, activeVideo?.notes])

  return (
    <div className={styles.aboutContainer}>
      {/* Course Header & Title */}
      <div className={styles.aboutHeaderSection}>
        <h3 className={styles.aboutTitle}>{course.title}</h3>
        {course.user && (
          <p className={styles.aboutAuthorInfo}>
            👤 Created by <strong>{course.user.name || 'Instructor'}</strong>
          </p>
        )}
      </div>

      {/* Main Course Description with Full Markdown & Link Formatting */}
      <div className={styles.aboutDescSection}>
        <h4 className={styles.sectionSubtitle}>📋 Course Overview & Details</h4>
        <div className={styles.aboutMarkdown}>
          {course.description && course.description.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                a: ({ href, children, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.aboutLink}
                    {...props}
                  >
                    <span>{children}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                )
              }}
            >
              {course.description}
            </ReactMarkdown>
          ) : (
            <p className={styles.emptyDescText}>No description provided for this course.</p>
          )}
        </div>
      </div>

      {/* Active Section / Video Details Card */}
      {activeVideo && (
        <div className={styles.activeSectionCard}>
          <div className={styles.activeSectionHeader}>
            <h4 className={styles.sectionSubtitle}>
              🎬 Current Section / Video Details
            </h4>
            <span className={styles.activeVideoDurationBadge}>⏱️ {activeVideo.duration || 'N/A'}</span>
          </div>
          <h5 className={styles.activeVideoTitle}>{activeVideo.title}</h5>
          
          <div className={styles.activeVideoMeta}>
            <a 
              href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.youtubeWatchLink}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>Watch on YouTube</span>
            </a>
          </div>

          {activeVideo.notes && activeVideo.notes.trim() && (
            <div className={styles.activeVideoNotesContainer}>
              <h6>Video Notes & Resources:</h6>
              <div className={styles.aboutMarkdown}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    a: ({ href, children, ...props }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.aboutLink}
                        {...props}
                      >
                        <span>{children}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    )
                  }}
                >
                  {activeVideo.notes}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extracted Links & Resources Grid */}
      {allExtractedLinks.length > 0 && (
        <div className={styles.extractedLinksContainer}>
          <h4 className={styles.sectionSubtitle}>🔗 Links & External Resources</h4>
          <div className={styles.extractedLinkGrid}>
            {allExtractedLinks.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.extractedLinkCard}
                title={url}
              >
                <div className={styles.extractedLinkMain}>
                  <span className={styles.linkIcon}>{getLinkIcon(url)}</span>
                  <div className={styles.linkTextContainer}>
                    <span className={styles.linkDomain}>{getUrlDomain(url)}</span>
                    <span className={styles.linkFullUrl}>{url}</span>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {course.tags && course.tags.length > 0 && (
        <div className={styles.tagsContainer}>
          <h4>Tags:</h4>
          <div className={styles.tagsList}>
            {course.tags.map((tag, idx) => (
              <span key={idx} className={styles.tagBadge}>#{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Course Metadata Footer */}
      <div className={styles.playlistMetaDetails}>
        <p>🔗 <strong>Playlist ID:</strong> {course.playlistId || 'Manual Course'}</p>
        <p>📅 <strong>Enrolled:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
        <p>📺 <strong>Total Lessons:</strong> {course.videos ? course.videos.length : 0}</p>
      </div>
    </div>
  )
}

export default PlayerAboutTab
