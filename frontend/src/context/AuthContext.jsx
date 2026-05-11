import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginApi, getMeApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [ready, setReady] = useState(false)

  // Restore session on page load
  useEffect(() => {
    if (!token) { setReady(true); return }
    getMeApi()
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem('token'); setToken(null) })
      .finally(() => setReady(true))
  }, [])

  const login = useCallback(async (username, password) => {
    const res = await loginApi(username, password)
    const { access_token } = res.data
    localStorage.setItem('token', access_token)
    setToken(access_token)
    const me = await getMeApi(access_token)
    setUser(me.data)
    return me.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin  = () => user?.role === 'admin'
  const isClient = () => user?.role === 'client'

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout, isAdmin, isClient }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
