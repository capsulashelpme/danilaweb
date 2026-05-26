import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin .75s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}

const LOCK_KEY    = 'adm_lock'
const ATTEMPT_KEY = 'adm_att'

export function AdminLoginPage() {
  const navigate  = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [locked,   setLocked]   = useState(false)
  const [remaining, setRemaining] = useState(0)

  // Verificar si ya hay bloqueo activo
  useEffect(() => {
    checkLock()
    const t = setInterval(checkLock, 1000)
    return () => clearInterval(t)
  }, [])

  const checkLock = () => {
    const lockUntil = parseInt(localStorage.getItem(LOCK_KEY) ?? '0')
    const now = Date.now()
    if (lockUntil > now) {
      setLocked(true)
      setRemaining(Math.ceil((lockUntil - now) / 1000))
    } else {
      setLocked(false)
      setRemaining(0)
    }
  }

  const getAttempts = () => parseInt(localStorage.getItem(ATTEMPT_KEY) ?? '0')

  const registerFailedAttempt = () => {
    const attempts = getAttempts() + 1
    localStorage.setItem(ATTEMPT_KEY, attempts.toString())
    if (attempts >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000
      localStorage.setItem(LOCK_KEY, lockUntil.toString())
      localStorage.setItem(ATTEMPT_KEY, '0')
    }
    return attempts
  }

  const clearAttempts = () => {
    localStorage.removeItem(LOCK_KEY)
    localStorage.removeItem(ATTEMPT_KEY)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    setError(null)
    setLoading(true)

    try {
      // 1. Intentar login con Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError || !data.user) {
        const attempts = registerFailedAttempt()
        const left = MAX_ATTEMPTS - attempts
        if (left <= 0) {
          setError(`Demasiados intentos. Bloqueado por ${LOCKOUT_MINUTES} minutos.`)
        } else {
          setError(`Credenciales incorrectas. ${left} intento${left === 1 ? '' : 's'} restante${left === 1 ? '' : 's'}.`)
        }
        setLoading(false)
        return
      }

      // 2. Verificar que sea admin — por email o por is_admin en DB
      const ADMIN_EMAILS = ['daniel.chquintana@gmail.com', 'daniel@danilaweb.app']
      const isAdminByEmail = ADMIN_EMAILS.includes(data.user.email ?? '')

      if (!isAdminByEmail) {
        // Intentar verificar por DB como respaldo
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile?.is_admin) {
          await supabase.auth.signOut()
          registerFailedAttempt()
          setError('Acceso no autorizado.')
          setLoading(false)
          return
        }
      }

      // 3. Es admin — limpiar intentos y redirigir
      clearAttempts()
      navigate('/admin', { replace: true })

    } catch {
      setError('Error de conexión.')
      setLoading(false)
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080808', padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '40px 32px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(255,90,31,0.15)',
            border: '1px solid rgba(255,90,31,0.3)',
            marginBottom: 16,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 20, letterSpacing: '-0.02em', color: '#fff', marginBottom: 6,
          }}>
            Acceso restringido
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            Solo personal autorizado
          </p>
        </div>

        {/* Bloqueado */}
        {locked ? (
          <div style={{
            padding: '20px', borderRadius: 12, textAlign: 'center',
            background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" style={{ marginBottom: 10 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ color: '#ff6b6b', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
              Acceso bloqueado
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              Intenta de nuevo en{' '}
              <span style={{ fontFamily: 'var(--font-mono)', color: '#ff6b6b', fontWeight: 700 }}>
                {formatTime(remaining)}
              </span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)',
                fontSize: 13, color: '#ff6b6b',
              }}>
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                Usuario
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="usuario@dominio.com"
                style={{
                  width: '100%', height: 46, padding: '0 14px', boxSizing: 'border-box',
                  borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: 14, outline: 'none',
                  fontFamily: 'var(--font-body)', transition: 'border-color .2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,90,31,0.6)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  style={{
                    width: '100%', height: 46, padding: '0 44px 0 14px', boxSizing: 'border-box',
                    borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff', fontSize: 14, outline: 'none',
                    fontFamily: 'var(--font-body)', transition: 'border-color .2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(255,90,31,0.6)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: 4,
                  }}
                >
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6, height: 46, borderRadius: 10, border: 'none',
                background: loading ? 'rgba(255,90,31,0.4)' : 'var(--orange-1)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background .2s',
              }}
            >
              {loading ? <><Spinner /> Verificando…</> : 'Entrar'}
            </button>
          </form>
        )}

        {/* Intentos restantes */}
        {!locked && getAttempts() > 0 && (
          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>
            {MAX_ATTEMPTS - getAttempts()} intentos restantes antes del bloqueo
          </p>
        )}
      </div>
    </div>
  )
}
