import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useActiveFuneral } from '../../contexts/FuneralContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/ui/Icon'
import * as vendorsApi from '../../api/vendors'
import * as reviewsApi from '../../api/reviews'
import * as bookingsApi from '../../api/bookings'
import * as funeralsApi from '../../api/funerals'

export default function VendorDetail() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { activeFuneralId } = useActiveFuneral()
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  // Booking
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingProduct, setBookingProduct] = useState(null)
  const [myFunerals, setMyFunerals] = useState([])
  const [bookingForm, setBookingForm] = useState({ funeralId: '', serviceDate: '', notes: '' })
  const [submittingBooking, setSubmittingBooking] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      vendorsApi.getVendor(id).then(({ data }) => setVendor(data.vendor || data)).catch(() => {}),
      vendorsApi.getVendorProducts(id).then(({ data }) => setProducts(data.products || [])).catch(() => {}),
      reviewsApi.getVendorReviews(id).then(({ data }) => {
        setReviews(data.reviews || [])
      }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user) return
    funeralsApi.getFunerals().then(({ data }) => {
      setMyFunerals(data.funerals || [])
      if (activeFuneralId) setBookingForm(f => ({ ...f, funeralId: activeFuneralId }))
    }).catch(() => {})
  }, [user])

  const openBooking = (product) => {
    setBookingProduct(product)
    setBookingForm({
      funeralId: activeFuneralId || (myFunerals[0]?.id || ''),
      serviceDate: '',
      notes: '',
    })
    setShowBookingModal(true)
  }

  const submitBooking = async () => {
    if (!bookingForm.funeralId) { showToast('Please select a memorial', 'error'); return }
    setSubmittingBooking(true)
    try {
      await bookingsApi.createBooking({
        funeralId: Number(bookingForm.funeralId),
        vendorId: Number(id),
        productId: bookingProduct.id,
        amount: Number(bookingProduct.price),
        serviceDate: bookingForm.serviceDate || undefined,
        notes: bookingForm.notes || undefined,
      })
      showToast('Booking request sent!', 'success')
      setShowBookingModal(false)
      setBookingProduct(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed', 'error')
    } finally { setSubmittingBooking(false) }
  }

  const submitReview = async () => {
    try {
      await reviewsApi.createReview({ vendorId: id, rating: reviewForm.rating, comment: reviewForm.comment })
      alert('Review submitted!')
      const { data } = await reviewsApi.getVendorReviews(id)
      setReviews(data.reviews || [])
      setReviewForm({ rating: 5, comment: '' })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review')
    }
  }

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading vendor...</div>
  if (!vendor) return <div className="container" style={{ padding: 40 }}><EmptyState icon="store" message="Vendor not found" action={<Button onClick={() => navigate('/vendors')}>Back to Directory</Button>} /></div>

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="breadcrumb" style={{ marginBottom: 16 }}>
        <a href="/vendors" onClick={e => { e.preventDefault(); navigate('/vendors') }}>Vendor Directory</a>
        <span className="breadcrumb-sep">›</span>
        <span>{vendor.business_name}</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card title={<><Icon name="file-text" /> Business Info</>}>
          {vendor.photo && (
            <div style={{ marginBottom: 12 }}>
              <img src={vendor.photo} alt="" style={{ width: '100%', height: 180, borderRadius: 8, objectFit: 'cover' }} />
            </div>
          )}
          <p><strong>Category:</strong> <span className="cat-chip">{vendor.category}</span></p>
          <p><strong>Location:</strong> {vendor.location}</p>
          <p><strong>Phone:</strong> {vendor.phone}</p>
          <p><strong>Email:</strong> {vendor.email}</p>
          {vendor.description && <p><strong>About:</strong> {vendor.description}</p>}
          <p><strong>Rating:</strong> <Icon name="star" size={14} /> {vendor.rating || '0.0'}</p>
          {vendor.verified ? <span className="badge badge-verified">Verified</span> : <span className="badge badge-pending">Pending Verification</span>}
        </Card>

        <Card title={<><Icon name="package" /> Products & Services</>}>
          {products.length === 0 ? <EmptyState icon="package" message="No products listed yet" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {products.map(p => (
                <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {p.image_url
                    ? <div style={{ height: 120, background: `url(${p.image_url}) center/cover no-repeat` }} />
                    : <div style={{ height: 120, background: 'var(--charcoal-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="package" size={28} style={{ opacity: 0.3 }} />
                      </div>
                  }
                  <div style={{ padding: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{p.category}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>KES {Number(p.price).toLocaleString()}</div>
                      {p.stock === 0 ? <span className="badge badge-inactive" style={{ fontSize: '0.7rem' }}>Out of Stock</span> : <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>{p.stock} in stock</span>}
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 8 }}
                      onClick={() => openBooking(p)} disabled={p.stock === 0}>
                      <Icon name="credit-card" size={14} /> Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header"><div className="card-title"><Icon name="star" /> Reviews</div></div>
        <div style={{ padding: '16px 0' }}>
          <h4>Leave a Review</h4>
          <div style={{ display: 'flex', gap: 4, margin: '8px 0' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <span key={n} onClick={() => setReviewForm(prev => ({ ...prev, rating: n }))} style={{ cursor: 'pointer' }}>
                <Icon name="star" size={22} fill={n <= reviewForm.rating ? 'var(--gold)' : 'none'} color={n <= reviewForm.rating ? 'var(--gold)' : 'var(--border-light)'} />
              </span>
            ))}
          </div>
          <textarea className="form-control" rows={2} placeholder="Share your experience..." value={reviewForm.comment}
            onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} style={{ marginBottom: 8 }} />
          <Button onClick={submitReview}>Submit Review</Button>
        </div>

        <div>
          {reviews.length === 0 ? <EmptyState icon="message-circle" message="No reviews yet" /> : reviews.map(r => (
            <div key={r.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong>{r.user_name || 'Anonymous'}</strong>
                <span style={{ color: 'var(--gold)' }}>{Array.from({ length: 5 }, (_, i) => <Icon key={i} name="star" size={14} fill={i < r.rating ? 'var(--gold)' : 'none'} color='var(--gold)' />)}</span>
              </div>
              {r.comment && <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} title={bookingProduct ? `Book: ${bookingProduct.name}` : 'Book Product'}>
        {!user ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>You need to be signed in to book a product.</p>
            <Button onClick={() => { setShowBookingModal(false); navigate('/login') }}>Sign In</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Memorial *</label>
              {myFunerals.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No memorials found.{' '}
                  <a href="/funerals/new" onClick={e => { e.preventDefault(); navigate('/funerals/new') }} style={{ color: 'var(--gold)' }}>
                    Create one
                  </a>
                </p>
              ) : (
                <select className="form-control" value={bookingForm.funeralId}
                  onChange={e => setBookingForm(f => ({ ...f, funeralId: e.target.value }))}>
                  <option value="">Select a memorial</option>
                  {myFunerals.map(f => (
                    <option key={f.id} value={f.id}>{f.deceased_name || f.deceasedName}</option>
                  ))}
                </select>
              )}
            </div>
            {bookingProduct && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--charcoal-3)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{bookingProduct.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bookingProduct.category}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1rem' }}>KES {Number(bookingProduct.price).toLocaleString()}</div>
              </div>
            )}
            <div>
              <label className="form-label">Service Date (optional)</label>
              <input type="date" className="form-control" value={bookingForm.serviceDate}
                onChange={e => setBookingForm(f => ({ ...f, serviceDate: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-control" rows={2} value={bookingForm.notes}
                onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any special requests or details..." />
            </div>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setShowBookingModal(false)}>Cancel</Button>
              <Button onClick={submitBooking} loading={submittingBooking} disabled={!bookingForm.funeralId || myFunerals.length === 0}>
                <Icon name="check" size={14} /> Send Booking Request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
