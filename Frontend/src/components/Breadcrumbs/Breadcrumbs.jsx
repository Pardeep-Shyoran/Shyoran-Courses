import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Breadcrumbs.module.css'

const Breadcrumbs = ({ customItems, className = '' }) => {
  const location = useLocation()
  const path = location.pathname

  // Do not show breadcrumbs on the homepage
  if (path === '/') return null

  // If custom items are passed (e.g. from CoursePlayer), use them
  let items = customItems

  if (!items) {
    const pathSegments = path.split('/').filter(Boolean)
    items = [
      {
        title: 'Home',
        url: '/',
        type: 'home'
      }
    ]

    if (pathSegments[0] === 'dashboard') {
      items.push({
        title: 'Dashboard',
        url: '/dashboard',
        type: 'dashboard',
        active: true
      })
    } else if (pathSegments[0] === 'courses') {
      items.push({
        title: 'My Courses',
        url: '/courses',
        type: 'courses',
        active: !pathSegments[1]
      })

      if (pathSegments[1]) {
        items.push({
          title: 'Course Workspace',
          url: `/courses/${pathSegments[1]}`,
          type: 'course',
          active: true
        })
      }
    } else if (pathSegments[0] === 'about') {
      items.push({
        title: 'About',
        url: '/about',
        type: 'about',
        active: true
      })
    } else if (pathSegments[0] === 'contact') {
      items.push({
        title: 'Contact',
        url: '/contact',
        type: 'contact',
        active: true
      })
    } else if (pathSegments[0] === 'login') {
      items.push({
        title: 'Login',
        url: '/login',
        type: 'auth',
        active: true
      })
    } else if (pathSegments[0] === 'register') {
      items.push({
        title: 'Register',
        url: '/register',
        type: 'auth',
        active: true
      })
    }
  }

  const renderIcon = (type) => {
    switch (type) {
      case 'home':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        )
      case 'dashboard':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        )
      case 'courses':
      case 'course':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        )
      case 'about':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )
      case 'contact':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <nav className={`${styles.breadcrumbsContainer} ${className}`} aria-label="Breadcrumb navigation">
      <ol className={styles.breadcrumbsList}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className={styles.breadcrumbItem}>
              {index > 0 && (
                <svg className={styles.separator} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              )}

              {isLast || item.active ? (
                <span className={`${styles.breadcrumbLink} ${styles.active}`} aria-current="page">
                  {renderIcon(item.type)}
                  <span className={styles.label}>{item.title}</span>
                </span>
              ) : (
                <Link to={item.url} className={styles.breadcrumbLink}>
                  {renderIcon(item.type)}
                  <span className={styles.label}>{item.title}</span>
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
