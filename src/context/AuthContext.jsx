import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('access_token')
      const storedUser  = localStorage.getItem('user')
      if (storedToken && storedUser) {
        setAccessToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await loginUser(credentials)
    const { access, refresh, user: userData } = response.data

    // Support flat user in response or nested
    const resolvedUser = userData || response.data

    localStorage.setItem('access_token',  access)
    if (refresh) localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(resolvedUser))

    setAccessToken(access)
    setUser(resolvedUser)
    return resolvedUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!accessToken && !!user,
    role:   user?.role   || null,
    baseId: user?.base_id || user?.base || null,
    baseName: user?.base_name || user?.base_display || null,
    login,
    logout,
  }

 return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
