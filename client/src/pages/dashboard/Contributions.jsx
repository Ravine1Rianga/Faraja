import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useActiveFuneral } from '../../contexts/FuneralContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Widget from '../../components/ui/Widget'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/ui/Icon'
import * as donationsApi from '../../api/donations'

export default function Contributions() {
  const { activeFuneralId } = useActiveFuneral()
  const { showToast } = useToast()
  const [contributions, setContributions] = useState([])
  const [stats, setStats] = useState({ total: 0, count: 0, totalFees: 0 })
  const [loading, setLoading] = useState(true)

  if (!activeFuneralId) return <Navigate to="/dashboard" />

  useEffect(() => {
    setLoading(true)
    donationsApi.getFuneralDonations(activeFuneralId).then(({ data }) => {
      setContributions(data.contributions || [])
      setStats({ total: data.total || 0, count: data.count || 0, totalFees: data.totalFees || 0 })
    }).catch(() => showToast('Failed to load contributions', 'error')).finally(() => setLoading(false))
  }, [activeFuneralId])

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Contributions</h1>
          <p className="page-subtitle">View and manage all harambee contributions for the memorial fund.</p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 28 }}>
        <Widget icon="money" value={`KES ${Number(stats.total).toLocaleString()}`} label="Total Raised" />
        <Widget icon="users" value={stats.count} label="Contributions" />
        <Widget icon="chart" value={`KES ${Number(stats.totalFees).toLocaleString()}`} label="Platform Fees" />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading contributions...</div>
      ) : contributions.length === 0 ? (
        <EmptyState icon="money" message="No confirmed contributions yet" action={<Link to={`/donate/${activeFuneralId}`} className="btn btn-primary">Share Donation Link</Link>} />
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Message</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.is_anonymous ? 'Anonymous' : c.donor_name}</strong>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>KES {Number(c.amount).toLocaleString()}</td>
                    <td><span className="cat-chip">{c.payment_method}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {c.message || '-'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.mpesa_ref || c.transaction_id || '-'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            Total: <strong style={{ color: 'var(--success)' }}>KES {Number(stats.total).toLocaleString()}</strong>
            {stats.totalFees > 0 && ` (fees: KES ${Number(stats.totalFees).toLocaleString()})`}
          </div>
        </Card>
      )}
    </div>
  )
}
