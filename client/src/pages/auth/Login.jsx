import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import Icon from '../../components/ui/Icon'

export default function Login() {
  const { user, login, isAdmin, isVendor } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      if (isAdmin) navigate('/admin')
      else if (isVendor) navigate('/vendor-dashboard')
      else navigate('/dashboard')
    }
  }, [user, isAdmin, isVendor, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Email and password are required'); return }
    setLoading(true)
    try {
      const u = await login({ email, password })
      showToast(`Welcome back, ${u.name.split(' ')[0]}!`, 'success')
      setTimeout(() => {
        const redirect = searchParams.get('redirect')
        if (redirect) navigate(redirect)
        else if (u.role === 'admin' || u.role_name === 'admin') navigate('/admin')
        else if (u.role === 'vendor' || u.role_name === 'vendor') navigate('/vendor-dashboard')
        else navigate('/dashboard')
      }, 800)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Link to="/" style={{ position: 'fixed', top: 24, left: 24, zIndex: 100, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← Back to Home
      </Link>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <Link to="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
              <div className="auth-logo-icon"><Icon name="dove" /></div>
              <div className="auth-logo-name">Fa<span>raja</span></div>
            </Link>
          </div>

          {error && <div className="alert alert-error" style={{ display: 'block' }}><Icon name="alert" size={14} /> {error}</div>}

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle text-muted">Sign in to continue managing your memorial</p>
          <div className="auth-divider"><span>sign in with email</span></div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-icon"><Icon name="mail" size={16} /></span>
                <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>Forgot password?</Link>
              </div>
              <div className="input-group">
                <span className="input-icon"><Icon name="lock" size={16} /></span>
                <input type="password" className="form-control" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginBottom: 20 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free →</Link>
          </p>

          <div className="alert alert-info" style={{ marginTop: 20, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="info" size={14} />
            <div><strong>Admin:</strong> <code>admin@faraja.co.ke</code> / <code>admin123</code></div>
          </div>
        </div>
      </div>
    </>
  )
}
