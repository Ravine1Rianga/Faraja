import { Link } from 'react-router-dom'
import { useState } from 'react'
import Icon from '../components/ui/Icon'
import { Menu } from 'lucide-react'

export default function Navbar() {
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
            <Link to="/#features" className="nav-link">Features</Link>
            <Link to="/#how-it-works" className="nav-link">How It Works</Link>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-ghost">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <button className="nav-hamburger" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22} /></button>
          </div>
        </div>
      </nav>
      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link to="/memorials" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Memorials</Link>
        <a href="/#features" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="/#how-it-works" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>How It Works</a>
        <div className="divider" style={{ margin: '8px 0' }} />
        <Link to="/login" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
        <Link to="/register" className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setMenuOpen(false)}>Get Started</Link>
      </div>
    </>
  )
}
