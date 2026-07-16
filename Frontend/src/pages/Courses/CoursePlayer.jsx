import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { 
  getCourseById, 
  toggleVideoCompleted, 
  updateVideoNotes, 
  updateCourse, 
  deleteCourse, 
  enrollInCourse,
  getVideoSummary,
  chatWithAITutor
} from '../../services/api'
import styles from './CoursePlayer.module.css'

const CoursePlayer = () => {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const currentUserId = user?._id || user?.id;
  const isOwner = course && user && (course.user?._id === currentUserId || course.user === currentUserId);
  const isActualCreator = course && user && (() => {
    const creatorId = course.originalCreator
      ? (course.originalCreator._id || course.originalCreator)
      : (course.user?._id || course.user);
    return creatorId === currentUserId;
  })();

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const res = await enrollInCourse(course._id)
      navigate(`/courses/${res.course._id}`)
    } catch (err) {
      alert(err.message || 'Failed to enroll in course.')
    } finally {
      setLoading(false)
    }
  }

  // Active video tracking
  const [activeVideo, setActiveVideo] = useState(null)

  // Interactive workstation tabs: 'notes', 'about', 'settings', 'ai'
  const [activeTab, setActiveTab] = useState('notes')

  // Note taking state
  const [noteContent, setNoteContent] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSuccess, setNoteSuccess] = useState(false)
  const [notesViewMode, setNotesViewMode] = useState('edit') // 'edit' or 'preview'

  // Settings tab form state
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editTags, setEditTags] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)

  // AI Assistant state
  const [aiSummary, setAiSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  
  const [aiSubTab, setAiSubTab] = useState('chat') // 'chat' or 'summary'

  // Ref to notes text area for focus
  const notesTextareaRef = useRef(null)
  // Ref to chat end for auto scroll
  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchCourseDetails()
  }, [id])

  const fetchCourseDetails = async () => {
    setLoading(true)
    try {
      const data = await getCourseById(id)
      setCourse(data)
      setEditTitle(data.title)
      setEditDesc(data.description || '')
      setEditTags(data.tags?.join(', ') || '')

      // Determine initial video to play
      const videos = data.videos || []
      if (videos.length > 0) {
        // 1. Try URL parameter
        const paramVidId = searchParams.get('videoId')
        if (paramVidId) {
          const match = videos.find(v => v._id === paramVidId)
          if (match) {
            selectVideo(match, data)
            return
          }
        }

        // 2. Try last incomplete video
        const firstIncomplete = videos.find(v => !v.completed)
        if (firstIncomplete) {
          selectVideo(firstIncomplete, data)
          return
        }

        // 3. Default to first video
        selectVideo(videos[0], data)
      }
    } catch (err) {
      console.error(err)
      setError('Could not retrieve course contents.')
    } finally {
      setLoading(false)
    }
  }

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, chatLoading])

  // Handle active video selection
  const selectVideo = (video, currentCourse) => {
    setActiveVideo(video)
    setNoteContent(video.notes || '')
    setNoteSuccess(false)
    setNotesViewMode('edit')

    // Reset AI Assistant state for the new video
    setAiSummary('')
    setSummaryError('')
    setChatMessages([])
    setChatInput('')
    setChatError('')
    
    // Save to local storage for "Resume Learning" card
    const targetCourse = currentCourse || course
    if (targetCourse) {
      localStorage.setItem(
        'lastPlayed',
        JSON.stringify({ courseId: targetCourse._id, videoId: video._id })
      )
    }

    // Update query params without reloading
    setSearchParams({ videoId: video._id })
  }

  // Get Video Summary using Gemini
  const handleGetSummary = async () => {
    if (!activeVideo || !course) return
    setSummaryLoading(true)
    setSummaryError('')
    try {
      const res = await getVideoSummary(activeVideo._id, {
        courseId: course._id,
        youtubeId: activeVideo.youtubeId,
        title: activeVideo.title
      })
      setAiSummary(res.summary)
    } catch (err) {
      setSummaryError(err.message || 'Failed to fetch summary.')
    } finally {
      setSummaryLoading(false)
    }
  }

  // Append summary to notes
  const handleAppendSummaryToNotes = async () => {
    if (!aiSummary || !activeVideo) return
    const separator = noteContent.trim() ? "\n\n---\n\n" : ""
    const newContent = noteContent + separator + aiSummary
    setNoteContent(newContent)
    
    setNoteSaving(true)
    try {
      const updatedCourse = await updateVideoNotes(course._id, activeVideo._id, newContent)
      setCourse(updatedCourse)
      const updatedVideo = updatedCourse.videos.find(v => v._id === activeVideo._id)
      setActiveVideo(updatedVideo)
      setActiveTab('notes')
      setNotesViewMode('edit')
      alert('AI Summary successfully appended to your notes!')
    } catch (err) {
      alert('Failed to save updated notes.')
    } finally {
      setNoteSaving(false)
    }
  }

  // Replace notes with summary
  const handleOverwriteNotesWithSummary = async () => {
    if (!aiSummary || !activeVideo) return
    if (!window.confirm('Are you sure you want to replace your notes for this video with the AI summary? This cannot be undone.')) {
      return
    }
    setNoteContent(aiSummary)
    
    setNoteSaving(true)
    try {
      const updatedCourse = await updateVideoNotes(course._id, activeVideo._id, aiSummary)
      setCourse(updatedCourse)
      const updatedVideo = updatedCourse.videos.find(v => v._id === activeVideo._id)
      setActiveVideo(updatedVideo)
      setActiveTab('notes')
      setNotesViewMode('preview')
      alert('AI Summary successfully saved as video notes!')
    } catch (err) {
      alert('Failed to save updated notes.')
    } finally {
      setNoteSaving(false)
    }
  }

  // Send message to AI Tutor
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault()
    if (!chatInput.trim() || !activeVideo || chatLoading) return

    const userMsg = { role: 'user', content: chatInput.trim() }
    const updatedMsgs = [...chatMessages, userMsg]
    
    setChatMessages(updatedMsgs)
    setChatInput('')
    setChatLoading(true)
    setChatError('')

    try {
      const res = await chatWithAITutor(activeVideo._id, {
        courseId: course._id,
        youtubeId: activeVideo.youtubeId,
        title: activeVideo.title,
        messages: updatedMsgs,
        currentNotes: noteContent
      })
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.response }])
    } catch (err) {
      setChatError(err.message || 'AI service failed to respond.')
    } finally {
      setChatLoading(false)
    }
  }

  // Toggle Video Watched status
  const handleToggleWatched = async (e, targetVideoId) => {
    e.stopPropagation() // Don't trigger play selection
    try {
      const updatedCourse = await toggleVideoCompleted(course._id, targetVideoId)
      setCourse(updatedCourse)

      // Update active video if it matches the toggled video
      if (activeVideo && activeVideo._id === targetVideoId) {
        const updatedVideo = updatedCourse.videos.find(v => v._id === targetVideoId)
        setActiveVideo(updatedVideo)
      }
    } catch (err) {
      alert('Failed to update completion status.')
    }
  }

  // Save Notes handler
  const handleSaveNotes = async () => {
    if (!activeVideo) return
    setNoteSaving(true)
    setNoteSuccess(false)
    try {
      const updatedCourse = await updateVideoNotes(course._id, activeVideo._id, noteContent)
      setCourse(updatedCourse)

      // Update active video reference in state
      const updatedVideo = updatedCourse.videos.find(v => v._id === activeVideo._id)
      setActiveVideo(updatedVideo)
      setNoteSuccess(true)
      setTimeout(() => setNoteSuccess(false), 3000)
    } catch (err) {
      alert('Failed to save notes.')
    } finally {
      setNoteSaving(false)
    }
  }

  // Settings Save handler
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    if (!isActualCreator) {
      alert('Unauthorized to update course settings.')
      return
    }
    setSettingsSaving(true)
    try {
      const tagsArray = editTags.split(',').map(t => t.trim()).filter(Boolean)
      const updated = await updateCourse(course._id, {
        title: editTitle,
        description: editDesc,
        tags: tagsArray
      })
      setCourse(updated)
      alert('Course settings successfully updated.')
    } catch (err) {
      alert(err.message || 'Failed to save course settings.')
    } finally {
      setSettingsSaving(false)
    }
  }

  // Delete course
  const handleDeleteCourse = async () => {
    const confirmMessage = isActualCreator
      ? 'Delete this course? All tracking progress and your notes will be permanently removed.'
      : 'Leave this course? Your notes and progress tracking will be removed.'
    if (!window.confirm(confirmMessage)) {
      return
    }
    try {
      await deleteCourse(course._id)
      navigate('/courses')
    } catch (err) {
      alert(isActualCreator ? 'Failed to delete course.' : 'Failed to leave course.')
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading course content...</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h3>Oops!</h3>
          <p>{error || 'Course not found'}</p>
          <Link to="/courses" className={styles.backLink}>Back to Courses</Link>
        </div>
      </div>
    )
  }

  const videos = course.videos || []
  const completedCount = videos.filter(v => v.completed).length
  const totalCount = videos.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className={styles.container}>
      {/* Top Breadcrumbs navigation */}
      <div className={styles.breadcrumb}>
        <Link to="/dashboard?tab=courses">📚 My Courses</Link>
        <span className={styles.separator}>/</span>
        <span className={styles.current}>{course.title}</span>
      </div>

      {/* Preview mode notification banner */}
      {course && !isOwner && (
        <div className={styles.enrollBanner}>
          <div className={styles.enrollBannerContent}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.bannerIcon}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>
              <strong>Preview Mode:</strong> You are viewing a public course blueprint. Enroll now to save notes, track progress, and add it to your library.
            </span>
          </div>
          <button onClick={handleEnroll} className={styles.enrollBannerBtn}>
            Enroll in Course
          </button>
        </div>
      )}

      <div className={styles.workspaceGrid}>
        {/* LEFT COLUMN: Player & Tabs Workstation */}
        <div className={styles.mainWorkstation}>
          {activeVideo ? (
            <>
              {/* Iframe Video Player */}
              <div className={styles.playerWrapper}>
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?enablejsapi=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={styles.playerFrame}
                ></iframe>
              </div>

              {/* Video Header & Quick Actions */}
              <div className={styles.videoHeader}>
                <div>
                  <h1 className={styles.videoTitle}>{activeVideo.title}</h1>
                  <span className={styles.videoDurationBadge}>⏱️ Duration: {activeVideo.duration || 'N/A'}</span>
                </div>
                {isOwner ? (
                  <button
                    onClick={(e) => handleToggleWatched(e, activeVideo._id)}
                    className={`${styles.toggleCompleteBtn} ${activeVideo.completed ? styles.completed : ''}`}
                  >
                    {activeVideo.completed ? '✅ Completed' : '⭕ Mark Completed'}
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className={styles.toggleCompleteBtn}
                  >
                    🚀 Enroll to Track Progress
                  </button>
                )}
              </div>

              {/* Workstation Tab Headers */}
              <div className={styles.tabHeaders}>
                <button
                  className={`${styles.tabHeader} ${activeTab === 'notes' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  📝 Video Notes
                </button>
                <button
                  className={`${styles.tabHeader} ${activeTab === 'ai' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('ai')}
                >
                  🤖 AI Assistant
                </button>
                <button
                  className={`${styles.tabHeader} ${activeTab === 'about' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  ℹ️ About Course
                </button>
                {isOwner && (
                  <button
                    className={`${styles.tabHeader} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    {isActualCreator ? '⚙️ Settings' : '⚙️ Options'}
                  </button>
                )}
              </div>

              {/* Workstation Tab Content */}
              <div className={styles.tabContent}>
                {/* TAB: Video Notes */}
                {activeTab === 'notes' && (
                  <div className={styles.notesContainer}>
                    <div className={styles.notesToolbar}>
                      <div className={styles.viewModeBtns}>
                        <button 
                          className={`${styles.viewModeBtn} ${notesViewMode === 'edit' ? styles.activeViewMode : ''}`}
                          onClick={() => setNotesViewMode('edit')}
                        >
                          ✏️ Write
                        </button>
                        <button 
                          className={`${styles.viewModeBtn} ${notesViewMode === 'preview' ? styles.activeViewMode : ''}`}
                          onClick={() => setNotesViewMode('preview')}
                        >
                          👁️ Render
                        </button>
                      </div>
                      
                      <div className={styles.saveActions}>
                        {noteSuccess && <span className={styles.saveSuccessMsg}>Saved!</span>}
                        {isOwner && (
                          <button
                            onClick={handleSaveNotes}
                            className={styles.saveNotesBtn}
                            disabled={noteSaving}
                          >
                            {noteSaving ? 'Saving...' : 'Save Notes'}
                          </button>
                        )}
                      </div>
                    </div>

                    {notesViewMode === 'edit' ? (
                      <div className={styles.editorWrapper}>
                        {isOwner ? (
                          <textarea
                            ref={notesTextareaRef}
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Take structured markdown study notes... Use headings (###), bullet points (-), code blocks (```js), or links."
                            className={styles.notesTextarea}
                            rows="10"
                          />
                        ) : (
                          <div className={styles.disabledNotesPlaceholder}>
                            <p>Taking study notes is only available to enrolled students.</p>
                            <button onClick={handleEnroll} className={styles.notesEnrollBtn}>
                              Enroll to Take Notes
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`${styles.markdownPreview} markdown-body`}>
                        {noteContent.trim() ? (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            rehypePlugins={[rehypeRaw, rehypeSanitize]}
                          >
                            {noteContent}
                          </ReactMarkdown>
                        ) : (
                          <p className={styles.emptyNotesPlaceholder}>No notes written for this video yet. Start writing in the editor tab!</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: AI Assistant */}
                {activeTab === 'ai' && (
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
                                    onClick={() => { setChatInput('Explain the main concept of this video.'); }}
                                    disabled={chatLoading}
                                  >
                                    💡 Explain Main Concept
                                  </button>
                                  <button 
                                    className={styles.quickPromptBtn} 
                                    onClick={() => { setChatInput('Summarize the transcript in 3 brief bullet points.'); }}
                                    disabled={chatLoading}
                                  >
                                    📋 Summarize in 3 bullets
                                  </button>
                                  <button 
                                    className={styles.quickPromptBtn} 
                                    onClick={() => { setChatInput('Generate 3 multiple-choice review questions to test my understanding.'); }}
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
                                    >
                                      {msg.content}
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
                                >
                                  {aiSummary}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: About Course */}
                {activeTab === 'about' && (
                  <div className={styles.aboutContainer}>
                    <h3 className={styles.aboutTitle}>{course.title}</h3>
                    <p className={styles.aboutDesc}>{course.description || 'No description available.'}</p>
                    
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

                    <div className={styles.playlistMetaDetails}>
                      <p>🔗 <strong>Playlist ID:</strong> {course.playlistId || 'Manual Course'}</p>
                      <p>📅 <strong>Enrolled:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {/* TAB: Settings */}
                {activeTab === 'settings' && (
                  <div className={styles.settingsContainer}>
                    {isActualCreator ? (
                      <form onSubmit={handleSaveSettings} className={styles.settingsForm}>
                        <div className={styles.inputGroup}>
                          <label>Course Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Description</label>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows="4"
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Tags (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. javascript, tutorial, coding"
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                          />
                        </div>

                        <div className={styles.settingsActions}>
                          <button
                            type="submit"
                            className={styles.saveSettingsBtn}
                            disabled={settingsSaving}
                          >
                            {settingsSaving ? 'Saving...' : 'Update Settings'}
                          </button>

                          <button
                            type="button"
                            onClick={handleDeleteCourse}
                            className={styles.deleteCourseBtn}
                          >
                            ❌ Delete Course
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className={styles.nonCreatorSettings}>
                        <p className={styles.settingsNotice}>
                          You are enrolled in this public course. You can track progress and write notes, but editing course details is restricted to the course registrar.
                        </p>
                        <div className={styles.settingsActions}>
                          <button
                            type="button"
                            onClick={handleDeleteCourse}
                            className={styles.unenrollBtn}
                          >
                            🚪 Leave Course
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyWorkstation}>
              <p>This course has no videos yet. You can add them under Course Settings.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Playlist Sidebar Directory */}
        <aside className={styles.sidebarDirectory}>
          <div className={styles.sidebarHeader}>
            <h3>Course Contents</h3>
            <div className={styles.progressContainer}>
              <div className={styles.progressBarWrapper}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${completionPercentage}%`, background: completionPercentage === 100 ? 'var(--success)' : 'var(--primary-color)' }}
                ></div>
              </div>
              <div className={styles.progressText}>
                <span>{completionPercentage}% Complete</span>
                <span>{completedCount}/{totalCount} videos</span>
              </div>
            </div>
          </div>

          <div className={styles.videoListWrapper}>
            <ul className={styles.videoList}>
              {videos.map((vid, idx) => {
                const isActive = activeVideo && activeVideo._id === vid._id
                const hasNotes = vid.notes && vid.notes.trim().length > 0

                return (
                  <li
                    key={vid._id}
                    className={`${styles.videoItem} ${isActive ? styles.activeVideoItem : ''}`}
                    onClick={() => selectVideo(vid)}
                  >
                    <div className={styles.itemMain}>
                      {isOwner ? (
                        <button 
                          className={`${styles.checkCheckbox} ${vid.completed ? styles.checked : ''}`}
                          onClick={(e) => handleToggleWatched(e, vid._id)}
                          title={vid.completed ? "Mark as unwatched" : "Mark as watched"}
                        >
                          {vid.completed ? '✓' : ''}
                        </button>
                      ) : (
                        <div className={styles.disabledCheckbox} title="Enroll to track progress">
                          ⭕
                        </div>
                      )}
                      
                      <div className={styles.videoInfo}>
                        <span className={styles.itemTitle}>{vid.title}</span>
                        <div className={styles.itemDetails}>
                          <span className={styles.itemIndex}>#{idx + 1}</span>
                          {vid.duration && <span className={styles.itemDuration}>• {vid.duration}</span>}
                          {hasNotes && <span className={styles.notesBadge} title="Notes written">📝 Notes</span>}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CoursePlayer
