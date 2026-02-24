import './App.css'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ExplorePage = lazy(() => import('./pages/ExplorePage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="lid-card rounded-2xl px-6 py-4 text-sm text-slate-600">Chargement de l'interface LID...</div>
    </div>
  )
}

function App() {
  const location = useLocation()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

export default App
