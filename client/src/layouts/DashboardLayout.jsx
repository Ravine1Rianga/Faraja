import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=' + encodeURIComponent(location.pathname))
    }
  }, [user, loading, navigate, location.pathname])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
  if (!user) return null

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <button className="sidebar-toggle" id="sidebarToggle" onClick={() => document.getElementById('sidebar')?.classList.toggle('collapsed')}>☰</button>
      <main className="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}
