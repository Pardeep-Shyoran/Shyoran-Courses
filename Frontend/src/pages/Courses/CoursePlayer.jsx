import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { 
  getCourseById, 
  toggleVideoCompleted, 
  updateVideoNotes, 
  updateCourse, 
  deleteCourse, 
  enrollInCourse,
  getVideoSummary,
  chatWithAITutor,
  refreshCoursePlaylist,
  getUserCertificates
} from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PlayerHeader from './components/PlayerHeader'
import PlayerVideoSection from './components/PlayerVideoSection'
import PlayerSidebar from './components/PlayerSidebar'
import PlayerNotesTab from './components/PlayerNotesTab'
import PlayerAiTab from './components/PlayerAiTab'
import PlayerPracticeTab from './components/PlayerPracticeTab'
import PlayerAboutTab from './components/PlayerAboutTab'
import PlayerSettingsTab from './components/PlayerSettingsTab'
import styles from './CoursePlayer.module.css'
import { launchConfetti } from '../../utils/confetti'
import { calculateCourseDurations } from '../../utils/duration'
import CertificateViewer from '../../components/Certificate/CertificateViewer'
import KeyboardShortcutsModal from '../../components/KeyboardShortcutsModal/KeyboardShortcutsModal'

const CoursePlayer = () => {
  const { user } = useAuth()
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [earnedCert, setEarnedCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [localVideos, setLocalVideos] = useState([])
  const [isReversed, setIsReversed] = useState(localStorage.getItem(`course_reversed_${id}`) === 'true')

  // Theatre / Focus Mode
  const [theatreMode, setTheatreMode] = useState(() => {
    return localStorage.getItem('player_theatre_mode') === 'true'
  })

  const handleToggleTheatre = useCallback(() => {
    setTheatreMode(prev => {
      const nextVal = !prev
      localStorage.setItem('player_theatre_mode', String(nextVal))
      return nextVal
    })
  }, [])

  // Autoplay Next
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    return localStorage.getItem('player_autoplay') !== 'false'
  })

  const handleToggleAutoplay = useCallback(() => {
    setAutoplayEnabled(prev => {
      const nextVal = !prev
      localStorage.setItem('player_autoplay', String(nextVal))
      return nextVal
    })
  }, [])

  // Shortcuts modal
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Autoplay countdown state
  const [countdownState, setCountdownState] = useState({
    active: false,
    secondsLeft: 5,
    nextTitle: '',
    targetVideo: null
  })

  const getOrderedVideos = useCallback((rawVideos) => {
    if (!rawVideos) return []
    const savedOrderJson = localStorage.getItem(`course_order_${id}`)
    if (savedOrderJson) {
      try {
        const savedOrderIds = JSON.parse(savedOrderJson)
        if (Array.isArray(savedOrderIds) && savedOrderIds.length > 0) {
          const videoMap = new Map(rawVideos.map(v => [v._id, v]))
          const ordered = []
          savedOrderIds.forEach(vidId => {
            if (videoMap.has(vidId)) {
              ordered.push(videoMap.get(vidId))
              videoMap.delete(vidId)
            }
          })
          videoMap.forEach(v => ordered.push(v))
          return ordered
        }
      } catch (e) {
        console.error("Failed to parse saved video order", e)
      }
    }
    return rawVideos
  }, [id])

  useEffect(() => {
    setIsReversed(localStorage.getItem(`course_reversed_${id}`) === 'true')
  }, [id])

  useEffect(() => {
    if (course && course.videos && !isReordering) {
      setLocalVideos(getOrderedVideos(course.videos))
    }
  }, [course, isReordering, getOrderedVideos])

  const handleToggleReverse = () => {
    const newReversed = !isReversed
    setIsReversed(newReversed)
    localStorage.setItem(`course_reversed_${id}`, newReversed)
  }

  const handleStartReordering = () => {
    setLocalVideos(course?.videos ? getOrderedVideos(course.videos) : [])
    setIsReordering(true)
  }

  const handleCancelReordering = () => {
    setLocalVideos(course?.videos ? getOrderedVideos(course.videos) : [])
    setIsReordering(false)
  }

  const handleMoveVideo = (index, direction) => {
    const newVideos = [...localVideos]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newVideos.length) return
    const temp = newVideos[index]
    newVideos[index] = newVideos[targetIndex]
    newVideos[targetIndex] = temp
    setLocalVideos(newVideos)
  }

  const handleSaveOrder = async () => {
    if (!course) return
    setLoading(true)
    try {
      if (isActualCreator) {
        localStorage.removeItem(`course_order_${course._id}`)
        const updated = await updateCourse(course._id, { videos: localVideos })
        setCourse(updated)
        alert('Course playlist order saved successfully to database!')
      } else {
        const videoOrderIds = localVideos.map(v => v._id)
        localStorage.setItem(`course_order_${course._id}`, JSON.stringify(videoOrderIds))
        alert('Local playlist order saved successfully!')
      }
      setIsReordering(false)
    } catch (err) {
      alert(err.message || 'Failed to save course playlist order.')
    } finally {
      setLoading(false)
    }
  }

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

  const handleRefreshPlaylist = async () => {
    if (!course) return
    setRefreshing(true)
    try {
      const updatedCourse = await refreshCoursePlaylist(course._id)
      setCourse(updatedCourse)

      // Re-select active video if it still exists, otherwise default to first video
      const videos = updatedCourse.videos || []
      if (videos.length > 0) {
        const stillExists = activeVideo ? videos.find(v => v.youtubeId === activeVideo.youtubeId) : null
        if (stillExists) {
          selectVideo(stillExists, updatedCourse)
        } else {
          selectVideo(videos[0], updatedCourse)
        }
      } else {
        setActiveVideo(null)
      }
      alert('Playlist successfully synced with YouTube!')
    } catch (err) {
      alert(err.message || 'Failed to refresh playlist.')
    } finally {
      setRefreshing(false)
    }
  }

  // Active video tracking
  const [activeVideo, setActiveVideo] = useState(null)
  const playerIframeRef = useRef(null)
  const [playerTime, setPlayerTime] = useState(0)



  const handleSeek = (seconds) => {
    if (playerIframeRef.current && playerIframeRef.current.contentWindow) {
      playerIframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [seconds, true]
      }), '*')
      playerIframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'playVideo',
        args: []
      }), '*')
    }
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const videos = getOrderedVideos(data.videos || [])
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

  // Toggle Video Watched status
  const handleToggleWatched = useCallback(async (e, targetVideoId, forceCompleted = false) => {
    if (e && e.stopPropagation) e.stopPropagation()
    const targetVid = course?.videos?.find(v => v._id === targetVideoId)
    if (forceCompleted && targetVid?.completed) {
      return
    }
    try {
      const updatedCourse = await toggleVideoCompleted(course._id, targetVideoId)
      setCourse(updatedCourse)

      // Update active video if it matches the toggled video
      if (activeVideo && activeVideo._id === targetVideoId) {
        const updatedVideo = updatedCourse.videos.find(v => v._id === targetVideoId)
        setActiveVideo(updatedVideo)
      }

      // Check if a certificate was earned
      if (updatedCourse?.earnedCertificate) {
        setEarnedCert(updatedCourse.earnedCertificate)
        launchConfetti()
      }
    } catch (err) {
      console.error(err)
      if (!forceCompleted) {
        alert('Failed to update completion status.')
      }
    }
  }, [course, activeVideo])

  // Handle active video selection
  const selectVideo = useCallback((video, currentCourse) => {
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
  }, [course, setSearchParams])

  // Lesson Navigation: Prev / Next
  const currentVideoIndex = activeVideo ? localVideos.findIndex(v => v._id === activeVideo._id) : -1
  const hasPrev = currentVideoIndex > 0
  const hasNext = currentVideoIndex >= 0 && currentVideoIndex < localVideos.length - 1

  const handlePrevVideo = useCallback(() => {
    if (hasPrev) {
      selectVideo(localVideos[currentVideoIndex - 1], course)
    }
  }, [hasPrev, currentVideoIndex, localVideos, course, selectVideo])

  const handleNextVideo = useCallback(() => {
    if (hasNext) {
      selectVideo(localVideos[currentVideoIndex + 1], course)
    }
  }, [hasNext, currentVideoIndex, localVideos, course, selectVideo])

  // Autoplay Countdown handlers
  const handleCancelCountdown = useCallback(() => {
    setCountdownState({
      active: false,
      secondsLeft: 5,
      nextTitle: '',
      targetVideo: null
    })
  }, [])

  const handleConfirmPlayNext = useCallback(() => {
    if (countdownState.targetVideo) {
      selectVideo(countdownState.targetVideo, course)
    }
    handleCancelCountdown()
  }, [countdownState.targetVideo, course, selectVideo, handleCancelCountdown])

  useEffect(() => {
    if (!countdownState.active) return

    if (countdownState.secondsLeft <= 0) {
      handleConfirmPlayNext()
      return
    }

    const timer = setTimeout(() => {
      setCountdownState(prev => ({
        ...prev,
        secondsLeft: prev.secondsLeft - 1
      }))
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdownState.active, countdownState.secondsLeft, handleConfirmPlayNext])

  // Cancel countdown when active video changes
  useEffect(() => {
    handleCancelCountdown()
  }, [activeVideo?._id, handleCancelCountdown])

  // Video Finished Trigger (from YouTube postMessage)
  const handleVideoFinished = useCallback(() => {
    if (!activeVideo) return
    if (isOwner && !activeVideo.completed) {
      handleToggleWatched(null, activeVideo._id, true)
    }
    if (autoplayEnabled && hasNext) {
      const nextVid = localVideos[currentVideoIndex + 1]
      setCountdownState({
        active: true,
        secondsLeft: 5,
        nextTitle: nextVid.title,
        targetVideo: nextVid
      })
    }
  }, [activeVideo, isOwner, handleToggleWatched, autoplayEnabled, hasNext, localVideos, currentVideoIndex])

  // YouTube Iframe PostMessage Listener for Time & Video End
  useEffect(() => {
    const handleMessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data)
          if (data.event === 'infoDelivery' && data.info) {
            if (typeof data.info.currentTime === 'number') {
              setPlayerTime(data.info.currentTime)
            }
            if (data.info.playerState === 0) {
              handleVideoFinished()
            }
          }
          if (data.event === 'onStateChange' && data.info === 0) {
            handleVideoFinished()
          }
        } catch {
          // Ignore
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleVideoFinished])

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName?.toUpperCase()
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
        return
      }

      // '?' -> Toggle Shortcuts Guide
      if (e.key === '?') {
        e.preventDefault()
        setShowShortcutsModal(prev => !prev)
        return
      }

      // 'Shift + N' -> Next video
      if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault()
        handleNextVideo()
        return
      }

      // 'Shift + P' -> Previous video
      if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        handlePrevVideo()
        return
      }

      // 'M' or 'm' -> Toggle watched
      if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'm' || e.key === 'M')) {
        if (activeVideo && isOwner) {
          e.preventDefault()
          handleToggleWatched(null, activeVideo._id)
        }
        return
      }

      // 'F' or 'f' -> Toggle Focus / Theatre Mode
      if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault()
        handleToggleTheatre()
        return
      }

      // 'T' or 't' -> Jump to Notes
      if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault()
        setActiveTab('notes')
        setTimeout(() => {
          if (notesTextareaRef.current) {
            notesTextareaRef.current.focus()
          }
        }, 100)
        return
      }

      // 'Escape' -> Cancel Countdown & Close Modals
      if (e.key === 'Escape') {
        handleCancelCountdown()
        setShowShortcutsModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNextVideo, handlePrevVideo, activeVideo, isOwner, handleToggleWatched, handleToggleTheatre, handleCancelCountdown])

  // Total and Remaining Course Duration Metrics
  const courseDurations = useMemo(() => {
    return calculateCourseDurations(course?.videos || [])
  }, [course?.videos])

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

  // Copy AI Complete Notes to Clipboard
  const handleCopyNotes = async () => {
    if (!aiSummary) return
    try {
      await navigator.clipboard.writeText(aiSummary)
      alert('📋 Complete Video Notes copied to clipboard!')
    } catch {
      alert('Failed to copy notes to clipboard.')
    }
  }

  // Download AI Complete Notes as Markdown File
  const handleDownloadNotes = () => {
    if (!aiSummary || !activeVideo) return
    const filename = `${(activeVideo.title || 'Video_Notes').replace(/[^a-z0-9_-]/gi, '_')}_Complete_Notes.md`
    const blob = new Blob([aiSummary], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
      alert('AI Complete Notes successfully appended to your notes!')
    } catch {
      alert('Failed to save updated notes.')
    } finally {
      setNoteSaving(false)
    }
  }

  // Replace notes with summary
  const handleOverwriteNotesWithSummary = async () => {
    if (!aiSummary || !activeVideo) return
    if (!window.confirm('Are you sure you want to replace your notes for this video with the AI Complete Video Notes? This cannot be undone.')) {
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
      alert('AI Complete Notes successfully saved as video notes!')
    } catch {
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

  // Show/Preview Certificate handler
  const handleShowCertificate = async (isPreview = false) => {
    if (isPreview) {
      const previewCert = {
        certificateId: "PREVIEW-ONLY",
        completedAt: new Date(),
        course: { title: course.title },
        user: { name: user?.name || "Student" },
        isPreview: true
      }
      setEarnedCert(previewCert)
    } else {
      try {
        const userCerts = await getUserCertificates()
        const cert = userCerts.find(c => c.course?._id === course._id)
        if (cert) {
          setEarnedCert(cert)
        } else {
          // Fallback to local rendering in case it hasn't synced
          const localCert = {
            certificateId: `CERT-EARNED-${course._id.slice(-6).toUpperCase()}`,
            completedAt: new Date(),
            course: { title: course.title },
            user: { name: user?.name || "Student" },
            isPreview: false
          }
          setEarnedCert(localCert)
        }
      } catch (err) {
        console.error("Error fetching course certificate:", err)
        // Fallback
        const localCert = {
          certificateId: `CERT-EARNED-${course._id.slice(-6).toUpperCase()}`,
          completedAt: new Date(),
          course: { title: course.title },
          user: { name: user?.name || "Student" },
          isPreview: false
        }
        setEarnedCert(localCert)
      }
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
    } catch {
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
    } catch {
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
          <a 
            href="/courses" 
            className={styles.backLink} 
            onClick={(e) => { 
              e.preventDefault(); 
              navigate('/courses'); 
            }}
          >
            Back to Courses
          </a>
        </div>
      </div>
    )
  }

  const videos = localVideos || []
  const completedCount = videos.filter(v => v.completed).length
  const totalCount = videos.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className={styles.container}>
      <PlayerHeader 
        course={course}
        isOwner={isOwner}
        handleEnroll={handleEnroll}
        completedCount={completedCount}
        totalCount={totalCount}
        completionPercentage={completionPercentage}
        totalDurationFormatted={courseDurations.totalFormatted}
        remainingDurationFormatted={courseDurations.remainingFormatted}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
      />

      <div className={theatreMode ? styles.theatreWorkspaceGrid : styles.workspaceGrid}>
        {/* LEFT COLUMN: Player & Tabs Workstation */}
        <div className={styles.mainWorkstation}>
          {activeVideo ? (
            <>
              <PlayerVideoSection 
                activeVideo={activeVideo}
                courseId={course?._id}
                currentIndex={currentVideoIndex >= 0 ? currentVideoIndex + 1 : 1}
                totalVideos={localVideos.length || course?.videos?.length || 0}
                isOwner={isOwner}
                handleToggleWatched={handleToggleWatched}
                handleEnroll={handleEnroll}
                iframeRef={playerIframeRef}
                playbackSpeed={user?.preferences?.playbackSpeed || 1}
                handleSeek={handleSeek}
                hasNext={hasNext}
                hasPrev={hasPrev}
                onNextVideo={handleNextVideo}
                onPrevVideo={handlePrevVideo}
                theatreMode={theatreMode}
                onToggleTheatre={handleToggleTheatre}
                autoplayEnabled={autoplayEnabled}
                onToggleAutoplay={handleToggleAutoplay}
                countdownState={countdownState}
                onCancelCountdown={handleCancelCountdown}
                onConfirmPlayNext={handleConfirmPlayNext}
              />

              {/* Workstation Tab Headers */}
              <div className={styles.tabHeaders} role="tablist">
                <button
                  role="tab"
                  aria-selected={activeTab === 'notes'}
                  className={`${styles.tabHeader} ${activeTab === 'notes' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Video Notes</span>
                  {activeVideo?.notes && activeVideo.notes.trim().length > 0 && (
                    <span className={styles.tabBadgeDot} title="Notes saved for this lesson" />
                  )}
                </button>

                <button
                  role="tab"
                  aria-selected={activeTab === 'ai'}
                  className={`${styles.tabHeader} ${activeTab === 'ai' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('ai')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
                    <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                    <path d="M9 13v2"></path>
                    <path d="M15 13v2"></path>
                  </svg>
                  <span>AI Assistant</span>
                  <span className={styles.tabMicroPill}>✨ Gemini</span>
                </button>

                <button
                  role="tab"
                  aria-selected={activeTab === 'practice'}
                  className={`${styles.tabHeader} ${activeTab === 'practice' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('practice')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  <span>Active Recall</span>
                  <span className={styles.tabMicroPill}>Quiz</span>
                </button>

                <button
                  role="tab"
                  aria-selected={activeTab === 'about'}
                  className={`${styles.tabHeader} ${activeTab === 'about' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>About Course</span>
                </button>

                {isOwner && (
                  <button
                    role="tab"
                    aria-selected={activeTab === 'settings'}
                    className={`${styles.tabHeader} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span>{isActualCreator ? 'Settings' : 'Options'}</span>
                  </button>
                )}
              </div>

              {/* Workstation Tab Content */}
              <div className={styles.tabContent}>
                {activeTab === 'notes' && (
                  <PlayerNotesTab 
                    isOwner={isOwner}
                    noteContent={noteContent}
                    setNoteContent={setNoteContent}
                    noteSaving={noteSaving}
                    noteSuccess={noteSuccess}
                    notesViewMode={notesViewMode}
                    setNotesViewMode={setNotesViewMode}
                    handleSaveNotes={handleSaveNotes}
                    handleEnroll={handleEnroll}
                    notesTextareaRef={notesTextareaRef}
                    playerTime={playerTime}
                    handleSeek={handleSeek}
                  />
                )}

                {activeTab === 'ai' && (
                  <PlayerAiTab 
                    isOwner={isOwner}
                    aiSubTab={aiSubTab}
                    setAiSubTab={setAiSubTab}
                    chatMessages={chatMessages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    chatLoading={chatLoading}
                    chatError={chatError}
                    handleSendChatMessage={handleSendChatMessage}
                    aiSummary={aiSummary}
                    summaryLoading={summaryLoading}
                    summaryError={summaryError}
                    handleGetSummary={handleGetSummary}
                    handleAppendSummaryToNotes={handleAppendSummaryToNotes}
                    handleOverwriteNotesWithSummary={handleOverwriteNotesWithSummary}
                    handleCopyNotes={handleCopyNotes}
                    handleDownloadNotes={handleDownloadNotes}
                    chatEndRef={chatEndRef}
                    handleSeek={handleSeek}
                  />
                )}

                {activeTab === 'practice' && (
                  <PlayerPracticeTab 
                    isOwner={isOwner}
                    activeVideo={activeVideo}
                    course={course}
                    handleEnroll={handleEnroll}
                  />
                )}

                {activeTab === 'about' && (
                  <PlayerAboutTab 
                    course={course}
                    activeVideo={activeVideo}
                  />
                )}

                {activeTab === 'settings' && (
                  <PlayerSettingsTab 
                    isActualCreator={isActualCreator}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    editDesc={editDesc}
                    setEditDesc={setEditDesc}
                    editTags={editTags}
                    setEditTags={setEditTags}
                    settingsSaving={settingsSaving}
                    handleSaveSettings={handleSaveSettings}
                    handleDeleteCourse={handleDeleteCourse}
                  />
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
        <PlayerSidebar 
          course={course}
          activeVideo={activeVideo}
          isOwner={isOwner}
          selectVideo={selectVideo}
          handleToggleWatched={handleToggleWatched}
          completedCount={completedCount}
          totalCount={totalCount}
          completionPercentage={completionPercentage}
          handleRefreshPlaylist={handleRefreshPlaylist}
          refreshing={refreshing}
          localVideos={localVideos}
          isReordering={isReordering}
          isReversed={isReversed}
          handleToggleReverse={handleToggleReverse}
          handleStartReordering={handleStartReordering}
          handleSaveOrder={handleSaveOrder}
          handleCancelReordering={handleCancelReordering}
          handleMoveVideo={handleMoveVideo}
          handleShowCertificate={handleShowCertificate}
          totalDurationFormatted={courseDurations.totalFormatted}
          remainingDurationFormatted={courseDurations.remainingFormatted}
        />
      </div>

      {earnedCert && (
        <CertificateViewer
          certificate={earnedCert}
          studentNameFallback={user?.name}
          onClose={() => setEarnedCert(null)}
        />
      )}

      <KeyboardShortcutsModal 
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  )
}

export default CoursePlayer
