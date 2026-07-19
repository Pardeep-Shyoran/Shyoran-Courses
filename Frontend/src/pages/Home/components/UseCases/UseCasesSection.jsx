import styles from './UseCasesSection.module.css'

const useCasesData = [
  {
    emoji: '🎓',
    title: 'Academic Students',
    description: 'Organize university lecture series, online syllabus modules, and preparation bootcamps. Take timestamped study notes to revise quickly before exams.'
  },
  {
    emoji: '💻',
    title: 'Developers & Techies',
    description: 'Work through multi-part programming courses, system design playlists, or library deep-dives. Jot down code blocks in notes and track your progress side-by-side.'
  },
  {
    emoji: '📈',
    title: 'Career Switchers',
    description: 'Structure professional certifications, business skills playlists, or finance courses. Gain shareable certificates to prove your self-taught achievements.'
  },
  {
    emoji: '🧠',
    title: 'Lifelong Learners',
    description: 'Turn history documentaries, science playlists, art guides, or language channels into systematic studies without getting lost in recommendations.'
  }
]

const UseCasesSection = () => {
  return (
    <section className={styles.useCases}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionHeaderBadge}>Who is it for?</span>
        <h2>Tailored for Every Learning Journey</h2>
        <p>Explore how students, professionals, and makers use Shyoran Courses daily.</p>
      </div>
      
      <div className={styles.useCaseGrid}>
        {useCasesData.map((useCase, idx) => (
          <div key={idx} className={styles.useCaseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.cardTitle}>USE CASE // {useCase.title.toUpperCase()}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.useCaseHeader}>
                <span className={styles.useCaseEmoji}>{useCase.emoji}</span>
                <h3>{useCase.title}</h3>
              </div>
              <p>{useCase.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default UseCasesSection
