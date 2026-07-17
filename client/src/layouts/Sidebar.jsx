import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../components/ui/Icon'

const links = [
  { section: 'Management' },
  { to: '/dashboard', icon: 'home', label: 'Dashboard' },
  { to: '/memorials', icon: 'dove', label: 'Memorials' },
  { to: '/funerals/new', icon: 'plus', label: 'New Funeral' },
  { to: '/committee', icon: 'users', label: 'Committee' },
  { to: '/tasks', icon: 'check', label: 'Tasks' },
  { to: '/order-of-service', icon: 'file-text', label: 'Order of Service' },
  { to: '/vendors', icon: 'store', label: 'Vendors' },
  { section: 'Finance' },
  { to: '/contributions', icon: 'money', label: 'Contributions' },
  { to: '/financials', icon: 'chart', label: 'Financials' },
]

const accountLinks = [
  { to: '/profile', icon: 'user', label: 'Profile' },
]

const adminLinks = [
  { to: '/admin', icon: 'shield', label: 'Admin Panel' },
]

const vendorLinks = [
  { to: '/vendor-dashboard', icon: 'store', label: 'Vendor Dashboard' },
]

export default function Sidebar() {
  const { user, logout, isAdmin, isVendor } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const renderLink = (link) => (
    <a key={link.to} href={link.to} onClick={e => { e.preventDefault(); navigate(link.to) }}
      className={`sidebar-link${isActive(link.to) ? ' active' : ''}`}>
      <span className="sidebar-link-icon"><Icon name={link.icon} /></span> {link.label}
    </a>
  )

  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Icon name="dove" /></div>
        <span className="sidebar-logo-text">Fa<span>raja</span></span>
      </div>

      {links.map((item, i) =>
        item.section
          ? <div key={i} className="sidebar-section-label">{item.section}</div>
          : renderLink(item)
      )}

      {(isAdmin || isVendor) && <div className="sidebar-section-label">Hub</div>}
      {isAdmin && renderLink(adminLinks[0])}
      {isVendor && renderLink(vendorLinks[0])}

      <div className="sidebar-section-label">Account</div>
      {accountLinks.map(renderLink)}

      <div className="sidebar-bottom">
        <div className="sidebar-user" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="avatar user-avatar-initials">
            {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{user?.role || user?.role_name || 'Family Member'}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop: 8 }} onClick={logout}>Sign Out</button>
      </div>
    </div>
  )
}
