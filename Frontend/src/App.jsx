import React, { useEffect } from 'react'
import Layout from './components/Layout/Layout'
import MainRoutes from './routes/MainRoutes'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  return (
    <AuthProvider>
      <ScrollToTop />
      <Layout>
        <MainRoutes />
      </Layout>
    </AuthProvider>
  )
}

export default App