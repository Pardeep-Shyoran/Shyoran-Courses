import React, { useState } from 'react'
import { getVideoFlashcards, getVideoQuiz } from '../../../services/api'
import styles from './PlayerPracticeTab.module.css'

const PlayerPracticeTab = ({ isOwner, activeVideo, course, handleEnroll }) => {
  const [mode, setMode] = useState('selection') // 'selection', 'flashcards', 'quiz'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Flashcards state
  const [flashcards, setFlashcards] = useState([])
  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredCount, setMasteredCount] = useState(0)
  const [reviewedCount, setReviewedCount] = useState(0)

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isQuizFinished, setIsQuizFinished] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  // Handlers
  const startFlashcards = async () => {
    if (!isOwner) return
    setMode('flashcards')
    setLoading(true)
    setError('')
    try {
      const res = await getVideoFlashcards(activeVideo._id, {
        courseId: course._id,
        youtubeId: activeVideo.youtubeId,
        title: activeVideo.title
      })
      setFlashcards(res.flashcards || [])
      setCurrentCardIdx(0)
      setIsFlipped(false)
      setMasteredCount(0)
      setReviewedCount(0)
    } catch (err) {
      setError(err.message || 'Failed to load study flashcards.')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async () => {
    if (!isOwner) return
    setMode('quiz')
    setLoading(true)
    setError('')
    try {
      const res = await getVideoQuiz(activeVideo._id, {
        courseId: course._id,
        youtubeId: activeVideo.youtubeId,
        title: activeVideo.title
      })
      setQuizQuestions(res.quiz || [])
      setCurrentQuestionIdx(0)
      setSelectedOption(null)
      setQuizScore(0)
      setIsQuizFinished(false)
    } catch (err) {
      setError(err.message || 'Failed to load practice quiz.')
    } finally {
      setLoading(false)
    }
  }

  const handleFlashcardRating = (mastered) => {
    if (mastered) setMasteredCount(c => c + 1)
    setReviewedCount(c => c + 1)
    
    // Smooth advance
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCardIdx(idx => idx + 1)
    }, 200)
  }

  const handleOptionClick = (optionIdx) => {
    if (selectedOption !== null) return
    setSelectedOption(optionIdx)
    const isCorrect = optionIdx === quizQuestions[currentQuestionIdx].correctAnswerIndex
    if (isCorrect) {
      setQuizScore(score => score + 1)
    }
  }

  const handleNextQuestion = () => {
    setSelectedOption(null)
    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(idx => idx + 1)
    } else {
      setIsQuizFinished(true)
    }
  }

  const resetMode = () => {
    setMode('selection')
    setFlashcards([])
    setQuizQuestions([])
    setError('')
  }

  if (!isOwner) {
    return (
      <div className={styles.enrollRequired}>
        <h3>🔒 Practice Exercises Locked</h3>
        <p>Enrolling in the course unlocks interactive AI-generated flashcards and practice quizzes based on the video transcript.</p>
        <button onClick={handleEnroll} className={styles.enrollRequiredBtn}>
          Enroll Now
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Mode Selection */}
      {mode === 'selection' && (
        <div className={styles.selectionScreen}>
          <h3 className={styles.selectionTitle}>🧠 Active Recall Study Suite</h3>
          <p className={styles.selectionDesc}>
            Maximize your memory retention by switching from passive watching to active recall. Generate study tools directly from this video!
          </p>
          <div className={styles.selectionGrid}>
            <div className={styles.modeCard} onClick={startFlashcards}>
              <span className={styles.modeIcon}>🎴</span>
              <span className={styles.modeName}>AI Flashcards</span>
              <span className={styles.modeDesc}>Review key concepts, syntax, and vocabulary with flipping study cards.</span>
            </div>
            <div className={styles.modeCard} onClick={startQuiz}>
              <span className={styles.modeIcon}>📝</span>
              <span className={styles.modeName}>Practice Quiz</span>
              <span className={styles.modeDesc}>Test your comprehension with a multi-choice quiz and get explanations.</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Gemini is analyzing the video transcript and crafting custom questions...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className={styles.loadingState}>
          <p className={styles.loadingText} style={{ color: 'var(--danger)' }}>⚠️ {error}</p>
          <button onClick={resetMode} className={styles.retakeBtn} style={{ marginTop: '16px' }}>Back to Selection</button>
        </div>
      )}

      {/* Flashcards View */}
      {mode === 'flashcards' && !loading && !error && flashcards.length > 0 && (
        <>
          <button onClick={resetMode} className={styles.backBtn}>⬅️ Back to Modes</button>
          
          {currentCardIdx < flashcards.length ? (
            <div>
              <div className={styles.workspaceHeader}>
                <span className={styles.workspaceTitle}>Study Flashcards</span>
                <span className={styles.progressText}>Card {currentCardIdx + 1} of {flashcards.length}</span>
              </div>

              <div className={styles.cardContainer} onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}>
                  <div className={styles.cardFront}>
                    <span className={styles.cardLabel}>Question</span>
                    <p className={styles.cardText}>{flashcards[currentCardIdx].front}</p>
                    <span className={styles.hintText}>Tap to Flip</span>
                  </div>
                  <div className={styles.cardBack}>
                    <span className={styles.cardBackLabel}>Answer</span>
                    <p className={styles.cardText}>{flashcards[currentCardIdx].back}</p>
                    <span className={styles.hintText}>Tap to Flip Back</span>
                  </div>
                </div>
              </div>

              {isFlipped && (
                <div className={styles.actionRow}>
                  <button 
                    onClick={() => handleFlashcardRating(false)} 
                    className={`${styles.actionBtn} ${styles.needsReviewBtn}`}
                  >
                    🔴 Needs Study
                  </button>
                  <button 
                    onClick={() => handleFlashcardRating(true)} 
                    className={`${styles.actionBtn} ${styles.masteredBtn}`}
                  >
                    🟢 Got It!
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.resultScreen}>
              <span className={styles.modeIcon}>🎉</span>
              <h3 className={styles.resultTitle}>Deck Completed!</h3>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreVal}>{masteredCount}</span>
                <span className={styles.scoreLabel}>Got It</span>
              </div>
              <p className={styles.resultFeedback}>
                You reviewed {reviewedCount} flashcards. You mastered {masteredCount} of them!
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={startFlashcards} className={styles.nextBtn}>Restart Deck</button>
                <button onClick={resetMode} className={styles.retakeBtn}>Exit Mode</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quiz View */}
      {mode === 'quiz' && !loading && !error && quizQuestions.length > 0 && (
        <>
          <button onClick={resetMode} className={styles.backBtn}>⬅️ Back to Modes</button>

          {!isQuizFinished ? (
            <div className={styles.quizWrapper}>
              <div className={styles.workspaceHeader}>
                <span className={styles.workspaceTitle}>Practice Quiz</span>
                <span className={styles.progressText}>Question {currentQuestionIdx + 1} of {quizQuestions.length}</span>
              </div>

              <div className={styles.quizProgressBar}>
                <div 
                  className={styles.quizProgressFill} 
                  style={{ width: `${(currentQuestionIdx / quizQuestions.length) * 100}%` }}
                ></div>
              </div>

              <div className={styles.questionCard}>
                <h4 className={styles.questionText}>{quizQuestions[currentQuestionIdx].question}</h4>
                <div className={styles.optionsGrid}>
                  {quizQuestions[currentQuestionIdx].options.map((option, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrect = idx === quizQuestions[currentQuestionIdx].correctAnswerIndex
                    const hasAnswered = selectedOption !== null

                    let btnClass = styles.optionBtn
                    let icon = ""

                    if (hasAnswered) {
                      if (isSelected) {
                        if (isCorrect) {
                          btnClass = `${styles.optionBtn} ${styles.selectedCorrect}`
                          icon = "✅"
                        } else {
                          btnClass = `${styles.optionBtn} ${styles.selectedIncorrect}`
                          icon = "❌"
                        }
                      } else if (isCorrect) {
                        btnClass = `${styles.optionBtn} ${styles.unselectedCorrect}`
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        disabled={hasAnswered}
                        className={btnClass}
                      >
                        <span>{option}</span>
                        {icon && <span className={styles.optionIcon}>{icon}</span>}
                      </button>
                    )
                  })}
                </div>

                {selectedOption !== null && (
                  <div className={styles.explanationBox}>
                    <div className={styles.explanationTitle}>Explanation</div>
                    <p>{quizQuestions[currentQuestionIdx].explanation}</p>
                  </div>
                )}

                {selectedOption !== null && (
                  <button onClick={handleNextQuestion} className={styles.nextBtn}>
                    {currentQuestionIdx + 1 === quizQuestions.length ? 'Finish Quiz' : 'Next Question ➡️'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.resultScreen}>
              <span className={styles.modeIcon}>🏆</span>
              <h3 className={styles.resultTitle}>Quiz Finished!</h3>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreVal}>{quizScore}</span>
                <span className={styles.scoreLabel}>/ {quizQuestions.length} Correct</span>
              </div>
              <p className={styles.resultFeedback}>
                {quizScore === quizQuestions.length 
                  ? "Perfect score! You've mastered the content in this video."
                  : quizScore >= quizQuestions.length * 0.7 
                    ? "Great job! You have a solid grasp of the concepts."
                    : "Good try! Consider reviewing the notes or auto-summary to reinforce your learning."}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={startQuiz} className={styles.nextBtn}>Retake Quiz</button>
                <button onClick={resetMode} className={styles.retakeBtn}>Exit Practice</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PlayerPracticeTab
