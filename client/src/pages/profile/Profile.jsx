import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Widget from '../../components/ui/Widget'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/ui/Icon'
import * as usersApi from '../../api/users'
import * as funeralsApi from '../../api/funerals'

export default function Profile() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [contributions, setContributions] = useState([])
  const [funerals, setFunerals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      usersApi.getProfile().then(({ data }) => setProfile(data.user || data)).catch(() => {}),
      usersApi.getMyContributions().then(({ data }) => setContributions(data.contributions || [])).catch(() => {}),
      funeralsApi.getFunerals().then(({ data }) => setFunerals(data.funerals || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const p = profile || user
  const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)
  const initials = p?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading profile...</div>

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account, view your memorials, and track your donation history.</p>
        </div>
        <Link to="/profile/edit" className="btn btn-primary"><Icon name="pencil" /> Edit Profile</Link>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 28 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="avatar user-avatar-initials" style={{ width: 64, height: 64, fontSize: '1.4rem' }}>
              {p?.profile_photo ? <img src={p.profile_photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{p?.name || 'User'}</h3>
              <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{p?.email}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="badge badge-active">{p?.role || 'family'}</span>
                {p?.phone && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}><Icon name="phone" size={14} /> {p.phone}</span>}
              </div>
            </div>
          </div>
        </Card>
        <Card title="Account Summary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Member since</span>
              <span>{p?.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Memorials</span>
              <span>{funerals.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Contributions</span>
              <span>{contributions.length}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 28 }}>
        <Widget icon="dove" value={funerals.length} label="Memorials Created" />
        <Widget icon="money" value={contributions.length} label="Contributions Made" />
        <Widget icon="heart" value={`KES ${Number(totalContributions).toLocaleString()}`} label="Total Donated" />
      </div>

      <div className="grid grid-2">
        <Card title={<><Icon name="dove" /> My Memorials</>}>
          {funerals.length === 0 ? (
            <EmptyState icon="dove" message="No memorials created yet" action={<Link to="/funerals/new" className="btn btn-primary btn-sm">Create Memorial</Link>} />
          ) : (
            funerals.slice(0, 5).map(f => (
              <div key={f.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{f.deceased_name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.funeral_date ? new Date(f.funeral_date).toLocaleDateString() : 'Date TBD'}</div>
                </div>
                <span className={`badge badge-${f.status === 'active' ? 'active' : 'inactive'}`}>{f.status}</span>
              </div>
            ))
          )}
        </Card>

        <Card title={<><Icon name="money" /> Recent Contributions</>}>
          {contributions.length === 0 ? (
            <EmptyState icon="money" message="No contributions yet" />
          ) : (
            contributions.slice(0, 5).map(c => (
              <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{c.deceased_name || 'Memorial'}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {c.is_anonymous ? 'Anonymous' : c.contributor_name} • {c.payment_method}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--success)' }}>KES {Number(c.amount).toLocaleString()}</div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  )
}
