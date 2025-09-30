import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '../Layout.jsx'
import Dashboard from '../Pages/Dashboard.jsx'
import CreateIntegration from '../Pages/CreateIntegration.jsx'
import IntegrationDetails from '../Pages/IntegrationDetails.jsx'
import RunHistory from '../Pages/RunHistory.jsx'
import Credentials from '../Pages/Credentials.jsx'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/Dashboard" replace />} />
          <Route path="/Dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/CreateIntegration" element={<Layout><CreateIntegration /></Layout>} />
          <Route path="/IntegrationDetails" element={<Layout><IntegrationDetails /></Layout>} />
          <Route path="/RunHistory" element={<Layout><RunHistory /></Layout>} />
          <Route path="/Credentials" element={<Layout><Credentials /></Layout>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
