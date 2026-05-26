import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import App from './App'

// Páginas que NUNCA se necesitan en el landing — se cargan solo si el usuario navega a esa ruta
const LoginPage      = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const DashboardPage  = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AdminPage      = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })))
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })))
const LegalPage      = lazy(() => import('@/pages/LegalPage').then(m => ({ default: m.LegalPage })))

const PageLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'grid', placeItems: 'center',
    background: 'var(--bg-0)', color: 'var(--fg-3)', fontSize: 13,
    fontFamily: 'var(--font-mono)',
  }}>
    Cargando…
  </div>
)

// Protege rutas de clientes: si no hay sesión redirige al login
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: 'var(--bg-0)', color: 'var(--fg-3)', fontSize: 13,
        fontFamily: 'var(--font-mono)',
      }}>
        Cargando…
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

// Protege el panel admin: si no hay sesión → /admin/login; si no es admin → /
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: 'var(--bg-0)', color: 'var(--fg-3)', fontSize: 13,
        fontFamily: 'var(--font-mono)',
      }}>
        Cargando…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!profile?.is_admin) return <Navigate to="/" replace />
  return <>{children}</>
}

// Si ya está logueado y va al login de cliente → va al panel correcto
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <>{children}</>
  return <Navigate to={profile?.is_admin ? '/admin' : '/dashboard'} replace />
}

export default function Root() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Landing pública */}
            <Route path="/" element={<App />} />

            {/* Login clientes — solo si no estás autenticado */}
            <Route path="/login" element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } />

            {/* Dashboard clientes — protegido */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } />

            {/* Login admin — solo si no hay sesión activa */}
            <Route path="/admin/login" element={
              <PublicOnlyRoute>
                <AdminLoginPage />
              </PublicOnlyRoute>
            } />

            {/* Panel admin — solo Daniel (is_admin = true) */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />

            {/* Páginas legales */}
            <Route path="/legal/:slug" element={<LegalPage />} />

            {/* Cualquier otra ruta → home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
