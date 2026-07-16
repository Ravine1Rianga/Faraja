import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Icon from '../../components/ui/Icon'
import * as usersApi from '../../api/users'

export default function EditProfile() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    usersApi.getProfile().then(({ data }) => {
      const p = data.user || data
      setProfile(p)
      setForm(prev => ({ ...prev, name: p.name || '', phone: p.phone || '' }))
    }).catch(() => showToast('Failed to load profile', 'error'))
  }, [])

  const handleSave = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      showToast('Passwords do not match', 'error'); return
    }
    if (form.newPassword && form.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error'); return
    }
    setSaving(true)
    try {
      const payload = { name: form.name, phone: form.phone }
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword
        payload.newPassword = form.newPassword
      }
      if (photo) {
        const fd = new FormData()
        fd.append('profilePhoto', photo)
        fd.append('name', form.name)
        fd.append('phone', form.phone)
        await usersApi.updateProfileWithPhoto(fd)
      } else {
        await usersApi.updateProfile(payload)
      }
      showToast('Profile updated', 'success')
      navigate('/profile')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await usersApi.deleteAccount()
      showToast('Account deactivated', 'info')
      logout()
      navigate('/')
    } catch (_) { showToast('Failed to deactivate account', 'error') }
    finally { setDeleting(false) }
  }

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="container" style={{ padding: '24px 24px 60px', maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div className="breadcrumb" style={{ marginBottom: 8 }}>
          <a href="/profile" onClick={e => { e.preventDefault(); navigate('/profile') }}>Profile</a>
          <span className="breadcrumb-sep">›</span>
          <span>Edit</span>
        </div>
        <h1 className="page-title">Edit Profile</h1>
        <p className="page-subtitle">Update your account information, phone number, and password.</p>
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="avatar user-avatar-initials" style={{ width: 56, height: 56, fontSize: '1.2rem', position: 'relative' }}>
              {photo ? <img src={URL.createObjectURL(photo)} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
            </div>
            <div>
              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                Change Photo
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setPhoto(e.target.files[0])} />
              </label>
              {photo && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{photo.name}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Full Name</label>
            <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-control" value={profile?.email || ''} disabled style={{ opacity: 0.6 }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Email cannot be changed</p>
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. +254712345678" />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '8px 0' }} />
          <h4 style={{ margin: 0 }}>Change Password</h4>

          <div>
            <label className="form-label">Current Password</label>
            <input className="form-control" type="password" value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Leave blank to keep current" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">New Password</label>
              <input className="form-control" type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input className="form-control" type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repeat new password" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => navigate('/profile')}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 32 }}>
        <Card title={<><Icon name="alert-triangle" style={{ color: 'var(--danger)' }} /> Danger Zone</>} style={{ border: '1px solid var(--danger)', borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 12 }}>
            Once you deactivate your account, it will be disabled. Your memorials and contributions will remain visible.
          </p>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Deactivate Account</Button>
        </Card>
      </div>

      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
        message="Are you sure you want to deactivate your account? This action can be reversed by contacting support."
        confirmText="Deactivate" onConfirm={handleDelete} danger />
    </div>
  )
}
