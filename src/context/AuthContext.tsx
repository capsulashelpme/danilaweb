import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, type Profile } from '@/lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInByUsername: (username: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Carga el perfil y resuelve loading al terminar
  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, business_name, avatar_url, is_admin, created_at, username, email')
      .eq('id', userId)
      .single()
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (perfil aún no creado); otros errores son inesperados
      console.error('[AuthContext] Error cargando perfil:', error.message)
    }
    setProfile(data ?? null)
    setLoading(false)   // ← loading false DESPUÉS de tener el perfil
  }

  useEffect(() => {
    // Sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        // loadProfile llamará setLoading(false) cuando termine
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escucha cambios de auth (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)          // volver a "cargando" mientras buscamos el perfil
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  // Login por username o email
  // Acepta: correo@dominio.com | @usuario | usuario
  const signInByUsername = async (usernameOrEmail: string, password: string) => {
    const input = usernameOrEmail.trim()

    // Detectar si es email: tiene exactamente un @ que no está al inicio
    const atIdx = input.indexOf('@')
    const isEmail = atIdx > 0 && input.indexOf('@', atIdx + 1) === -1

    if (isEmail) {
      return signIn(input, password)
    }

    // Es username — quitar @ del principio si lo pusieron
    const handle = input.startsWith('@') ? input.slice(1).toLowerCase() : input.toLowerCase()
    if (!handle) return { error: 'Usuario no encontrado.' }

    // Usa la función RPC con SECURITY DEFINER (bypasea RLS, solo devuelve email)
    const { data: resolvedEmail, error: rpcErr } = await supabase
      .rpc('resolve_username_to_email', { handle })

    // Mensaje genérico — no revelar si el usuario existe o no (evita enumeración)
    if (rpcErr || !resolvedEmail) return { error: 'Credenciales incorrectas.' }

    return signIn(resolvedEmail as string, password)
  }

  const signUp = async (email: string, password: string, usernameRaw: string) => {
    // Normalizar: lowercase, sin @, sin espacios, solo alfanumérico+_+.
    const handle = usernameRaw.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '')
    if (!handle) return { error: 'El nombre de usuario no es válido.' }

    // 0. Verificar unicidad del username antes de crear Auth
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', handle)
      .maybeSingle()
    if (existing) return { error: 'Este @usuario ya está en uso. Elige otro.' }

    // 1. Crear cuenta en Auth
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'No se pudo crear la cuenta.' }

    // 2. Crear perfil con username, email y full_name
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: handle,
      business_name: handle,
      username: handle,
      email: email.toLowerCase().trim(),
      is_admin: false,
    }, { onConflict: 'id' })

    if (profileError) console.warn('Profile upsert warning:', profileError.message)

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signInByUsername, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
