import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login")
    }
  }, [user, isLoading, navigate])

  if (isLoading) return <div>Loading...</div>
  if (!user) return null

  return children || <Outlet />
}

export const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/inventory")
    }
  }, [user, isLoading, navigate])

  if (isLoading) return <div>Loading...</div>
  if (user) return null

  return children
}
