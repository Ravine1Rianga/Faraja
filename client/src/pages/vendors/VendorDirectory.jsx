import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/ui/Icon'
import * as vendorsApi from '../../api/vendors'

export default function VendorDirectory() {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    vendorsApi.getActiveVendors().then(({ data }) => setVendors(data.vendors || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = vendors.filter(v =>
    !search || v.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.category?.toLowerCase().includes(search.toLowerCase()) ||
    v.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Vendor Directory</h1>
          <p className="page-subtitle">Browse and book trusted funeral service providers</p>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: 24 }}>
        <span className="search-bar-icon"><Icon name="search" /></span>
        <input type="text" placeholder="Search by name, category, or location..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading vendors...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="store" message="No vendors found" />
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {filtered.map(v => (
            <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate('/vendors/' + v.id)}>
              <div style={{
                height: 160, background: v.photo
                  ? `url(${v.photo}) center/cover no-repeat`
                  : 'linear-gradient(135deg, var(--charcoal-3), var(--charcoal-4))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!v.photo && <Icon name="store" size={40} style={{ opacity: 0.3 }} />}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.business_name}</div>
                  {v.verified && <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>Verified</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span className="cat-chip" style={{ fontSize: '0.75rem' }}>{v.category}</span>
                  {v.location && <span style={{ marginLeft: 8 }}><Icon name="map-pin" size={12} /> {v.location}</span>}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {v.description || 'No description available'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                  <Icon name="star" size={14} fill="var(--gold)" color="var(--gold)" />
                  <span style={{ fontWeight: 600 }}>{v.rating || '0.0'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
