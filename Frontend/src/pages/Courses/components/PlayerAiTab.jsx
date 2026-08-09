import React, { useState } from 'react'
import NotesRenderer from '../../../components/NotesRenderer/NotesRenderer'
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

    if (filter === 'topics') {
      matched = parsedSections.filter(s => 
        s.headingText.includes('topic') || 
        s.headingText.includes('section') || 
        s.headingText.includes('chronological') || 
        s.headingText.includes('breakdown') || 
        s.headingText.includes('detailed') || 
        s.headingText.includes('1.') ||
        s.headingText.includes('3.')
      )
    } else if (filter === 'cheat') {
      matched = parsedSections.filter(s => 
        s.headingText.includes('term') || 
        s.headingText.includes('glossary') || 
        s.headingText.includes('cheat') || 
        s.headingText.includes('vocabulary') || 
        s.headingText.includes('definition') ||
        s.headingText.includes('2.') ||
        s.headingText.includes('4.')
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
          📝 AI Detailed Video Notes
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
                    <div className={styles.bubbleContent}>
                      <NotesRenderer 
                        content={msg.content} 
                        onSeek={handleSeek} 
                        showTocToggle={false} 
                        showSearch={false} 
                      />
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

        {/* AI Detailed Video Notes View */}
        {aiSubTab === 'summary' && (
          <div className={styles.summarySection}>
            {!aiSummary && !summaryLoading && (
              <div className={styles.emptySummaryView}>
                <h4>⚡ AI Detailed Sequential Video Notes</h4>
                <p>Generate comprehensive, detailed notes strictly following the sequence of the video content, complete with code snippets, terms glossary, and interactive timestamps.</p>
                <button 
                  onClick={handleGetSummary} 
                  className={styles.generateSummaryBtn}
                  disabled={!isOwner}
                >
                  {isOwner ? '⚡ Generate AI Detailed Video Notes' : 'Enroll to generate AI Notes'}
                </button>
                {summaryError && <p className={styles.summaryError}>⚠️ {summaryError}</p>}
              </div>
            )}

            {summaryLoading && (
              <div className={styles.summaryLoadingState}>
                <div className={styles.spinner}></div>
                <p>Analyzing video transcript & generating strict sequential detailed notes with Shyoran AI Tutor...</p>
              </div>
            )}

            {aiSummary && (
              <div className={styles.summaryResultContainer}>
                {/* Main Action Toolbar */}
                <div className={styles.summaryToolbar}>
                  <span className={styles.summaryStatusBadge}>✨ Detailed Sequential Notes Ready</span>
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
                          📝 Overwrite Personal Notes
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
                    className={`${styles.notesFilterPill} ${notesFilter === 'topics' ? styles.activeNotesFilterPill : ''}`}
                    onClick={() => setNotesFilter('topics')}
                  >
                    📋 Sequential Topics
                  </button>
                  <button 
                    className={`${styles.notesFilterPill} ${notesFilter === 'cheat' ? styles.activeNotesFilterPill : ''}`}
                    onClick={() => setNotesFilter('cheat')}
                  >
                    💡 Terms & Glossary
                  </button>
                </div>

                {/* Rendered Notes Container with High Readability */}
                <div className={`${styles.summaryMarkdown} ${styles.spaciousNotesMarkdown}`}>
                  <NotesRenderer 
                    content={displayedNotes} 
                    onSeek={handleSeek} 
                    showTocToggle={true} 
                    showSearch={true} 
                  />
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
