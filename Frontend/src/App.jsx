import React from 'react'
import Layout from './components/Layout/Layout'
import MainRoutes from './routes/MainRoutes'
import ScrollToTop from './components/ScrollToTop'

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <MainRoutes />
      </Layout>
    </>
  )
}

export default App