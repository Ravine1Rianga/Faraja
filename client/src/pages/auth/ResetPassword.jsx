import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../api/auth'
import { useToast } from '../../contexts/ToastContext'
import Icon from '../../components/ui/Icon'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    try {
      await resetPassword({ token, password })
      showToast('Password reset successful!', 'success')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed')
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
          <h2 className="auth-title">Set New Password</h2>
          <p className="auth-subtitle text-muted">Enter your new password below</p>

          {error && <div className="alert alert-error" style={{ display: 'block' }}><Icon name="alert" size={14} /> {error}</div>}

          {token ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <p style={{ color: 'var(--danger)' }}>Invalid or missing reset token.</p>
          )}
        </div>
      </div>
    </>
  )
}
