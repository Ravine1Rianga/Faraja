import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useActiveFuneral } from '../../contexts/FuneralContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Widget from '../../components/ui/Widget'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/ui/Icon'
import * as funeralsApi from '../../api/funerals'
import * as membersApi from '../../api/members'

export default function FuneralDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { activeFuneralId, setActiveFuneral, clearActiveFuneral } = useActiveFuneral()
  const navigate = useNavigate()
  const [funerals, setFunerals] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joinRequests, setJoinRequests] = useState([])
  const [members, setMembers] = useState([])

  useEffect(() => {
    funeralsApi.getFunerals().then(({ data }) => {
      setFunerals(data.funerals || [])
      if (!activeFuneralId && data.funerals?.length) {
        setActiveFuneral(data.funerals[0].id)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeFuneralId) {
      funeralsApi.getDashboard(activeFuneralId).then(({ data }) => setDashboard(data)).catch(() => {})
      membersApi.getJoinRequests(activeFuneralId).then(({ data }) => setJoinRequests(data.requests || [])).catch(() => {})
      membersApi.getMembers(activeFuneralId).then(({ data }) => setMembers(data.members || [])).catch(() => {})
    }
  }, [activeFuneralId])

  const handleMemberStatus = async (memberId, status) => {
    try {
      await membersApi.updateMemberStatus(activeFuneralId, memberId, status)
      showToast(`Member ${status}`, 'success')
      membersApi.getJoinRequests(activeFuneralId).then(({ data }) => setJoinRequests(data.requests || [])).catch(() => {})
      membersApi.getMembers(activeFuneralId).then(({ data }) => setMembers(data.members || [])).catch(() => {})
    } catch { showToast('Failed to update status', 'error') }
  }

  const handleRemoveMember = async (memberId) => {
    try {
      await membersApi.removeMember(activeFuneralId, memberId)
      showToast('Member removed', 'success')
      setMembers(prev => prev.filter(m => String(m.id) !== String(memberId)))
    } catch { showToast('Failed to remove member', 'error') }
  }

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>

  const stats = dashboard?.stats || {}
  const activeFuneral = funerals.find(f => String(f.id) === String(activeFuneralId))

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Funeral Dashboard</h1>
          <p className="page-subtitle">
            {activeFuneral
              ? `Managing: ${activeFuneral.deceased_name || activeFuneral.deceasedName}`
              : funerals.length > 0 ? 'Select a memorial to manage' : 'Create your first memorial'}
          </p>
        </div>
      </div>

      {funerals.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: 8 }}>Active Memorial:</label>
          <select className="form-control" style={{ width: 280, display: 'inline-block' }}
            value={activeFuneralId || ''} onChange={e => setActiveFuneral(e.target.value)}>
            {funerals.map(f => (
              <option key={f.id} value={f.id}>{f.deceased_name || f.deceasedName}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        <Widget icon="money" value={dashboard?.raised || stats.raised || 'KES 0'} label="Total Raised" />
        <Widget icon="users" value={stats.contributors || 0} label="Contributors" />
        <Widget icon="check" value={stats.completedTasks || 0} label="Tasks Done" />
        <Widget icon="calendar" value={stats.daysUntil || '-'} label="Days Until" />
      </div>

      <div className="quick-actions" style={{ marginBottom: 28 }}>
        <Link to="/committee" className="quick-action"><span className="quick-action-icon"><Icon name="users" /></span>Committee</Link>
        <Link to="/tasks" className="quick-action"><span className="quick-action-icon"><Icon name="check" /></span>Tasks</Link>
        <Link to="/vendors" className="quick-action"><span className="quick-action-icon"><Icon name="store" /></span>Vendors</Link>
        <Link to="/order-of-service" className="quick-action"><span className="quick-action-icon"><Icon name="file-text" /></span>Order of Service</Link>
        <Link to="/financials" className="quick-action"><span className="quick-action-icon"><Icon name="chart" /></span>Financials</Link>
        <Link to={activeFuneralId ? `/donate/${activeFuneralId}` : '#'} className="quick-action" style={activeFuneralId ? {} : { opacity: 0.4, pointerEvents: 'none' }}>
          <span className="quick-action-icon"><Icon name="heart" /></span>Contribute
        </Link>
      </div>

      <div className="grid grid-2">
        <Card title="Upcoming Tasks">
          {stats.upcomingTasks?.length > 0 ? stats.upcomingTasks.map((t, i) => (
            <div key={i} className="task-mini">
              <div className="task-mini-check"></div>
              <div className="task-mini-title">{t.title}</div>
              <div className="task-mini-due">{t.due_date || t.dueDate || ''}</div>
            </div>
          )) : <EmptyState icon="check" message="All caught up!" />}
        </Card>

        <Card title="Top Contributors">
          {dashboard?.topContributors?.length > 0 ? dashboard.topContributors.map((c, i) => (
            <div key={i} className="leaderboard-item">
              <div className={`leaderboard-rank${i < 3 ? [' gold', ' silver', ' bronze'][i] : ''}`}>{i + 1}</div>
              <div className="leaderboard-info">
                <div className="leaderboard-name">{c.name || c.donor_name}</div>
                <div className="leaderboard-method">{c.payment_method || c.method}</div>
              </div>
                <div className="leaderboard-amount">KES {Number(c.total_amount || c.amount || 0).toLocaleString()}</div>
            </div>
          )) : <EmptyState icon="money" message="No contributions yet" />}
        </Card>
      </div>

      <div className="funeral-grid" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16 }}>My Memorials</h3>
        <div className="grid grid-3">
          {funerals.map(f => (
            <div key={f.id} className={`funeral-card${String(f.id) === String(activeFuneralId) ? ' active' : ''}`}
              onClick={() => setActiveFuneral(f.id)} style={{ cursor: 'pointer' }}>
              {f.photo && <div className="funeral-card-image" style={{ backgroundImage: `url(${f.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
              <div className="funeral-card-body">
                <div className="funeral-card-name">{f.deceased_name || f.deceasedName}</div>
                <div className="funeral-card-dates">{f.funeral_date ? new Date(f.funeral_date).toLocaleDateString() : ''}</div>
                <div className="funeral-card-footer">
                  <span>KES {Number(f.raised || f.fundraising_goal || 0).toLocaleString()}</span>
                  <span className="badge badge-active">{f.status || 'active'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeFuneralId && (
        <div className="grid grid-2" style={{ marginTop: 32 }}>
          <Card title={`Join Requests (${joinRequests.length})`}>
            {joinRequests.length === 0 ? (
              <EmptyState icon="users" message="No pending requests" />
            ) : (
              joinRequests.map(r => (
                <div key={r.id} className="activity-item">
                  <div className="activity-dot" style={{ background: 'var(--warning)', width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 5 }} />
                  <div className="activity-content" style={{ flex: 1 }}>
                    <div className="activity-text"><strong>{r.name}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {r.email && <span>{r.email} · </span>}{r.phone && <span>{r.phone} · </span>}
                      {new Date(r.created_at).toLocaleDateString('en-KE')}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleMemberStatus(r.id, 'approved')}><Icon name="check" size={14} /> Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleMemberStatus(r.id, 'rejected')}><Icon name="x" size={14} /> Reject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>

          <Card title={`Community Roster (${members.length})`}>
            {members.length === 0 ? (
              <EmptyState icon="users" message="No members yet" />
            ) : (
              members.map(m => (
                <div key={m.id} className="activity-item">
                  <div className="avatar avatar-sm" style={{ background: 'var(--charcoal-4)', color: 'var(--gold)', fontSize: '0.75rem' }}>
                    {m.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="activity-content" style={{ flex: 1 }}>
                    <div className="activity-text"><strong>{m.name}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {m.email && <span>{m.email} · </span>}
                      {m.phone && <span>{m.phone} · </span>}
                      <span className="badge badge-active">approved</span>
                    </div>
                  </div>
                  <button className="btn-icon danger" title="Remove member" onClick={() => handleRemoveMember(m.id)}>
                    <Icon name="trash-2" size={14} />
                  </button>
                </div>
              ))
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
