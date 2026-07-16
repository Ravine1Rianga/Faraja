import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as funeralsApi from '../../api/funerals'
import * as membersApi from '../../api/members'
import Icon from '../../components/ui/Icon'
import * as condolencesApi from '../../api/condolences'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function Memorial() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { id } = useParams()
  const [memorial, setMemorial] = useState(null)
  const [condolences, setCondolences] = useState([])
  const [loading, setLoading] = useState(true)
  const [condForm, setCondForm] = useState({ name: '', email: '', message: '', relationship: '' })
  const [submitting, setSubmitting] = useState(false)
  const [joinForm, setJoinForm] = useState({ name: '', email: '', phone: '' })
  const [joinStatus, setJoinStatus] = useState(null)
  const [joinLoading, setJoinLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    funeralsApi.getPublicMemorial(id).then(({ data }) => {
      setMemorial(data.memorial || data)
    }).catch(() => {}).finally(() => setLoading(false))
    condolencesApi.getCondolences(id).then(({ data }) => {
      setCondolences(data.condolences || [])
    }).catch(() => {})
  }, [id])

  const submitCondolence = async (e) => {
    e.preventDefault()
    if (!condForm.message.trim()) return
    setSubmitting(true)
    try {
      await condolencesApi.saveCondolence({ ...condForm, funeralId: id })
      setCondForm({ name: '', email: '', message: '', relationship: '' })
      const { data } = await condolencesApi.getCondolences(id)
      setCondolences(data.condolences || [])
    } catch (err) { /* ignore */ } finally { setSubmitting(false) }
  }

  const submitJoin = async (e) => {
    e.preventDefault()
    if (!joinForm.name.trim()) return
    setJoinLoading(true)
    try {
      const res = await membersApi.requestJoin(id, joinForm)
      setJoinStatus(res.data.member?.status || 'pending')
      showToast('Join request sent successfully', 'success')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send request'
      if (msg.includes('already')) setJoinStatus('exists')
      showToast(msg, 'error')
    } finally { setJoinLoading(false) }
  }

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>Loading memorial...</div>
  if (!memorial) return <div style={{ padding: 80, textAlign: 'center' }}><h2>Memorial not found</h2><Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Go Home</Link></div>

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const birth = memorial.date_of_birth ? new Date(memorial.date_of_birth).getFullYear() : '?'
  const death = memorial.date_of_death ? new Date(memorial.date_of_death).getFullYear() : '?'

  const shareText = `In loving memory of ${memorial.deceased_name}\n\n${window.location.href}`

  return (
    <>
      <div className="memorial-hero">
        {memorial.photo && <div className="memorial-hero-bg" style={{ backgroundImage: `url(${memorial.photo})` }} />}
        <div className="memorial-hero-content">
          <div className="memorial-avatar" style={memorial.photo ? { backgroundImage: `url(${memorial.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {!memorial.photo && <Icon name="dove" size={48} />}
          </div>
          <div className="memorial-name">{memorial.deceased_name}</div>
          <div className="memorial-dates">{birth} – {death}</div>
          {memorial.tier && memorial.tier !== 'free' && (
            <span className="memorial-tier-badge tier-premium"><Icon name="star" size={14} /> {memorial.tier.toUpperCase()}</span>
          )}
        </div>
      </div>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 60px' }}>
        {memorial.biography && (
          <div className="memorial-section">
            <div className="memorial-section-title"><Icon name="book-open" /> Biography</div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{memorial.biography}</p>
          </div>
        )}

        <div className="memorial-section">
          <div className="memorial-section-title"><Icon name="clipboard-list" /> Service Details</div>
          {[
            memorial.funeral_date && { icon: 'calendar', label: 'Date', val: formatDate(memorial.funeral_date) },
            memorial.funeral_time && { icon: 'clock', label: 'Time', val: memorial.funeral_time },
            memorial.venue && { icon: 'map-pin', label: 'Venue', val: memorial.venue },
            memorial.burial_site && { icon: 'map-pin', label: 'Burial', val: memorial.burial_site },
            memorial.officiant && { icon: 'church', label: 'Officiant', val: memorial.officiant },
          ].filter(Boolean).map((item, i) => (
            <div key={i} className="service-line">
              <div className="service-line-icon"><Icon name={item.icon} size={16} /></div>
              <div className="service-line-label">{item.label}</div>
              <div>{item.val}</div>
            </div>
          ))}
        </div>

        {memorial.order_of_service && (
          <div className="memorial-section">
            <div className="memorial-section-title"><Icon name="file-text" /> Order of Service</div>
            <div id="orderContent" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              {(() => {
                try {
                  const order = typeof memorial.order_of_service === 'string' ? JSON.parse(memorial.order_of_service) : memorial.order_of_service
                  if (order?.events?.length) {
                    const iconMap = { hymn: 'music', prayer: 'church', reading: 'book-open', eulogy: 'message-circle', tribute: 'sparkles', speech: 'mic', music: 'music', ritual: 'candle', announcement: 'volume-2', closing: 'check', general: 'file-text' }
                    return order.events.map((e, i) => (
                      <div key={i} className="service-line">
                        <div className="service-line-icon"><Icon name={iconMap[e.type] || 'file-text'} size={16} /></div>
                        <div style={{ minWidth: 50, fontWeight: 600, color: 'var(--gold)', fontSize: '0.85rem' }}>{e.time || '—'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.title}</div>
                          {e.person && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By: {e.person}</div>}
                        </div>
                      </div>
                    ))
                  }
                  return <p style={{ color: 'var(--text-muted)' }}>{memorial.order_of_service}</p>
                } catch { return <p style={{ color: 'var(--text-muted)' }}>{memorial.order_of_service}</p> }
              })()}
            </div>
          </div>
        )}

        {memorial.livestream_url && (
          <div className="memorial-section">
            <div className="memorial-section-title"><Icon name="film" /> Livestream</div>
            <iframe src={memorial.livestream_url.replace('watch?v=', 'embed/')}
              style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, border: 'none' }} allowFullScreen />
          </div>
        )}

        {memorial.galleryPhotos?.length > 0 && (
          <div className="memorial-section">
            <div className="memorial-section-title"><Icon name="image" /> Gallery</div>
            <div className="gallery-grid">
              {memorial.galleryPhotos.map((url, i) => (
                <img key={i} src={url} alt="Gallery" onClick={() => window.open(url, '_blank')} />
              ))}
            </div>
          </div>
        )}

        {memorial.privacy === 'private' && (
          <div className="memorial-section">
            <div className="memorial-section-title"><Icon name="lock" /> Private Memorial</div>
            {!user ? (
              <div style={{ padding: 16, background: 'var(--charcoal-3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <p style={{ marginBottom: 12 }}>This is a private memorial. Sign in to request access.</p>
                <Link to={`/login?redirect=/memorial/${id}`} className="btn btn-primary btn-sm">Sign In</Link>
              </div>
            ) : joinStatus === 'approved' ? (
              <div className="alert alert-success"><Icon name="check-circle" size={18} /> You are a member of this memorial</div>
            ) : joinStatus === 'pending' ? (
              <div className="alert alert-warning"><Icon name="clock" size={18} /> Your join request is pending approval</div>
            ) : joinStatus === 'exists' ? (
              <div className="alert alert-info"><Icon name="info" size={18} /> A request already exists for this name or email</div>
            ) : (
              <form onSubmit={submitJoin} style={{ padding: 16, background: 'var(--charcoal-3)', borderRadius: 'var(--radius)' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  This memorial is private. Request access from the family.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <input type="text" className="form-control" placeholder="Your name *" required
                    value={joinForm.name} onChange={e => setJoinForm(p => ({ ...p, name: e.target.value }))} />
                  <input type="email" className="form-control" placeholder="Your email"
                    value={joinForm.email} onChange={e => setJoinForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <input type="tel" className="form-control" placeholder="Phone number (optional)" style={{ marginBottom: 12 }}
                  value={joinForm.phone} onChange={e => setJoinForm(p => ({ ...p, phone: e.target.value }))} />
                <button type="submit" className="btn btn-primary btn-sm" disabled={joinLoading}>
                  <Icon name="lock" /> {joinLoading ? 'Sending...' : 'Request Access'}
                </button>
              </form>
            )}
          </div>
        )}

        {memorial.id && (
          <div className="donate-cta">
            <h3><Icon name="heart" style={{ color: 'var(--success)' }} /> Support the Family</h3>
            <p>Your contribution helps cover funeral expenses and supports the bereaved family.</p>
            <Link to={`/donate/${memorial.id}`} className="btn btn-primary btn-lg">Contribute Now</Link>
          </div>
        )}

        <div className="memorial-section">
          <div className="memorial-section-title"><Icon name="share-2" /> Share This Memorial</div>
          <div className="share-panel">
            <button className="share-btn share-btn-whatsapp" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')}><Icon name="message-circle" /> WhatsApp</button>
            <button className="share-btn share-btn-copy" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!') }}><Icon name="link" /> Copy Link</button>
          </div>
        </div>

        <div className="memorial-section">
          <div className="memorial-section-title"><Icon name="message-circle" /> Condolence Wall ({condolences.length})</div>
          <div style={{ marginBottom: 20, padding: 16, background: 'var(--charcoal-3)', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>Leave a message of comfort for the family.</p>
            <form onSubmit={submitCondolence}>
              <textarea className="form-control" rows={3} placeholder="Your message of condolence..." style={{ marginBottom: 10 }}
                value={condForm.message} onChange={e => setCondForm(prev => ({ ...prev, message: e.target.value }))} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input type="text" className="form-control" placeholder="Your name (optional)" value={condForm.name} onChange={e => setCondForm(prev => ({ ...prev, name: e.target.value }))} />
                <input type="email" className="form-control" placeholder="Your email (optional)" value={condForm.email} onChange={e => setCondForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <input type="text" className="form-control" placeholder="Relationship to the deceased (optional)" style={{ marginBottom: 10 }}
                value={condForm.relationship} onChange={e => setCondForm(prev => ({ ...prev, relationship: e.target.value }))} />
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}><Icon name="message-circle" /> Leave Message</button>
            </form>
          </div>

          {condolences.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No messages yet. Be the first to leave a condolence.</div>
          ) : (
            condolences.map(c => (
              <div key={c.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{c.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {c.relationship} · {new Date(c.created_at).toLocaleDateString('en-KE')}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{c.message}</p>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: 'center', padding: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}><Icon name="printer" /> Print This Page</button>
        </div>
      </main>
    </>
  )
}
