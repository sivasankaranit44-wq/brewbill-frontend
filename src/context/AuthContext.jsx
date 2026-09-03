import { createContext, useContext, useState } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    localStorage.getItem("brewUser")
      ? JSON.parse(localStorage.getItem("brewUser"))
      : null
  )

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem("brewUser", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("brewUser")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}