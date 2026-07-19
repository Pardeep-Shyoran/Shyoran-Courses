import { useState } from 'react'
import styles from './FAQSection.module.css'

const faqData = [
  {
    question: 'Is Shyoran Courses completely free to use?',
    answer: 'Yes! Shyoran Courses is 100% free. You can import unlimited playlists, write notes, build streaks, and get shareable certificates of completion without any cost.'
  },
  {
    question: 'Can I import private or unlisted YouTube playlists?',
    answer: 'You can import unlisted playlists if you have the direct link. However, private playlists cannot be accessed by our scraper because YouTube protects private data. Please ensure your playlist is set to public or unlisted.'
  },
  {
    question: 'How do timestamped notes work?',
    answer: 'While watching a video in our focus player, write notes in the markdown editor. Clicking the timestamp icon inserts a bookmark link (e.g. 05:24). Clicking that note later skips the player instantly to that second.'
  },
  {
    question: 'How do I claim my shareable certificates?',
    answer: 'Once you finish watching all the videos in an imported course, our system automatically generates a customized certificate of completion with a unique verification code that you can add to LinkedIn.'
  },
  {
    question: 'Can I reorder or reverse the curriculum sequence?',
    answer: 'Yes! Inside your course settings page, you can drag and drop lessons to fix import sequences, reverse order (perfect for playlists imported backwards), or hide completed lectures.'
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
        <p>Everything you need to know about our active learning platform.</p>
      </div>

      <div className={styles.faqContainer}>
        <div className={styles.faqBrowserCard}>
          <div className={styles.cardHeader}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.cardTitle}>SYSTEM // DOCUMENTATION & FAQ</span>
          </div>
          
          <div className={styles.cardBody}>
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
                      <span className={styles.chevron}>▼</span>
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
        </div>
      </div>
    </section>
  )
}

export default FAQSection
