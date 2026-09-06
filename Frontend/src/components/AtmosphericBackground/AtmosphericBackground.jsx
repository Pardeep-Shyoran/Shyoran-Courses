import React from 'react'
import { useLocation } from 'react-router-dom'
import styles from './AtmosphericBackground.module.css'

const AtmosphericBackground = ({ variant }) => {
  const location = useLocation()

  // Detect if current route is CoursePlayer workspace (/courses/:id where :id is not just 'courses')
  const isWorkspace = 
    variant === 'focused' || 
    (location.pathname.startsWith('/courses/') && location.pathname !== '/courses')

  return (
    <div 
      className={`${styles.backgroundCanvas} ${isWorkspace ? styles.focused : ''}`}
      aria-hidden="true"
    >
      {/* 32px Micro-Dot Matrix with Radial Gradient Mask */}
      <div className={styles.dotMatrix} />

      {/* Primary Signature Saffron/Terracotta Spotlight */}
      <div className={styles.warmSpotlight} />

      {/* Cosmic Indigo Depth Light */}
      <div className={styles.indigoDepth} />

      {/* Secondary Indigo Ambient Fill */}
      <div className={styles.indigoSecondary} />
    </div>
  )
}

export default React.memo(AtmosphericBackground)
