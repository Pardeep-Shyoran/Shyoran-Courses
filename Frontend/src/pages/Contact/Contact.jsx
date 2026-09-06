import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './Contact.module.css'

const FAQ_DATA = [
  {
    category: 'Syllabus & Sync',
    question: 'How fast does YouTube playlist synchronization take?',
    answer: 'Playlist extraction typically takes between 2 to 5 seconds. We automatically fetch all video titles, video IDs, thumbnail artwork, and total durations, organizing them into a distraction-free lesson syllabus.'
  },
  {
    category: 'Curation',
    question: 'Can I suggest a YouTube playlist to be added to the public catalog?',
    answer: 'Yes! Select the "Course Suggestion" category above and send us the YouTube playlist link along with the domain/topic. Our curation team regularly reviews and adds the highest quality playlists to the public catalog.'
  },
  {
    category: 'Notes & Sync',
    question: 'Are my timestamped notes exported or backed up?',
    answer: 'All of your course-level and lesson-level notes are securely saved to your account in the cloud. You can review them anytime, click timestamps to jump directly into the video, or export them as Markdown files.'
  },
  {
    category: 'Access & Cost',
    question: 'Is Shyoran Courses completely free to use?',
    answer: 'Yes, 100%. Our mission is to make self-directed learning clean, structured, and completely free of algorithmic distraction, ads, and subscription paywalls.'
  },
  {
    category: 'Support',
    question: 'How do I report a broken video or playlist issue?',
    answer: 'If a creator deletes a video or sets a playlist to private on YouTube, simply select "Bug Report" above with the course title or URL, and we will update or refresh the syllabus cache.'
  },
  {
    category: 'Privacy',
    question: 'Can I import unlisted or personal YouTube playlists?',
    answer: 'Yes, you can import unlisted playlists as long as you have the direct link. Private playlists cannot be accessed by our synchronization crawler unless they are set to unlisted or public on YouTube.'
  }
]

const CATEGORIES = [
  { id: 'feedback', label: '💬 General Feedback', subjectPrefix: 'General Feedback: ' },
  { id: 'course', label: '🎓 Course Suggestion', subjectPrefix: 'Course Suggestion: ' },
  { id: 'feature', label: '✨ Feature Request', subjectPrefix: 'Feature Request: ' },
  { id: 'bug', label: '🐛 Bug Report', subjectPrefix: 'Bug Report: ' },
  { id: 'partnership', label: '🤝 Partnership / Help', subjectPrefix: 'Partnership Inquiry: ' }
]

const CATEGORY_PLACEHOLDERS = {
  feedback: "Share what you enjoy about Shyoran Courses or where we can make your study workflow better...",
  course: "Include the YouTube playlist link, the subject/field, creator name, and why other students would benefit...",
  feature: "Describe the feature you'd like to see, how it works, and how it improves your learning experience...",
  bug: "Describe what happened, what device or browser you're using, and the playlist link if applicable...",
  partnership: "Tell us about your organization, project idea, or how you'd like to collaborate with Shyoran Courses..."
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'feedback',
    subject: 'General Feedback: ',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const formSectionRef = useRef(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const scrollToForm = (categoryId = null) => {
    if (categoryId) {
      const cat = CATEGORIES.find((c) => c.id === categoryId)
      if (cat) {
        handleCategorySelect(cat)
      }
    }
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleCategorySelect = (cat) => {
    setFormData((prev) => ({
      ...prev,
      category: cat.id,
      subject: prev.subject.includes(':') 
        ? `${cat.subjectPrefix}${prev.subject.split(':')[1]?.trim() || ''}`
        : cat.subjectPrefix
    }))
    if (errors.subject) {
      setErrors((prev) => ({ ...prev, subject: '' }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2500)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Please enter your name'
    
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address'
    }
    
    if (!formData.subject.trim() || formData.subject.trim().endsWith(':')) {
      newErrors.subject = 'Please enter a subject or topic'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide a brief message description'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      // Simulate network request with realistic feedback
      setTimeout(() => {
        setIsSubmitting(false)
        setIsSubmitted(true)
      }, 700)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      category: 'feedback',
      subject: 'General Feedback: ',
      message: ''
    })
    setIsSubmitted(false)
    setErrors({})
  }

  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        {/* ========================================================= */}
        {/* SECTION 1: HERO HEADER & TRUST METRICS STRIP             */}
        {/* ========================================================= */}
        <section className={styles.header}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeDot}></span>
            <span>WE'D LOVE TO HEAR FROM YOU</span>
          </div>
          <h1 className={styles.pageTitle}>
            Let’s Start a <span className={styles.gradientText}>Conversation</span>
          </h1>
          <p className={styles.tagline}>
            Have a question, feedback on a learning playlist, or a feature suggestion?
            Reach out directly or send us a note below.
          </p>

          {/* Trust & Live Availability Strip */}
          <div className={styles.trustStrip}>
            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <span className={styles.liveIndicator}></span>
              </div>
              <div className={styles.trustText}>
                <strong>Support Online</strong>
                <span>Response in &lt;12 hrs</span>
              </div>
            </div>

            <div className={styles.trustDivider}></div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className={styles.trustText}>
                <strong>Direct Human Help</strong>
                <span>No automated bot loops</span>
              </div>
            </div>

            <div className={styles.trustDivider}></div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div className={styles.trustText}>
                <strong>Global Learners</strong>
                <span>Accessible worldwide</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: MAIN CONTACT HUB (CHANNELS & SMART FORM)      */}
        {/* ========================================================= */}
        <section className={styles.contactHubSection} ref={formSectionRef}>
          <div className={styles.grid}>
            {/* Left Column: Direct Communication Suite */}
            <div className={styles.channelsCard}>
              <div className={styles.cardHeaderArea}>
                <span className={styles.sectionBadge}>DIRECT CHANNELS</span>
                <h2 className={styles.columnTitle}>Connect With Us</h2>
                <p className={styles.columnSubtitle}>
                  Prefer instant communication? Reach out via our primary support inbox or developer channels.
                </p>
              </div>

              <div className={styles.channelsList}>
                {/* Channel 1: Support Desk */}
                <div className={styles.channelItem}>
                  <div className={styles.channelIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className={styles.channelBody}>
                    <div className={styles.channelTop}>
                      <h4>Support Desk</h4>
                      <span className={styles.channelStatusPill}>Active</span>
                    </div>
                    <div className={styles.channelHeaderRow}>
                      <a href="mailto:support@shyorancourses.com" className={styles.channelContactLink}>
                        support@shyorancourses.com
                      </a>
                      <button
                        type="button"
                        className={`${styles.copyBtn} ${copiedEmail ? styles.copyBtnSuccess : ''}`}
                        onClick={() => handleCopyEmail('support@shyorancourses.com')}
                        title="Copy email to clipboard"
                      >
                        {copiedEmail ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className={styles.channelDesc}>For playlist sync questions, account support, or general queries</span>
                  </div>
                </div>

                {/* Channel 2: Syllabus & Course Suggestions */}
                <div className={styles.channelItem}>
                  <div className={styles.channelIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  <div className={styles.channelBody}>
                    <div className={styles.channelTop}>
                      <h4>Course Suggestions</h4>
                      <button
                        type="button"
                        className={styles.miniActionLink}
                        onClick={() => scrollToForm('course')}
                      >
                        Use Preset &darr;
                      </button>
                    </div>
                    <p className={styles.channelContact}>Playlist & Curriculum Desk</p>
                    <span className={styles.channelDesc}>Found an exceptional YouTube series? Suggest it for our public index</span>
                  </div>
                </div>

                {/* Channel 3: Founder & Lead Developer */}
                <div className={styles.channelItem}>
                  <div className={styles.channelIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className={styles.channelBody}>
                    <div className={styles.channelTop}>
                      <h4>Founder & Developer</h4>
                      <a 
                        href="https://github.com/Pardeep-Shyoran" 
                        target="_blank" 
                        rel="noreferrer"
                        className={styles.miniActionLink}
                      >
                        GitHub &rarr;
                      </a>
                    </div>
                    <p className={styles.channelContact}>Pardeep Shyoran</p>
                    <span className={styles.channelDesc}>Platform vision, code contributions & architectural collaborations</span>
                  </div>
                </div>
              </div>

              {/* Response Time & Office Hours Card */}
              <div className={styles.telemetryBanner}>
                <div className={styles.telemetryHeader}>
                  <div className={styles.telemetryStatus}>
                    <span className={styles.liveIndicator}></span>
                    <strong>Support Live Desk</strong>
                  </div>
                  <span className={styles.timezoneBadge}>IST (UTC+5:30)</span>
                </div>
                <div className={styles.telemetryText}>
                  Our typical turnaround for learning suggestions and bug fixes is <strong>under 12 hours</strong> on weekdays.
                </div>
              </div>
            </div>

            {/* Right Column: Smart Interactive Form */}
            <div className={styles.formCard}>
              <div className={styles.formTopBeam}></div>
              {isSubmitted ? (
                <div className={styles.successOverlay}>
                  <div className={styles.successIcon}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3>Message Received!</h3>
                  <p>
                    Thank you for reaching out, <strong>{formData.name}</strong>. Your message regarding{' '}
                    <em>"{formData.subject}"</em> has been logged, and our team will get back to you at{' '}
                    <strong>{formData.email}</strong> promptly.
                  </p>
                  <button type="button" className={styles.resetBtn} onClick={handleReset}>
                    <span>Send Another Message</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.formHeader}>
                    <span className={styles.sectionBadge}>SEND US A MESSAGE</span>
                    <h2>How can we help?</h2>
                    <p>Select a topic to route your inquiry directly to the right inbox.</p>
                  </div>

                  {/* Category Selection Chips */}
                  <div className={styles.categoryChips} role="group" aria-label="Inquiry Category">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`${styles.categoryChip} ${formData.category === cat.id ? styles.categoryChipActive : ''}`}
                        onClick={() => handleCategorySelect(cat)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} noValidate className={styles.contactForm}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="name">Your Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`${styles.inputField} ${errors.name ? styles.errorInput : ''}`}
                          placeholder="e.g. Alex Morgan"
                        />
                        {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`${styles.inputField} ${errors.email ? styles.errorInput : ''}`}
                          placeholder="alex@example.com"
                        />
                        {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`${styles.inputField} ${errors.subject ? styles.errorInput : ''}`}
                        placeholder="What is this regarding?"
                      />
                      {errors.subject && <span className={styles.errorMessage}>{errors.subject}</span>}
                    </div>

                    <div className={styles.formGroup}>
                      <div className={styles.labelWithCounter}>
                        <label htmlFor="message">Message</label>
                        <span className={styles.charCounter}>{formData.message.length} chars</span>
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className={`${styles.textareaField} ${errors.message ? styles.errorInput : ''}`}
                        placeholder={CATEGORY_PLACEHOLDERS[formData.category] || "Share your thoughts or describe your inquiry..."}
                      />
                      {errors.message && <span className={styles.errorMessage}>{errors.message}</span>}
                    </div>

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className={styles.submitSpinner}></span>
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                        </>
                      )}
                    </button>

                    <div className={styles.formFooterNote}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>Your privacy is protected. We will never share or sell your details.</span>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: FULL-WIDTH DEDICATED FAQ KNOWLEDGE BASE       */}
        {/* ========================================================= */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionBadge}>COMMON INQUIRIES</span>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Quick answers to the most common questions regarding playlist import, video notes, and platform features.
            </p>
          </div>

          <div className={styles.faqGrid}>
            {FAQ_DATA.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className={`${styles.faqCard} ${isOpen ? styles.faqCardOpen : ''}`}
                >
                  <button
                    type="button"
                    className={styles.faqQuestionBtn}
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <div className={styles.faqQuestionLeft}>
                      <span className={styles.faqCategoryTag}>{faq.category}</span>
                      <span className={styles.faqQuestionText}>{faq.question}</span>
                    </div>
                    <div className={styles.faqIconCircle}>
                      <svg
                        className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </button>
                  {isOpen && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom FAQ Help Box */}
          <div className={styles.faqHelpBox}>
            <div className={styles.faqHelpContent}>
              <h4>Still have questions or need personalized guidance?</h4>
              <p>Our team is always happy to assist with your YouTube playlists, accounts, or suggestions.</p>
            </div>
            <button
              type="button"
              className={styles.faqHelpBtn}
              onClick={() => scrollToForm()}
            >
              <span>Write to Us</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: INSTANT SELF-SERVICE PATHWAYS                  */}
        {/* ========================================================= */}
        <section className={styles.selfServiceSection}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionBadge}>FAST ACTIONS</span>
            <h2 className={styles.sectionTitle}>Looking for Instant Solutions?</h2>
            <p className={styles.sectionSubtitle}>
              You don't have to wait for an email reply. Take immediate action with these quick platform tools.
            </p>
          </div>

          <div className={styles.selfServiceGrid}>
            {/* Quick Action 1: Import a Course */}
            <div className={styles.quickCard}>
              <div className={styles.quickCardIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div className={styles.quickCardBody}>
                <h3>Import a YouTube Playlist</h3>
                <p>Convert any YouTube playlist into an organized, distraction-free syllabus in seconds.</p>
              </div>
              <Link to="/" className={styles.quickCardLink}>
                <span>Try Playlist Converter</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>

            {/* Quick Action 2: Report Broken Syllabus */}
            <div className={styles.quickCard}>
              <div className={styles.quickCardIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className={styles.quickCardBody}>
                <h3>Report a Video or Bug</h3>
                <p>Found a deleted video, private link, or glitch? Let us know so we can refresh the index.</p>
              </div>
              <button
                type="button"
                className={styles.quickCardLink}
                onClick={() => scrollToForm('bug')}
              >
                <span>Report Syllabus Issue</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            {/* Quick Action 3: Explore Courses */}
            <div className={styles.quickCard}>
              <div className={styles.quickCardIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div className={styles.quickCardBody}>
                <h3>Browse Curated Catalog</h3>
                <p>Explore hand-picked learning series in Web Dev, Python, System Design, and Computer Science.</p>
              </div>
              <Link to="/courses" className={styles.quickCardLink}>
                <span>Explore Course Catalog</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Contact
