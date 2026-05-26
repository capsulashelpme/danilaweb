import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAILS = ['daniel.chquintana@gmail.com', 'daniel@danilaweb.app']

type Mode = 'login' | 'register'

// ── Icons ──────────────────────────────────────────────────────
const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
  </svg>
)
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconEye = ({ show }: { show: boolean }) => show ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'loginSpin .7s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
)

// ── Field ──────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, type = 'text',
  icon, rightEl, hint, autoComplete, onEnter,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; icon?: React.ReactNode
  rightEl?: React.ReactNode; hint?: string; autoComplete?: string
  onEnter?: () => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 14, color: focused ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', transition: 'color .2s', pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key === 'Enter' && onEnter) onEnter() }}
          style={{
            width: '100%', height: 50,
            paddingLeft: icon ? 42 : 16,
            paddingRight: rightEl ? 44 : 16,
            boxSizing: 'border-box', borderRadius: 14,
            background: focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${focused ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
            color: '#fff', fontSize: 15, outline: 'none',
            fontFamily: 'inherit', transition: 'border-color .2s, background .2s',
          }}
        />
        {rightEl && (
          <span style={{ position: 'absolute', right: 14 }}>
            {rightEl}
          </span>
        )}
      </div>
      {hint && (
        <p style={{ marginTop: 5, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{hint}</p>
      )}
    </div>
  )
}

// ── AtField — campo con @ visual y normalización automática ────
function AtField({
  label, value, onChange, hint, error: fieldError, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void
  hint?: string; error?: string | null; autoComplete?: string
}) {
  const [focused, setFocused] = useState(false)
  const accentColor = fieldError ? 'rgba(255,60,60,0.6)' : focused ? 'rgba(255,159,10,0.55)' : 'rgba(255,255,255,0.08)'
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* @ prefix badge */}
        <span style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, fontWeight: 700, color: focused ? 'rgba(255,159,10,0.8)' : 'rgba(255,255,255,0.25)',
          pointerEvents: 'none', transition: 'color .2s',
          fontFamily: 'monospace',
        }}>@</span>
        <input
          type="text"
          value={value}
          onChange={e => {
            // Normalizar: sin @, sin espacios, lowercase, solo a-z0-9_.
            const v = e.target.value.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30)
            onChange(v)
          }}
          placeholder="usuario"
          autoComplete={autoComplete ?? 'username'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', height: 50,
            paddingLeft: 42, paddingRight: 16,
            boxSizing: 'border-box', borderRadius: 14,
            background: focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${accentColor}`,
            color: '#fff', fontSize: 15, outline: 'none',
            fontFamily: 'monospace', letterSpacing: '0.02em',
            transition: 'border-color .2s, background .2s',
          }}
        />
      </div>
      {fieldError ? (
        <p style={{ marginTop: 5, fontSize: 11, color: 'rgba(255,80,80,0.9)' }}>{fieldError}</p>
      ) : hint ? (
        <p style={{ marginTop: 5, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{hint}</p>
      ) : null}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInByUsername, signUp } = useAuth()

  const [mode, setMode]               = useState<Mode>('login')
  const [email, setEmail]             = useState('')
  const [username, setUsername]       = useState('')
  const [loginUser, setLoginUser]     = useState('') // username para login
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showPwd, setShowPwd]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [success, setSuccess]           = useState(false)

  // Auto-suggest username from email (solo si el campo está vacío)
  useEffect(() => {
    if (mode === 'register' && email.includes('@') && !username) {
      const suggested = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30)
      setUsername(suggested)
    }
  }, [email, mode])

  const switchMode = (m: Mode) => {
    setMode(m); setError(null); setSuccess(false)
    setPassword(''); setConfirm(''); setEmail(''); setLoginUser(''); setTermsAccepted(false)
  }

  const redirectAfterLogin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: prof } = await supabase.from('profiles').select('is_admin').eq('id', user!.id).maybeSingle()
    const isAdmin = prof?.is_admin || ADMIN_EMAILS.includes(user?.email ?? '')
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
  }

  const handleSubmit = async () => {
    setError(null)

    if (mode === 'login') {
      if (!loginUser || !password) { setError('Completa todos los campos.'); return }
      setLoading(true)
      const { error } = await signInByUsername(loginUser, password)
      if (error) {
        // Mensaje genérico — no revelar si el usuario/email existe (evita enumeración)
        setError('Credenciales incorrectas.')
        setLoading(false)
        return
      }
      await redirectAfterLogin()
    } else {
      if (!email || !username || !password || !confirm) { setError('Completa todos los campos.'); return }
      if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
      if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
      setLoading(true)

      const { error } = await signUp(email, password, username)
      if (error) {
        // Correo o @usuario ya existe → redirige a login
        if (
          error.includes('already registered') ||
          error.includes('already been registered') ||
          error.includes('@usuario ya está en uso')
        ) {
          setLoading(false)
          switchMode('login')
          setLoginUser(email || username)
          setError('Esta cuenta ya existe. Inicia sesión para continuar.')
          return
        }
        setError(error)
        setLoading(false)
        return
      }

      // Auto-login inmediato después del registro
      const { error: loginErr } = await signIn(email, password)
      if (loginErr) {
        setSuccess(true)
        setLoading(false)
        return
      }
      await redirectAfterLogin()
    }
  }

  const canSubmit = mode === 'login'
    ? loginUser.length > 1 && password.length >= 6   // login: 6 mínimo (usuarios existentes)
    : email.length > 3 && username.length > 0 && password.length >= 8 && confirm.length >= 8 && termsAccepted

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 28, padding: '40px 32px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        animation: 'loginFadeUp .5s cubic-bezier(.22,1,.36,1) both',
      }}>

        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(255,159,10,0.2), rgba(255,100,0,0.1))',
            border: '1px solid rgba(255,159,10,0.25)',
            marginBottom: 16,
            fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em',
            color: 'rgba(255,159,10,1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            D
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 6, color: '#fff' }}>
            {mode === 'login' ? 'Accede a tu panel' : 'Crea tu cuenta'}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            {mode === 'login' ? 'Bienvenido de nuevo.' : 'Tarda menos de un minuto.'}
          </p>

          {/* Aviso de acceso exclusivo — solo en login */}
          {mode === 'login' && (
            <p style={{
              marginTop: 10,
              fontSize: 12,
              color: 'rgba(255,255,255,0.25)',
              lineHeight: 1.5,
            }}>
              Acceso exclusivo para clientes con{' '}
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>Meta Ads activo</span>.
            </p>
          )}
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12,
          padding: 4, marginBottom: 28, gap: 4,
        }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, height: 36, borderRadius: 9, border: 'none',
              background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: mode === m ? '#fff' : 'rgba(255,255,255,0.4)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all .2s',
            }}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Success state */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#34C759' }}>
              <IconCheck />
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>¡Cuenta creada!</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 20 }}>
              Revisa tu correo para confirmar tu cuenta, luego inicia sesión.
            </p>
            <button onClick={() => switchMode('login')} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 24px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Error */}
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', fontSize: 13, color: '#ff6b6b' }}>
                {error}
              </div>
            )}

            {/* Fields */}
            {mode === 'login' ? (
              <Field
                label="Correo o @usuario" value={loginUser}
                onChange={v => { setLoginUser(v); setError(null) }}
                placeholder="correo@dominio.com o @usuario"
                icon={<IconUser />} autoComplete="username"
                onEnter={handleSubmit}
              />
            ) : (
              <>
                <Field
                  label="Correo electrónico" value={email}
                  onChange={v => { setEmail(v); setError(null) }}
                  placeholder="tu@correo.com" type="email"
                  icon={<IconEmail />} autoComplete="email"
                />
                <AtField
                  label="Tu @usuario único"
                  value={username}
                  onChange={v => { setUsername(v); setError(null) }}
                  hint="Con esto podrás iniciar sesión. Solo letras, números, _ y ."
                  autoComplete="username"
                />
              </>
            )}

            <Field
              label="Contraseña" value={password}
              onChange={v => { setPassword(v); setError(null) }}
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              type={showPwd ? 'text' : 'password'}
              icon={<IconLock />} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onEnter={mode === 'login' ? handleSubmit : undefined}
              rightEl={
                <button onClick={() => setShowPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex' }}>
                  <IconEye show={showPwd} />
                </button>
              }
            />

            {mode === 'register' && (
              <>
                <Field
                  label="Confirmar contraseña" value={confirm}
                  onChange={setConfirm}
                  placeholder="Repite tu contraseña"
                  type={showConfirm ? 'text' : 'password'}
                  icon={<IconLock />} autoComplete="new-password"
                  rightEl={
                    <button onClick={() => setShowConfirm(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex' }}>
                      <IconEye show={showConfirm} />
                    </button>
                  }
                />

                {/* Terms checkbox — only visible in register, after password step */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  cursor: 'pointer', userSelect: 'none',
                  marginTop: 2,
                }}>
                  {/* Custom checkbox */}
                  <span
                    onClick={() => setTermsAccepted(v => !v)}
                    style={{
                      flexShrink: 0, marginTop: 1,
                      width: 16, height: 16, borderRadius: 5,
                      border: `1.5px solid ${termsAccepted ? 'rgba(255,159,10,0.7)' : 'rgba(255,255,255,0.2)'}`,
                      background: termsAccepted ? 'rgba(255,159,10,0.15)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    {termsAccepted && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,159,10,0.9)" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </span>
                  <span
                    onClick={() => setTermsAccepted(v => !v)}
                    style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}
                  >
                    He leído y acepto los{' '}
                    <Link
                      to="/legal/terminos"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >
                      Términos y Condiciones
                    </Link>
                  </span>
                </label>
              </>
            )}

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
              style={{
                marginTop: 4, height: 50, borderRadius: 14, border: 'none',
                background: canSubmit && !loading
                  ? 'rgba(255,159,10,1)'
                  : 'rgba(255,159,10,0.25)',
                color: canSubmit && !loading ? '#000' : 'rgba(255,255,255,0.3)',
                fontWeight: 700, fontSize: 15, cursor: loading ? 'wait' : canSubmit ? 'pointer' : 'default',
                fontFamily: 'inherit', transition: 'all .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? <><Spinner />{mode === 'login' ? 'Entrando…' : 'Creando cuenta…'}</> :
                mode === 'login' ? 'Entrar al panel →' : 'Crear cuenta →'}
            </button>

            {/* Forgot password + Volver a inicio */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mode === 'login' && (
                <a href="https://wa.me/526143041750" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
                  ¿Olvidaste tu contraseña? Escríbele a Daniel →
                </a>
              )}
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center',
                  justifyContent: 'center', gap: 7,
                  transition: 'color .15s', padding: '4px 0',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                  <polyline points="9 21 9 12 15 12 15 21"/>
                </svg>
                Volver a inicio
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loginFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes loginSpin   { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
