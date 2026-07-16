import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/ui/Card'
import DataTable from '../../components/ui/DataTable'
import Icon from '../../components/ui/Icon'
import * as usersApi from '../../api/users'
import * as vendorsApi from '../../api/vendors'

export default function AdminDashboard() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/dashboard" />

  const [tab, setTab] = useState('metrics')
  const [metrics, setMetrics] = useState(null)
  const [users, setUsers] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      usersApi.getAdminMetrics().then(r => setMetrics(r.data)).catch(() => {}),
      usersApi.getAllUsers().then(r => setUsers(r.data.users || [])).catch(() => {}),
      vendorsApi.getMyVendors().then(r => setVendors(r.data.vendors || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id, status) => {
    try {
      await vendorsApi.updateVendor(id, { status, verified: status === 'active' ? 1 : 0 })
      const r = await vendorsApi.getMyVendors()
      setVendors(r.data.vendors || [])
    } catch (err) { alert(err.response?.data?.message || 'Failed to update vendor') }
  }

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Platform-wide management and moderation</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['metrics', 'users', 'vendors'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setTab(t)}>
            {t === 'metrics' ? <><Icon name="chart" /> Metrics</> : t === 'users' ? <><Icon name="users" /> Users</> : <><Icon name="store" /> Vendors</>}
          </button>
        ))}
      </div>

      {tab === 'metrics' && (
        <div className="grid grid-4">
          <Card><div className="widget-value">{metrics?.totalMemorials || 0}</div><div className="widget-label">Memorials</div></Card>
          <Card><div className="widget-value">{metrics?.totalUsers || 0}</div><div className="widget-label">Users</div></Card>
          <Card><div className="widget-value">{metrics?.totalVendors || 0}</div><div className="widget-label">Vendors</div></Card>
          <Card><div className="widget-value">KES {Number(metrics?.totalRaised || 0).toLocaleString()}</div><div className="widget-label">Total Raised</div></Card>
        </div>
      )}

      {tab === 'users' && (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: '50px' },
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role_name', label: 'Role', render: (r) => <span className={`badge badge-${r.role_name || 'family'}`}>{r.role_name || 'family'}</span> },
            { key: 'is_active', label: 'Status', render: (r) => <span className={`badge badge-${r.is_active ? 'active' : 'inactive'}`}>{r.is_active ? 'Active' : 'Inactive'}</span> },
          ]}
          rows={users}
          emptyMessage="No users found"
        />
      )}

      {tab === 'vendors' && (
        <DataTable
          columns={[
            { key: 'business_name', label: 'Business' },
            { key: 'category', label: 'Category', render: (r) => <span className="cat-chip">{r.category}</span> },
            { key: 'location', label: 'Location' },
            { key: 'verified', label: 'Verified', render: (r) => r.verified ? <span className="badge badge-verified">Yes</span> : <span className="badge badge-pending">No</span> },
            { key: 'status', label: 'Status', render: (r) => <span className={`badge badge-${r.status === 'active' ? 'active' : 'pending'}`}>{r.status}</span> },
            { key: 'actions', label: 'Actions', render: (r) => (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm btn-primary" onClick={() => handleApprove(r.id, 'active')}><Icon name="check" /> Approve</button>
                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => handleApprove(r.id, 'suspended')}><Icon name="shield-alert" /> Suspend</button>
              </div>
            )},
          ]}
          rows={vendors}
          emptyMessage="No vendors found"
        />
      )}
    </div>
  )
}
