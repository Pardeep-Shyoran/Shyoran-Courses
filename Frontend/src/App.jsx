import React from 'react'
import Layout from './components/Layout/Layout'
import MainRoutes from './routes/MainRoutes'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './context/AuthContext'

const App = () => {
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