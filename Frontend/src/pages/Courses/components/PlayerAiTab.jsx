import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { parseTimestamps } from '../../../utils/timestamps'
import styles from '../CoursePlayer.module.css'

const PlayerAiTab = ({
  isOwner,
  aiSubTab,
  setAiSubTab,
  chatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  chatError,
  handleSendChatMessage,
  aiSummary,
  summaryLoading,
  summaryError,
  handleGetSummary,
  handleAppendSummaryToNotes,
  handleOverwriteNotesWithSummary,
  handleCopyNotes,
  handleDownloadNotes,
  chatEndRef,
  handleSeek
}) => {
  const [notesFilter, setNotesFilter] = useState('all')

  const parseMarkdownSections = (markdownText) => {
    if (!markdownText) return { mainTitle: '', parsedSections: [] }

    let mainTitle = ''
    let content = markdownText

    const titleMatch = markdownText.match(/^#\s+[^\n]+\n+/)
    if (titleMatch) {
      mainTitle = titleMatch[0].trim()
      content = markdownText.substring(titleMatch[0].length)
    }

    const rawSections = content.split(/(?=^##\s+)/m)

    const parsedSections = rawSections.map(sec => {
      const lines = sec.trim().split('\n')
      const headingLine = lines[0] || ''
      const headingText = headingLine.replace(/^##\s+/, '').trim().toLowerCase()
      return {
        headingLine,
        headingText,
        fullContent: sec.trim()
      }
    }).filter(s => s.fullContent.length > 0)

    return { mainTitle, parsedSections }
  }

  const getFilteredNotes = (markdown, filter) => {
    if (!markdown || filter === 'all') return markdown

    const { mainTitle, parsedSections } = parseMarkdownSections(markdown)
    let matched = []

    if (filter === 'overview') {
      matched = parsedSections.filter(s => 
        s.headingText.includes('overview') || 
        s.headingText.includes('summary') || 
        s.headingText.includes('objective') || 
        s.headingText.includes('takeaway') || 
        s.headingText.includes('rule') || 
        s.headingText.includes('1.') || 
        s.headingText.includes('2.')
      )
    } else if (filter === 'topics') {
      matched = parsedSections.filter(s => 
        s.headingText.includes('topic') || 
        s.headingText.includes('breakdown') || 
        s.headingText.includes('detailed') || 
        s.headingText.includes('learning guide') ||
        s.headingText.includes('3.')
      )
    } else if (filter === 'cheat') {
      matched = parsedSections.filter(s => 
        s.headingText.includes('term') || 
        s.headingText.includes('glossary') || 
        s.headingText.includes('cheat') || 
        s.headingText.includes('vocabulary') || 
        s.headingText.includes('definition') ||
        s.headingText.includes('4.')
      )
    } else if (filter === 'practice') {
      matched = parsedSections.filter(s => 
        s.headingText.includes('practice') || 
        s.headingText.includes('exercise') || 
        s.headingText.includes('hands-on') || 
        s.headingText.includes('sandbox') || 
        s.headingText.includes('code') ||
        s.headingText.includes('5.')
      )
    } else if (filter === 'quiz') {
      matched = parsedSections.filter(s => 
        s.headingText.includes('quiz') || 
        s.headingText.includes('question') || 
        s.headingText.includes('recall') || 
        s.headingText.includes('self-check') || 
        s.headingText.includes('assessment') || 
        s.headingText.includes('6.')
      )
    }

    if (matched.length === 0) return markdown

    const content = matched.map(m => m.fullContent).join('\n\n---\n\n')
    return mainTitle ? `${mainTitle}\n\n${content}` : content
  }

  const displayedNotes = getFilteredNotes(aiSummary, notesFilter)

  return (
    <div className={styles.aiContainer}>
      {/* Sub-tabs for AI Assistant: Chat & Complete Video Notes */}
      <div className={styles.aiSubHeaders}>
        <button
          className={`${styles.aiSubHeader} ${aiSubTab === 'chat' ? styles.activeAiSubHeader : ''}`}
          onClick={() => setAiSubTab('chat')}
        >
          💬 Chat with AI Tutor
        </button>
        <button
          className={`${styles.aiSubHeader} ${aiSubTab === 'summary' ? styles.activeAiSubHeader : ''}`}
          onClick={() => setAiSubTab('summary')}
        >
          📝 AI Complete Video Notes
        </button>
      </div>

      <div className={styles.aiSubContent}>
        {/* AI Chat View */}
        {aiSubTab === 'chat' && (
          <div className={styles.chatSection}>
            <div className={styles.chatHistory}>
              {chatMessages.length === 0 ? (
                <div className={styles.chatWelcome}>
                  <h4>🤖 Meet your AI Study Tutor!</h4>
                  <p>Ask questions about this video, request code snippets, or test your knowledge.</p>
                  <div className={styles.quickPrompts}>
                    <button 
                      className={styles.quickPromptBtn} 
                      onClick={() => setChatInput('Explain the main concept of this video.')}
                      disabled={chatLoading}
                    >
                      💡 Explain Main Concept
                    </button>
                    <button 
                      className={styles.quickPromptBtn} 
                      onClick={() => setChatInput('Summarize the transcript in 3 brief bullet points.')}
                      disabled={chatLoading}
                    >
                      📋 Summarize in 3 bullets
                    </button>
                    <button 
                      className={styles.quickPromptBtn} 
                      onClick={() => setChatInput('Generate 3 multiple-choice review questions to test my understanding.')}
                      disabled={chatLoading}
                    >
                      📝 Quiz Me
                    </button>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`${styles.chatBubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble}`}
                  >
                    <div className={styles.bubbleAuthor}>
                      {msg.role === 'user' ? 'You' : 'AI Tutor'}
                    </div>
                    <div className={`${styles.bubbleContent} markdown-body`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        components={{
                          a: ({ href, children, ...props }) => {
                            if (href && href.startsWith('seek://')) {
                              const seconds = parseInt(href.replace('seek://', ''), 10)
                              return (
                                <button
                                  onClick={() => handleSeek(seconds)}
                                  className={styles.timestampBadge}
                                  title={`Seek to ${children}`}
                                >
                                  ⏱️ {children}
                                </button>
                              )
                            }
                            return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                          }
                        }}
                      >
                        {parseTimestamps(msg.content)}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))
              )}

              {chatLoading && (
                <div className={`${styles.chatBubble} ${styles.aiBubble} ${styles.typingBubble}`}>
                  <div className={styles.bubbleAuthor}>AI Tutor</div>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              {chatError && (
                <div className={styles.chatErrorBanner}>
                  ⚠️ {chatError}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChatMessage} className={styles.chatForm}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isOwner ? "Ask the AI Tutor a question..." : "Enroll in course to chat with AI Tutor"}
                className={styles.chatInput}
                disabled={!isOwner || chatLoading}
              />
              <button 
                type="submit" 
                className={styles.chatSendBtn} 
                disabled={!isOwner || chatLoading || !chatInput.trim()}
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* AI Complete Video Notes View */}
        {aiSubTab === 'summary' && (
          <div className={styles.summarySection}>
            {!aiSummary && !summaryLoading && (
              <div className={styles.emptySummaryView}>
                <h4>⚡ AI Complete Step-by-Step Video Notes</h4>
                <p>Generate comprehensive, timestamp-free video revision notes with topic breakdowns, technical cheat sheets, code blocks, and active recall questions.</p>
                <button 
                  onClick={handleGetSummary} 
                  className={styles.generateSummaryBtn}
                  disabled={!isOwner}
                >
                  {isOwner ? '⚡ Generate AI Complete Video Notes' : 'Enroll to generate AI Notes'}
                </button>
                {summaryError && <p className={styles.summaryError}>⚠️ {summaryError}</p>}
              </div>
            )}

            {summaryLoading && (
              <div className={styles.summaryLoadingState}>
                <div className={styles.spinner}></div>
                <p>Analyzing video content & generating clean topic-by-topic complete video notes with Gemini...</p>
              </div>
            )}

            {aiSummary && (
              <div className={styles.summaryResultContainer}>
                {/* Main Action Toolbar */}
                <div className={styles.summaryToolbar}>
                  <span className={styles.summaryStatusBadge}>✨ Complete AI Video Notes Ready</span>
                  <div className={styles.summaryImportBtns}>
                    {handleCopyNotes && (
                      <button 
                        onClick={handleCopyNotes}
                        className={styles.summaryImportBtn}
                        title="Copy complete notes to clipboard"
                      >
                        📋 Copy Notes
                      </button>
                    )}
                    {handleDownloadNotes && (
                      <button 
                        onClick={handleDownloadNotes}
                        className={styles.summaryImportBtn}
                        title="Download complete notes as Markdown file"
                      >
                        📥 Download .md
                      </button>
                    )}
                    {isOwner && (
                      <>
                        <button 
                          onClick={handleAppendSummaryToNotes}
                          className={styles.summaryImportBtn}
                          title="Append to your personal video notes"
                        >
                          ➕ Append to Notes
                        </button>
                        <button 
                          onClick={handleOverwriteNotesWithSummary}
                          className={`${styles.summaryImportBtn} ${styles.danger}`}
                          title="Overwrite your personal video notes"
                        >
                          📝 Overwrite Notes
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Section Filter Pills Bar */}
                <div className={styles.notesFilterBar}>
                  <button 
                    className={`${styles.notesFilterPill} ${notesFilter === 'all' ? styles.activeNotesFilterPill : ''}`}
                    onClick={() => setNotesFilter('all')}
                  >
                    📖 All Notes
                  </button>
                  <button 
                    className={`${styles.notesFilterPill} ${notesFilter === 'overview' ? styles.activeNotesFilterPill : ''}`}
                    onClick={() => setNotesFilter('overview')}
                  >
                    📌 Overview & Rules
                  </button>
                  <button 
                    className={`${styles.notesFilterPill} ${notesFilter === 'topics' ? styles.activeNotesFilterPill : ''}`}
                    onClick={() => setNotesFilter('topics')}
                  >
                    📋 Topic Breakdown
                  </button>
                  <button 
                    className={`${styles.notesFilterPill} ${notesFilter === 'cheat' ? styles.activeNotesFilterPill : ''}`}
                    onClick={() => setNotesFilter('cheat')}
                  >
                    💡 Cheat Sheet & Terms
                  </button>
                  <button 
                    className={`${styles.notesFilterPill} ${notesFilter === 'practice' ? styles.activeNotesFilterPill : ''}`}
                    onClick={() => setNotesFilter('practice')}
                  >
                    🛠️ Code & Practice
                  </button>
                  <button 
                    className={`${styles.notesFilterPill} ${notesFilter === 'quiz' ? styles.activeNotesFilterPill : ''}`}
                    onClick={() => setNotesFilter('quiz')}
                  >
                    ❓ Self-Check Quiz
                  </button>
                </div>

                {/* Rendered Notes Container with High Readability */}
                <div className={`${styles.summaryMarkdown} ${styles.spaciousNotesMarkdown} markdown-body`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      a: ({ href, children, ...props }) => {
                        if (href && href.startsWith('seek://')) {
                          const seconds = parseInt(href.replace('seek://', ''), 10)
                          return (
                            <button
                              onClick={() => handleSeek(seconds)}
                              className={styles.timestampBadge}
                              title={`Jump to ${children} in video`}
                            >
                              ⏱️ {children}
                            </button>
                          )
                        }
                        return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                      }
                    }}
                  >
                    {parseTimestamps(displayedNotes)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerAiTab
