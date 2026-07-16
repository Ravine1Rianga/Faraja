import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Widget from '../../components/ui/Widget'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Icon from '../../components/ui/Icon'
import * as vendorsApi from '../../api/vendors'
import * as bookingsApi from '../../api/bookings'

const categories = ['Coffins', 'Transport', 'Catering', 'Flowers', 'Printing', 'Venue', 'Music', 'Clothing', 'Other']
const defaultProductForm = { name: '', category: '', price: '', stock: '', description: '', status: 'active' }
const bookingStatuses = ['requested', 'confirmed', 'completed', 'cancelled']

export default function VendorDashboard() {
  const { isVendor } = useAuth()
  const { showToast } = useToast()
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('products')

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState(defaultProductForm)
  const [productPhoto, setProductPhoto] = useState(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState(null)

  // Vendor edit modal
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [vendorForm, setVendorForm] = useState({ businessName: '', category: '', location: '', phone: '', email: '', description: '' })
  const [vendorPhoto, setVendorPhoto] = useState(null)
  const [savingVendor, setSavingVendor] = useState(false)

  if (!isVendor) return <Navigate to="/dashboard" />

  const fetchData = async () => {
    setLoading(true)
    try {
      const vRes = await vendorsApi.getMyVendorProfile()
      const v = vRes.data.vendor
      setVendor(v)
      setVendorForm({
        businessName: v.business_name || '',
        category: v.category || '',
        location: v.location || '',
        phone: v.phone || '',
        email: v.email || '',
        description: v.description || '',
      })
      setVendorPhoto(null)
      const [pRes, bRes] = await Promise.all([
        vendorsApi.getVendorProducts(v.id).catch(() => ({ data: { products: [] } })),
        bookingsApi.getMyVendorBookings().catch(() => ({ data: { bookings: [] } })),
      ])
      setProducts(pRes.data.products || [])
      setBookings(bRes.data.bookings || [])
    } catch (err) {
      if (err.response?.status === 404) setVendor(null)
      else showToast('Failed to load vendor data', 'error')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  // Product CRUD
  const openAddProduct = () => { setEditingProduct(null); setProductForm(defaultProductForm); setProductPhoto(null); setShowProductModal(true) }
  const openEditProduct = (p) => {
    setEditingProduct(p)
    setProductPhoto(null)
    setProductForm({
      name: p.name, category: p.category || '', price: p.price, stock: p.stock,
      description: p.description || '', status: p.status || 'active',
    })
    setShowProductModal(true)
  }

  const saveProduct = async () => {
    if (!productForm.name) { showToast('Product name is required', 'error'); return }
    setSavingProduct(true)
    try {
      const payload = productPhoto
        ? (() => { const fd = new FormData(); Object.entries(productForm).forEach(([k, v]) => fd.append(k, v)); fd.append('photo', productPhoto); return fd })()
        : productForm
      if (editingProduct) {
        await vendorsApi.updateProduct(vendor.id, editingProduct.id, payload)
        showToast('Product updated', 'success')
      } else {
        await vendorsApi.saveProduct(vendor.id, payload)
        showToast('Product created', 'success')
      }
      setShowProductModal(false)
      setProductPhoto(null)
      const { data } = await vendorsApi.getVendorProducts(vendor.id)
      setProducts(data.products || [])
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save product', 'error') }
    finally { setSavingProduct(false) }
  }

  const deleteProduct = async () => {
    if (!deletingProduct) return
    try {
      await vendorsApi.deleteProduct(vendor.id, deletingProduct.id)
      showToast('Product deleted', 'success')
      setDeletingProduct(null)
      setProducts(p => p.filter(x => x.id !== deletingProduct.id))
    } catch (_) { showToast('Failed to delete', 'error') }
  }

  // Vendor profile update
  const saveVendorProfile = async () => {
    setSavingVendor(true)
    try {
      const payload = vendorPhoto
        ? (() => { const fd = new FormData(); Object.entries(vendorForm).forEach(([k, v]) => fd.append(k, v)); fd.append('photo', vendorPhoto); return fd })()
        : vendorForm
      const { data } = await vendorsApi.updateVendor(vendor.id, payload)
      setVendor(data.vendor || data)
      setShowVendorModal(false)
      setVendorPhoto(null)
      showToast('Profile updated', 'success')
    } catch (err) { showToast(err.response?.data?.message || 'Failed to update', 'error') }
    finally { setSavingVendor(false) }
  }

  // Booking status update
  const updateBookingStatus = async (bookingId, status) => {
    try {
      await bookingsApi.updateBookingStatus(bookingId, status)
      showToast(`Booking ${status}`, 'success')
      const { data } = await bookingsApi.getMyVendorBookings()
      setBookings(data.bookings || [])
    } catch (_) { showToast('Failed to update booking', 'error') }
  }

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading vendor dashboard...</div>

  if (!vendor) {
    return (
      <div className="container" style={{ padding: '40px 24px', maxWidth: 500, margin: '0 auto' }}>
        <Card title={<><Icon name="store" /> Register as Vendor</>}>
          <p style={{ marginBottom: 16 }}>You haven't created a vendor profile yet. Register to start offering services.</p>
          <VendorProfileForm vendorForm={vendorForm} setVendorForm={setVendorForm}
            photo={vendorPhoto} setPhoto={setVendorPhoto}
            onSave={async () => {
              try {
                const payload = vendorPhoto
                  ? (() => { const fd = new FormData(); Object.entries(vendorForm).forEach(([k, v]) => fd.append(k, v)); fd.append('photo', vendorPhoto); return fd })()
                  : vendorForm
                const { data } = await vendorsApi.saveVendor(payload)
                setVendor(data.vendor || data)
                setVendorPhoto(null)
                showToast('Vendor profile created!', 'success')
                fetchData()
              } catch (err) { showToast(err.response?.data?.message || 'Failed to create', 'error') }
            }}
            saving={false} />
        </Card>
      </div>
    )
  }

  const stats = {
    products: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    bookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'requested').length,
  }

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Vendor Dashboard</h1>
          <p className="page-subtitle">{vendor.business_name} — Manage products, bookings, and profile.</p>
        </div>
        <Button onClick={() => setShowVendorModal(true)}><Icon name="pencil" /> Edit Profile</Button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        <Widget icon="package" value={stats.products} label="Total Products" />
        <Widget icon="check" value={stats.activeProducts} label="Active Products" />
        <Widget icon="clipboard-list" value={stats.bookings} label="Total Bookings" />
        <Widget icon="hourglass" value={stats.pendingBookings} label="Pending Requests" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['products', 'bookings'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>
            {t === 'products' ? <><Icon name="package" /> Products</> : <><Icon name="clipboard-list" /> Bookings</>}
          </button>
        ))}
      </div>

      {tab === 'products' ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button onClick={openAddProduct}>+ Add Product</Button>
          </div>
          {products.length === 0 ? (
            <EmptyState icon="package" message="No products yet" action={<Button onClick={openAddProduct}>Add First Product</Button>} />
          ) : (
            <Card>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: 50 }}>Image</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th style={{ width: 100 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td>
                              {p.image_url
                                ? <img src={p.image_url} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                                : <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--charcoal-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</div>
                              }
                            </td>
                        <td><span className="cat-chip">{p.category}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--gold)' }}>KES {Number(p.price).toLocaleString()}</td>
                        <td>{p.stock} {p.stock === 0 && <span className="badge badge-inactive" style={{ marginLeft: 4 }}>OOS</span>}</td>
                        <td>{p.status === 'active' ? <span className="badge badge-active">Active</span> : <span className="badge badge-inactive">Inactive</span>}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEditProduct(p)}>Edit</button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeletingProduct(p)}>Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : (
        <>
          {bookings.length === 0 ? (
            <EmptyState icon="clipboard-list" message="No bookings received yet" />
          ) : (
            <Card>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Memorial</th>
                      <th>Service Date</th>
                      <th>Product</th>
                      <th>Requester</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th style={{ width: 140 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.deceased_name}</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.venue}</span></td>
                        <td style={{ fontSize: '0.85rem' }}>{b.funeral_date ? new Date(b.funeral_date).toLocaleDateString() : '-'}</td>
                        <td>{b.product_name || '-'}</td>
                        <td>{b.requester_name}</td>
                        <td style={{ fontWeight: 700, color: 'var(--gold)' }}>KES {Number(b.amount).toLocaleString()}</td>
                        <td><span className={`badge badge-${b.status === 'completed' ? 'active' : b.status === 'cancelled' ? 'inactive' : 'pending'}`}>{b.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {b.status === 'requested' && (
                              <>
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }} onClick={() => updateBookingStatus(b.id, 'confirmed')}>Confirm</button>
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => updateBookingStatus(b.id, 'cancelled')}>Decline</button>
                              </>
                            )}
                            {b.status === 'confirmed' && (
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }} onClick={() => updateBookingStatus(b.id, 'completed')}>Complete</button>
                            )}
                            {b.status === 'completed' && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Done</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Product Modal */}
      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Product Photo</label>
            <input type="file" accept="image/*" onChange={e => setProductPhoto(e.target.files[0])} className="form-control" style={{ padding: 8 }} />
            {(productPhoto || editingProduct?.image_url) && (
              <div style={{ marginTop: 8 }}>
                <img src={productPhoto ? URL.createObjectURL(productPhoto) : editingProduct.image_url} alt=""
                  style={{ width: '100%', height: 120, borderRadius: 8, objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <div>
            <label className="form-label">Product Name *</label>
            <input className="form-control" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Premium Wooden Coffin" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Category</label>
              <select className="form-control" value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Price (KES)</label>
              <input className="form-control" type="number" min="0" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Stock</label>
              <input className="form-control" type="number" min="0" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-control" value={productForm.status} onChange={e => setProductForm(p => ({ ...p, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={2} value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Product details..." />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowProductModal(false)}>Cancel</Button>
            <Button onClick={saveProduct} loading={savingProduct}>{editingProduct ? 'Update' : 'Create Product'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deletingProduct} onClose={() => setDeletingProduct(null)}
        message={`Delete product "${deletingProduct?.name || ''}"?`} confirmText="Delete" onConfirm={deleteProduct} danger />

      {/* Vendor Edit Modal */}
      <Modal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title="Edit Vendor Profile">
        <VendorProfileForm vendorForm={vendorForm} setVendorForm={setVendorForm}
          photo={vendorPhoto} setPhoto={setVendorPhoto} photoUrl={vendor?.photo}
          onSave={saveVendorProfile} saving={savingVendor} />
      </Modal>
    </div>
  )
}

function VendorProfileForm({ vendorForm, setVendorForm, onSave, saving, photo, setPhoto, photoUrl }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {(photoUrl || photo) && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <img src={photo ? URL.createObjectURL(photo) : photoUrl} alt=""
            style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover' }} />
        </div>
      )}
      <div>
        <label className="form-label">Business Photo</label>
        <input type="file" accept="image/*" onChange={e => setPhoto && setPhoto(e.target.files[0])} className="form-control" style={{ padding: 8 }} />
      </div>
      <div>
        <label className="form-label">Business Name *</label>
        <input className="form-control" value={vendorForm.businessName} onChange={e => setVendorForm(p => ({ ...p, businessName: e.target.value }))} placeholder="e.g. Kenyatta Funeral Services" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="form-label">Category</label>
          <select className="form-control" value={vendorForm.category} onChange={e => setVendorForm(p => ({ ...p, category: e.target.value }))}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Location</label>
          <input className="form-control" value={vendorForm.location} onChange={e => setVendorForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Nairobi" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="form-label">Phone</label>
          <input className="form-control" value={vendorForm.phone} onChange={e => setVendorForm(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. +254712345678" />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={vendorForm.email} onChange={e => setVendorForm(p => ({ ...p, email: e.target.value }))} placeholder="e.g. info@example.com" />
        </div>
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea className="form-control" rows={3} value={vendorForm.description} onChange={e => setVendorForm(p => ({ ...p, description: e.target.value }))} placeholder="Tell customers about your business..." />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button onClick={onSave} loading={saving}>Save Profile</Button>
      </div>
    </div>
  )
}
