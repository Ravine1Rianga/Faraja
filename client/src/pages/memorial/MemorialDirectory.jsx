import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as funeralsApi from '../../api/funerals'
import Icon from '../../components/ui/Icon'

export default function MemorialDirectory() {
  const [funerals, setFunerals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    funeralsApi.getActiveFunerals().then(({ data }) => {
      setFunerals(data.funerals || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = funerals.filter(f => {
    if (!search) return true
    const q = search.toLowerCase()
    return (f.deceased_name || '').toLowerCase().includes(q)
  })

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>Loading memorials...</div>

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <h1 className="page-title">Memorial Directory</h1>
        <p className="page-subtitle">Browse public memorials and leave your condolences</p>
      </div>

      <div style={{ marginBottom: 28 }}>
        <input type="text" className="form-control" placeholder="Search by name..." style={{ maxWidth: 400 }}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Icon name="dove" size={48} /></div>
          <h4>No memorials found</h4>
          <p style={{ color: 'var(--text-muted)' }}>{search ? 'Try a different name' : 'No public memorials available yet'}</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map(f => {
            const birth = f.date_of_birth ? new Date(f.date_of_birth).getFullYear() : '?'
            const death = f.date_of_death ? new Date(f.date_of_death).getFullYear() : '?'
            return (
              <Link key={f.id} to={`/memorial/${f.id}`} className="funeral-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <div className="funeral-card-image" style={f.photo ? { backgroundImage: `url(${f.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                  {!f.photo && <Icon name="dove" size={36} />}
                  {f.privacy === 'private' && (
                    <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'var(--gold)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="lock" size={12} /> Private
                    </span>
                  )}
                </div>
                <div className="funeral-card-body">
                  <div className="funeral-card-name">{f.deceased_name}</div>
                  <div className="funeral-card-dates">{birth} – {death}</div>
                  {f.funeral_date && (
                    <div className="funeral-card-dates" style={{ marginBottom: 0 }}>
                      <Icon name="calendar" size={12} /> {formatDate(f.funeral_date)}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
