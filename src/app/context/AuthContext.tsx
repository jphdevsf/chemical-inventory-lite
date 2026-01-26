import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import type { User } from "../../../server/types/index"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem("token")
    if (savedToken) {
      // Verify token and fetch user
      fetchUser(savedToken)
        .then(currentUser => {
          if (currentUser) {
            setUser(currentUser)
            setToken(savedToken)
          }
          setIsLoading(false)
        })
        .catch(() => {
          localStorage.removeItem("token")
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch("http://localhost:3001/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error("Unauthorized")
      const users = await response.json()
      // Find the user associated with the token - for now, return first or null
      return users[0] || null // Simplified - in full impl, use token userId
    } catch {
      return null
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      if (!response.ok) throw new Error("Login failed")
      const data = await response.json()
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem("token", data.token)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
