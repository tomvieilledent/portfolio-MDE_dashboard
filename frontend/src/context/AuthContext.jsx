// Contexte d'authentification : expose `user`, `login`, `logout` à toute l'app.
// Le token vit dans localStorage (via lib/api). Au montage, si un token existe,
// on récupère le profil courant (/users/me) pour restaurer la session.

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setTokens, clearTokens } from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'

const AuthContext = createContext(null)

// Le backend n'a pas de champ `role` : on le dérive de `is_super_admin`.
export function roleOf(user) {
  if (!user) return 'guest'
  return user.is_super_admin ? 'admin' : 'user'
}

// Nom d'affichage + initiales, calculés une fois pour le Header.
export function displayName(user) {
  if (!user) return ''
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return full || user.email
}

export function initialsOf(user) {
  if (!user) return '?'
  const full = [user.first_name, user.last_name].filter(Boolean)
  if (full.length) return full.map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  return (user.email || '?').slice(0, 2).toUpperCase()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restauration de session au démarrage.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const { user } = await api.me()
        if (!cancelled) { setUser(user); connectSocket() }
      } catch (err) {
        // On n'invalide la session que si le token est réellement refusé (401),
        // pas sur une coupure réseau / backend momentanément indisponible.
        if (err?.status === 401) clearTokens()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    restore()
    return () => { cancelled = true }
  }, [])

  // Déconnexion forcée déclenchée par le client API sur un 401 authentifié.
  useEffect(() => {
    const onForcedLogout = () => { disconnectSocket(); setUser(null) }
    window.addEventListener('auth:logout', onForcedLogout)
    return () => window.removeEventListener('auth:logout', onForcedLogout)
  }, [])

  async function login(email, password) {
    const data = await api.login(email, password) // peut throw -> géré par l'appelant
    setTokens(data)
    setUser(data.user)
    connectSocket()
    return data.user
  }

  // Inscription : crée le compte puis connecte automatiquement l'utilisateur.
  async function register(payload) {
    const data = await api.register(payload) // {user, access_token, refresh_token}
    setTokens(data)
    setUser(data.user)
    connectSocket()
    return data.user
  }

  async function logout() {
    try {
      await api.logout() // révoque le JTI côté backend
    } catch (_) {
      /* on déconnecte localement même si l'appel échoue */
    }
    disconnectSocket()
    clearTokens()
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: roleOf(user),
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>')
  return ctx
}
