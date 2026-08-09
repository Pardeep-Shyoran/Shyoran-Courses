import React, { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { parseTimestamps } from '../../utils/timestamps'
import styles from './NotesRenderer.module.css'

// Helper to convert heading text into safe element ID
const slugify = (text) => {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

// Callout type configurations
const CALLOUT_CONFIGS = {
  NOTE: { title: 'Note', icon: 'ℹ️', classKey: 'calloutNote' },
  TIP: { title: 'Tip', icon: '💡', classKey: 'calloutTip' },
  IMPORTANT: { title: 'Important', icon: '📌', classKey: 'calloutImportant' },
  WARNING: { title: 'Warning', icon: '⚠️', classKey: 'calloutWarning' },
  CAUTION: { title: 'Caution', icon: '🚨', classKey: 'calloutCaution' },
  KEY: { title: 'Key Takeaway', icon: '🔑', classKey: 'calloutKey' },
  TAKEAWAY: { title: 'Key Takeaway', icon: '🔑', classKey: 'calloutKey' }
}

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.codeBlockContainer}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLanguageTag}>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className={`${styles.copyCodeBtn} ${copied ? styles.copyCodeBtnSuccess : ''}`}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className={styles.codePre}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

const NotesRenderer = ({
  content = '',
  onSeek,
  showTocToggle = true,
  showSearch = true,
  className = ''
}) => {
  const [showToc, setShowToc] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Auto-extract Headings for Table of Contents (TOC)
  const tocItems = useMemo(() => {
    if (!content) return []
    const lines = content.split('\n')
    const items = []
    
    lines.forEach(line => {
      const match = line.match(/^(#{1,3})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const title = match[2].replace(/\[.*?\]\(.*?\)/g, '').trim()
        const id = slugify(title)
        items.push({ level, title, id })
      }
    })
    return items
  }, [content])

  // Scroll smoothly to target heading
  const scrollToHeading = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Process timestamps in content
  const processedContent = useMemo(() => {
    return parseTimestamps(content)
  }, [content])

  // Highlight search terms recursively inside React children
  const renderChildrenWithHighlight = (children) => {
    if (!searchQuery || !searchQuery.trim()) return children
    const q = searchQuery.trim()

    const highlightText = (text) => {
      if (typeof text !== 'string') return text
      const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      const parts = text.split(regex)
      if (parts.length <= 1) return text
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className={styles.highlightMatch}>{part}</mark>
        ) : part
      )
    }

    if (typeof children === 'string') return highlightText(children)
    if (Array.isArray(children)) {
      return children.map((child, idx) => {
        if (typeof child === 'string') return <React.Fragment key={idx}>{highlightText(child)}</React.Fragment>
        return child
      })
    }
    return children
  }

  return (
    <div className={`${styles.notesRendererWrapper} ${className}`}>
      {/* Header controls bar: TOC toggle & Search */}
      {(showTocToggle || showSearch) && (content.trim().length > 0) && (
        <div className={styles.notesHeaderBar}>
          {showTocToggle && tocItems.length > 0 ? (
            <button
              onClick={() => setShowToc(!showToc)}
              className={`${styles.tocToggleBtn} ${showToc ? styles.tocToggleBtnActive : ''}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>{showToc ? 'Hide Outline' : '📖 Table of Contents'} ({tocItems.length})</span>
            </button>
          ) : <div />}

          {showSearch && (
            <div className={styles.searchBoxWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Find in notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={styles.clearSearchBtn}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table of Contents Drawer */}
      {showToc && tocItems.length > 0 && (
        <div className={styles.tocContainer}>
          <div className={styles.tocTitle}>
            <span>📑 Quick Jump Outline</span>
          </div>
          <ul className={styles.tocList}>
            {tocItems.map((item, idx) => (
              <li key={idx} className={styles.tocItem}>
                <a
                  onClick={() => scrollToHeading(item.id)}
                  className={`${styles.tocLink} ${styles[`tocDepth${item.level}`]}`}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Markdown Body */}
      <div className={styles.renderedContent}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            // Headings with IDs for TOC scrolling
            h1: ({ children, ...props }) => {
              const text = Array.isArray(children) ? children.join('') : String(children || '')
              const id = slugify(text)
              return (
                <h1 id={id} className={styles.heading1} {...props}>
                  {renderChildrenWithHighlight(children)}
                </h1>
              )
            },
            h2: ({ children, ...props }) => {
              const text = Array.isArray(children) ? children.join('') : String(children || '')
              const id = slugify(text)
              return (
                <h2 id={id} className={styles.heading2} {...props}>
                  {renderChildrenWithHighlight(children)}
                </h2>
              )
            },
            h3: ({ children, ...props }) => {
              const text = Array.isArray(children) ? children.join('') : String(children || '')
              const id = slugify(text)
              return (
                <h3 id={id} className={styles.heading3} {...props}>
                  {renderChildrenWithHighlight(children)}
                </h3>
              )
            },
            h4: ({ children, ...props }) => (
              <h4 className={styles.heading4} {...props}>
                {renderChildrenWithHighlight(children)}
              </h4>
            ),

            p: ({ children }) => (
              <p className={styles.paragraph}>
                {renderChildrenWithHighlight(children)}
              </p>
            ),

            // Code Blocks & Inline Code
            code: ({ node, inline, className: codeClassName, children, ...props }) => {
              const match = /language-(\w+)/.exec(codeClassName || '')
              const codeString = String(children).replace(/\n$/, '')

              if (!inline && (match || codeString.includes('\n'))) {
                return (
                  <CodeBlock
                    language={match ? match[1] : ''}
                    code={codeString}
                  />
                )
              }
              return (
                <code className={styles.inlineCode} {...props}>
                  {children}
                </code>
              )
            },

            // Blockquotes with GitHub-style Callout detection
            blockquote: ({ children }) => {
              let rawText = ''
              React.Children.forEach(children, child => {
                if (child?.props?.children) {
                  const subContent = child.props.children
                  if (typeof subContent === 'string') rawText += subContent
                  else if (Array.isArray(subContent)) {
                    rawText += subContent.map(s => (typeof s === 'string' ? s : '')).join('')
                  }
                }
              })

              const calloutMatch = rawText.match(/^\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|KEY|TAKEAWAY)\]/i)

              if (calloutMatch) {
                const key = calloutMatch[1].toUpperCase()
                const config = CALLOUT_CONFIGS[key] || CALLOUT_CONFIGS.NOTE

                return (
                  <div className={`${styles.calloutCard} ${styles[config.classKey]}`}>
                    <div className={styles.calloutHeader}>
                      <span>{config.icon}</span>
                      <span>{config.title}</span>
                    </div>
                    <div className={styles.calloutContent}>
                      {children}
                    </div>
                  </div>
                )
              }

              return <blockquote className={styles.standardBlockquote}>{children}</blockquote>
            },

            // Timestamps and External Links
            a: ({ href, children, ...props }) => {
              if (href && href.startsWith('seek://')) {
                const seconds = parseInt(href.replace('seek://', ''), 10)
                return (
                  <button
                    onClick={() => onSeek && onSeek(seconds)}
                    className={styles.timestampBadge}
                    title={`Jump to ${children} in video`}
                    type="button"
                  >
                    ⏱️ {children}
                  </button>
                )
              }
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                  {...props}
                >
                  {children}
                </a>
              )
            },

            // Responsive Tables
            table: ({ children }) => (
              <div className={styles.tableWrapper}>
                <table className={styles.styledTable}>{children}</table>
              </div>
            ),

            // Lists
            ul: ({ children }) => <ul className={styles.unorderedList}>{children}</ul>,
            ol: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
            li: ({ children, ...props }) => (
              <li className={styles.listItem} {...props}>
                {renderChildrenWithHighlight(children)}
              </li>
            ),
            hr: () => <hr className={styles.horizontalRule} />
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default NotesRenderer
