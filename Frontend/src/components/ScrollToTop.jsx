import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      // Check immediately and with small backoff timeouts to handle page load rendering
      const scrollToHash = () => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return true
        }
        return false
      }

      if (!scrollToHash()) {
        const timer1 = setTimeout(scrollToHash, 100)
        const timer2 = setTimeout(scrollToHash, 300)
        return () => {
          clearTimeout(timer1)
          clearTimeout(timer2)
        }
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}

export default ScrollToTop
