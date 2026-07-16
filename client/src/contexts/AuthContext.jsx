import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('faraja_token'))
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    if (!token) { setUser(null); setLoading(false); return }
    try {
      const { data } = await authApi.getMe()
      setUser(data.data?.user || data.user)
    } catch {
      setUser(null)
      setToken(null)
      localStorage.removeItem('faraja_token')
      localStorage.removeItem('faraja_user')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchUser() }, [fetchUser])

  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  const login = async (credentials) => {
    const res = await authApi.login(credentials)
    const t = res.data.data?.token || res.data.token
    const u = res.data.data?.user || res.data.user
    localStorage.setItem('faraja_token', t)
    localStorage.setItem('faraja_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
    return u
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    const t = res.data.data?.token || res.data.token
    const u = res.data.data?.user || res.data.user
    localStorage.setItem('faraja_token', t)
    localStorage.setItem('faraja_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('faraja_token')
    localStorage.removeItem('faraja_user')
    setToken(null)
    setUser(null)
  }

  const role = user?.role || user?.role_name
  const isAdmin = role === 'admin'
  const isVendor = role === 'vendor'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isVendor, role }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
