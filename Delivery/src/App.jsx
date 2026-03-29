import './App.css'
import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppShell from './components/AppShell.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import { LogisticsResolverProvider } from './context/LogisticsResolverContext.jsx'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ExplorePage = lazy(() => import('./pages/ExplorePage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const DeliveriesPage = lazy(() => import('./pages/DeliveriesPage.jsx'))
const DeliveryDetailsPage = lazy(() => import('./pages/DeliveryDetailsPage.jsx'))
const MapPage = lazy(() => import('./pages/MapPage.jsx'))
const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage.jsx'))
const SupportPage = lazy(() => import('./pages/SupportPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))

function LoadingScreen() {
  return (
    <div className="min-h-dvh bg-noise">
      <div className="mx-auto flex min-h-dvh max-w-[430px] items-center justify-center px-6">
        <div className="lid-card rounded-2xl px-6 py-4 text-sm text-slate-600">Chargement de l'interface LID...</div>
      </div>
    </div>
  )
}

function LogisticsSectionLayout() {
  return (
    <LogisticsResolverProvider>
      <Outlet />
    </LogisticsResolverProvider>
  )
}

function App() {
  const location = useLocation()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route element={<LogisticsSectionLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/deliveries" element={<DeliveriesPage />} />
              <Route path="/deliveries/:shipmentId" element={<DeliveryDetailsPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

export default App
