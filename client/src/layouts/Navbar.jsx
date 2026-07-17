import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Icon from '../components/ui/Icon'
import { useAuth } from '../contexts/AuthContext'
import { Menu } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="navbar" id="navbar">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon"><Icon name="dove" /></div>
            <span className="nav-logo-text">Fa<span>raja</span></span>
          </Link>
          <div className="nav-links">
            <Link to="/memorials" className="nav-link">Memorials</Link>
            <Link to="/vendors" className="nav-link">Vendors</Link>
            <Link to="/#features" className="nav-link">Features</Link>
            <Link to="/#how-it-works" className="nav-link">How It Works</Link>
          </div>
          <div className="nav-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
                <button className="btn btn-ghost btn-sm" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="avatar avatar-sm" style={{ background: 'var(--gold)', color: '#000', fontSize: '0.7rem', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Sign In</Link>
                <Link to="/register" className="btn btn-primary">Get Started</Link>
              </>
            )}
            <button className="nav-hamburger" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22} /></button>
          </div>
        </div>
      </nav>
      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link to="/memorials" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Memorials</Link>
        <Link to="/vendors" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Vendors</Link>
        <a href="/#features" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="/#how-it-works" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>How It Works</a>
        <div className="divider" style={{ margin: '8px 0' }} />
        {user ? (
          <>
            <Link to="/dashboard" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={() => { logout(); setMenuOpen(false) }}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setMenuOpen(false)}>Get Started</Link>
          </>
        )}
      </div>
    </>
  )
}
