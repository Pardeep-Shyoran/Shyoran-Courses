import { Link } from 'react-router-dom'
import styles from './CourseCard.module.css'

const CourseCard = ({ course, activeMainTab, enrolledCourseId, onDelete, onEnroll }) => {
  const completedCount = course.videos ? course.videos.filter((v) => v.completed).length : 0
  const totalCount = course.videos ? course.videos.length : 0
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const isCompleted = totalCount > 0 && completedCount === totalCount

  return (
    <div className={styles.card}>
      <div className={styles.thumbnailWrapper}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className={styles.thumbnail} />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        )}
        
        <span className={styles.badge}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          {totalCount} videos
        </span>

        {activeMainTab === 'library' && isCompleted && (
          <span className={styles.completedTag}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Completed
          </span>
        )}

        {activeMainTab === 'explore' && enrolledCourseId && (
          <span className={styles.enrolledTag}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Enrolled
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title} title={course.title}>
          {course.title}
        </h3>
        <p className={styles.description}>
          {course.description || 'No description provided for this course roadmap.'}
        </p>

        {activeMainTab === 'explore' && course.user && (
          <div className={styles.author}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>
              {course.user.name} <span className={styles.authorRole}>({course.user.role})</span>
            </span>
          </div>
        )}

        <div className={styles.footer}>
          {activeMainTab === 'library' ? (
            <div className={styles.progressSection}>
              <div className={styles.progressText}>
                <span>Progress</span>
                <span>{completionPercentage}% ({completedCount}/{totalCount})</span>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${completionPercentage}%`,
                    backgroundColor: isCompleted ? 'var(--success)' : 'var(--primary-color)'
                  }}
                />
              </div>
            </div>
          ) : (
            <div className={styles.syllabusText}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Full syllabus included</span>
            </div>
          )}

          <div className={styles.actions}>
            {activeMainTab === 'library' ? (
              <>
                <Link to={`/courses/${course._id}`} className={styles.primaryBtn}>
                  {completionPercentage === 100 ? 'Review' : completionPercentage > 0 ? 'Resume' : 'Start'}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
                <button
                  className={styles.deleteBtn}
                  onClick={() => onDelete(course._id, course.title)}
                  title="Delete Course"
                  aria-label="Delete Course"
                >
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
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </>
            ) : (
              <>
                {enrolledCourseId ? (
                  <Link to={`/courses/${enrolledCourseId}`} className={styles.secondaryBtn}>
                    <span>Go to Course</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                ) : (
                  <button onClick={() => onEnroll(course._id)} className={styles.primaryBtn}>
                    <span>Enroll Now</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
