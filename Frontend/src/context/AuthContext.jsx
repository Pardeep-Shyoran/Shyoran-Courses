import { createContext, useContext, useState, useEffect } from 'react'
import { getUserProfile, logoutUser } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const checkAuth = async () => {
      try {
        const data = await getUserProfile()
        if (isMounted && data?.user) {
          setUser(data.user)
        }
      } catch (err) {
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    const handleAuthLogout = () => {
      localStorage.removeItem('token')
      setUser(null)
    }

    window.addEventListener('auth:logout', handleAuthLogout)

    return () => {
      isMounted = false
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [])

  const login = (param1, param2) => {
    let userObj = param1
    if (typeof param1 === 'string' && param2 && typeof param2 === 'object') {
      userObj = param2
    }
    setUser(userObj)
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      window.dispatchEvent(new Event('auth:logout'))
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    token: user ? 'cookie-authenticated' : null,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
