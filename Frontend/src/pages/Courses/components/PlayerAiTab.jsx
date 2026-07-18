import React from 'react'
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
  chatEndRef,
  handleSeek
}) => {
  return (
    <div className={styles.aiContainer}>
      {/* Sub-tabs for AI Assistant: Chat & Summary */}
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
          📝 Auto-Summarizer
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

        {/* AI Summary View */}
        {aiSubTab === 'summary' && (
          <div className={styles.summarySection}>
            {!aiSummary && !summaryLoading && (
              <div className={styles.emptySummaryView}>
                <p>Need a quick reference sheet or detailed overview of this video?</p>
                <button 
                  onClick={handleGetSummary} 
                  className={styles.generateSummaryBtn}
                  disabled={!isOwner}
                >
                  {isOwner ? '✨ Generate AI Summary' : 'Enroll to generate AI Summary'}
                </button>
                {summaryError && <p className={styles.summaryError}>⚠️ {summaryError}</p>}
              </div>
            )}

            {summaryLoading && (
              <div className={styles.summaryLoadingState}>
                <div className={styles.spinner}></div>
                <p>Transcribing video and formatting summary using Gemini...</p>
              </div>
            )}

            {aiSummary && (
              <div className={styles.summaryResultContainer}>
                <div className={styles.summaryToolbar}>
                  <span>✨ Summary Generated Successfully</span>
                  {isOwner && (
                    <div className={styles.summaryImportBtns}>
                      <button 
                        onClick={handleAppendSummaryToNotes}
                        className={styles.summaryImportBtn}
                      >
                        ➕ Append to Notes
                      </button>
                      <button 
                        onClick={handleOverwriteNotesWithSummary}
                        className={`${styles.summaryImportBtn} ${styles.danger}`}
                      >
                        📝 Overwrite Notes
                      </button>
                    </div>
                  )}
                </div>
                <div className={`${styles.summaryMarkdown} markdown-body`}>
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
                    {parseTimestamps(aiSummary)}
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
