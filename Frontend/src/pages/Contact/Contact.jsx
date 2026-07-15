import { useState } from 'react'
import styles from './Contact.module.css'

const FAQ_DATA = [
  {
    question: 'How do I import a course playlist?',
    answer: 'Once you log in, go to your Dashboard and click "Import Playlist". Simply paste any public YouTube playlist URL, and we will extract the video details to build your course.'
  },
  {
    question: 'Is Shyoran Courses free to use?',
    answer: 'Yes! The core platform is 100% free to import playlists, watch videos, write markdown notes, and track progress.'
  },
  {
    question: 'Where are my notes stored?',
    answer: 'All of your course-wide and video-specific notes are securely saved on our servers, linked directly to your authenticated user account. You can export them anytime.'
  },
  {
    question: 'Can I import private YouTube playlists?',
    answer: 'Currently, we only support public or unlisted YouTube playlists, as we retrieve video metadata via public API endpoints. Private playlists cannot be accessed.'
  }
]

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for that field when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Simulate form submission to backend
      console.log('Contact form submitted:', formData)
      setIsSubmitted(true)
    }
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitted(false)
    setErrors({})
  }

  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        {/* Header */}
        <section className={styles.header}>
          {/* Subtle Torana Line Model Background */}
          <div className={styles.contactMotif}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.motifSvg}>
              {/* Concentric circles representing learning loops */}
              <circle cx="100" cy="100" r="80" stroke="var(--primary-color)" strokeWidth="0.25" strokeDasharray="3 3" opacity="0.15" />
              <circle cx="100" cy="100" r="60" stroke="var(--warning)" strokeWidth="0.25" opacity="0.2" />
              <circle cx="100" cy="100" r="40" stroke="var(--text-tertiary)" strokeWidth="0.5" strokeDasharray="1 5" opacity="0.3" />
              
              {/* Architectural Gateway Arches (Indian Torana vaults) */}
              <path d="M60 180V100C60 77.9 77.9 60 100 60s40 17.9 40 40v80" stroke="var(--primary-color)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M75 180V100C75 86.2 86.2 75 100 75s25 11.2 25 25v80" stroke="var(--warning)" strokeWidth="1" opacity="0.5" />
              <path d="M90 180v-80c0-5.5 4.5-10 10-10s10 4.5 10 10v80" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.25" />

              {/* Horizontal beams (Torana lintels) */}
              <line x1="45" y1="70" x2="155" y2="70" stroke="var(--primary-color)" strokeWidth="1" opacity="0.2" />
              <line x1="55" y1="85" x2="145" y2="85" stroke="var(--warning)" strokeWidth="0.75" opacity="0.35" />

              {/* Structured nodes */}
              <g opacity="0.75">
                <circle cx="60" cy="110" r="4" fill="var(--bg-secondary)" stroke="var(--primary-color)" strokeWidth="1.5" />
                <line x1="64" y1="110" x2="75" y2="110" stroke="var(--primary-color)" strokeWidth="0.75" />
              </g>
              <g opacity="0.75">
                <circle cx="140" cy="130" r="4" fill="var(--bg-secondary)" stroke="var(--warning)" strokeWidth="1.5" />
                <line x1="125" y1="130" x2="136" y2="130" stroke="var(--warning)" strokeWidth="0.75" />
              </g>
              <g opacity="0.85">
                <circle cx="100" cy="75" r="5" fill="var(--primary-color)" />
                <circle cx="100" cy="75" r="8" stroke="var(--primary-color)" strokeWidth="0.5" opacity="0.4" />
              </g>

              {/* Suryodaya glow filter */}
              <circle cx="100" cy="100" r="18" fill="url(#sunriseGlowContact)" opacity="0.3" />

              <defs>
                <radialGradient id="sunriseGlowContact" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--warning)" />
                  <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>
          <div className={styles.headerBadge}>✉️ CONNECT WITH US</div>
          <h1>
            Get in <span className={styles.gradientText}>Touch</span>
          </h1>
          <p className={styles.tagline}>
            Have questions, feature requests, or feedback? Send us a message and we'll reply as soon as possible.
          </p>
        </section>

        {/* Content Grid */}
        <div className={styles.grid}>
          {/* Left Column: Details & FAQs */}
          <div className={styles.infoColumn}>
            <section className={styles.contactDetails}>
              <h2>Contact Information</h2>
              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Email Us</h4>
                    <p>support@shyorancourses.com</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Call Us</h4>
                    <p>+1 (555) 019-2834</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Office Location</h4>
                    <p>Silicon Valley, CA, USA</p>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.faqSection}>
              <h2>Frequently Asked Questions</h2>
              <div className={styles.faqList}>
                {FAQ_DATA.map((faq, index) => {
                  const isOpen = openFaq === index
                  return (
                    <div key={index} className={styles.faqItem}>
                      <button
                        className={styles.faqQuestion}
                        onClick={() => toggleFaq(index)}
                        aria-expanded={isOpen}
                      >
                        {faq.question}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                      <div className={`${styles.faqAnswerContainer} ${isOpen ? styles.answerOpen : ''}`}>
                        <div className={styles.faqAnswer}>
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Form Card */}
          <div className={styles.formCard}>
            {isSubmitted ? (
              <div className={styles.successOverlay}>
                <div className={styles.successIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3>Message Sent Successfully!</h3>
                <p>
                  Thank you for reaching out, {formData.name}. We have received your inquiry and our support team will contact you shortly.
                </p>
                <button className={styles.resetBtn} onClick={handleReset}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2>Send a Message</h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`${styles.inputField} ${errors.name ? styles.errorInput : ''}`}
                      placeholder="John Doe"
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
                      placeholder="john@example.com"
                    />
                    {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
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
                      placeholder="How can we help you?"
                    />
                    {errors.subject && <span className={styles.errorMessage}>{errors.subject}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`${styles.textareaField} ${errors.message ? styles.errorInput : ''}`}
                      placeholder="Write your message details here..."
                    />
                    {errors.message && <span className={styles.errorMessage}>{errors.message}</span>}
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
