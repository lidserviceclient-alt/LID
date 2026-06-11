import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { ThemeProvider } from './features/theme/theme-provider.jsx'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
})
const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/'

// #region debug-point B:boot-env-and-sw
typeof window !== 'undefined' && fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'staging-api-mismatch', runId: 'pre-fix', hypothesisId: 'B', location: 'src/main.jsx:21', msg: '[DEBUG] app boot environment', data: { href: window.location.href, host: window.location.host, mode: import.meta.env.MODE, viteApiUrl: import.meta.env.VITE_API_URL, baseUrl: import.meta.env.BASE_URL, hasController: Boolean(navigator.serviceWorker?.controller) }, ts: Date.now() }) }).catch(() => {});
// #endregion

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <BrowserRouter basename={basePath}>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
