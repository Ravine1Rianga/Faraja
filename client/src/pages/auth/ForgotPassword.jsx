import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import Icon from '../../components/ui/Icon'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setError('Enter your email'); return }
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Link to="/login" style={{ position: 'fixed', top: 24, left: 24, zIndex: 100, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← Back to Sign In
      </Link>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon"><Icon name="dove" /></div>
            <div className="auth-logo-name">Fa<span>raja</span></div>
          </div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle text-muted">Enter your email and we'll send you a reset link</p>

          {error && <div className="alert alert-error" style={{ display: 'block' }}><Icon name="alert" size={14} /> {error}</div>}
          {sent && <div className="alert alert-success" style={{ display: 'block' }}><Icon name="check" size={14} /> Reset link sent! Check your email.</div>}

          {!sent && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <span className="input-icon"><Icon name="mail" size={16} /></span>
                  <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
