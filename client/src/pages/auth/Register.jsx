import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import Icon from '../../components/ui/Icon'

export default function Register() {
  const { user, register, isAdmin, isVendor } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'family', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      if (isAdmin) navigate('/admin')
      else if (isVendor) navigate('/vendor-dashboard')
      else navigate('/dashboard')
    }
  }, [user, isAdmin, isVendor, navigate])

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.lastName || !form.email || !form.password) { setError('Required fields missing'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      await register({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        phone: form.phone,
        role: form.role,
        password: form.password,
      })
      showToast('Account created successfully!', 'success')
      const redirect = form.role === 'vendor' ? '/vendor-dashboard' : '/dashboard'
      setTimeout(() => navigate(redirect), 800)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
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

          <h2 className="auth-title">Join Faraja</h2>
          <p className="auth-subtitle text-muted">Create an account to plan a dignified farewell</p>
          <div className="auth-divider"><span>your details</span></div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input type="text" className="form-control" placeholder="John" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input type="text" className="form-control" placeholder="Kamau" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="input-group">
                <span className="input-icon"><Icon name="mail" size={16} /></span>
                <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-group">
                <span className="input-icon"><Icon name="phone" size={16} /></span>
                <input type="tel" className="form-control" placeholder="0712 345 678" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">I am a... *</label>
              <select className="form-control" value={form.role} onChange={e => update('role', e.target.value)}>
                <option value="family">Family Member / Organiser</option>
                <option value="vendor">Service Provider / Vendor</option>
                <option value="contributor">Contributor / Guest</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input type="password" className="form-control" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} autoComplete="new-password" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-check">
                <input type="checkbox" required />
                <span className="form-check-label">
                  I agree to the <a href="javascript:void(0)">Terms of Service</a> and <a href="javascript:void(0)">Privacy Policy</a>.
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </>
  )
}
