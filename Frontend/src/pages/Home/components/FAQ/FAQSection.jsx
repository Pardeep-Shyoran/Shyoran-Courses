import { useState } from 'react'
import styles from './FAQSection.module.css'

const faqData = [
  {
    question: 'Is Shyoran Courses completely free to use?',
    answer: 'Yes! Shyoran Courses is 100% free. You can import unlimited YouTube playlists, write markdown notes, track your daily streaks, and earn verifiable certificates of completion without any hidden fees.'
  },
  {
    question: 'Can I import private or unlisted YouTube playlists?',
    answer: 'You can import unlisted playlists if you have the direct link. However, private playlists cannot be accessed because YouTube restricts private data access. Ensure your playlist is set to public or unlisted.'
  },
  {
    question: 'How do timestamped notes work?',
    answer: 'While watching any lesson in our focus player, click the timestamp button or type [MM:SS] in the notes panel. The timestamp converts into a clickable bookmark that jumps the video player directly to that exact second.'
  },
  {
    question: 'How do I claim my shareable certificates?',
    answer: 'Once you complete every lecture in a course, our platform automatically enables the Certificate Viewer where you can preview, verify, and download a high-resolution PDF certificate with a unique credential ID.'
  },
  {
    question: 'Can I reorder or reverse the curriculum sequence?',
    answer: 'Yes! Inside your course workspace, you can drag and drop lectures to fix numbering mistakes, reverse the entire playlist order (ideal for playlists uploaded in reverse), or toggle completed lectures out of view.'
  }
]

const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(null)

  const toggleOpen = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section className={styles.faqSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionHeaderBadge}>Help & FAQ</span>
        <h2>Frequently Asked Questions</h2>
        <p>Common questions about importing playlists, note-taking, and verifiable credentials.</p>
      </div>

      <div className={styles.faqContainer}>
        <div className={styles.accordion}>
          {faqData.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div 
                key={idx} 
                className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}
              >
                <button 
                  onClick={() => toggleOpen(idx)} 
                  className={styles.accordionHeader}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <div className={styles.chevronIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>
                <div className={styles.accordionContent}>
                  <div className={styles.contentInner}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQSection
