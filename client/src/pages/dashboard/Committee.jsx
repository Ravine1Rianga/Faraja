import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useActiveFuneral } from '../../contexts/FuneralContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import SearchBar from '../../components/ui/SearchBar'
import Icon from '../../components/ui/Icon'
import * as funeralsApi from '../../api/funerals'

const defaultForm = { name: '', phone: '', email: '', location: '', role: '' }

export default function Committee() {
  const { activeFuneralId } = useActiveFuneral()
  const { showToast } = useToast()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  if (!activeFuneralId) return <Navigate to="/dashboard" />

  const fetchMembers = () => {
    setLoading(true)
    funeralsApi.getCommittee(activeFuneralId).then(({ data }) => {
      setMembers(data.members || [])
    }).catch(() => showToast('Failed to load committee', 'error')).finally(() => setLoading(false))
  }

  useEffect(() => { fetchMembers() }, [activeFuneralId])

  const filtered = members.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase()) ||
    m.location?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true) }
  const openEdit = (m) => { setEditing(m); setForm({ name: m.name, phone: m.phone || '', email: m.email || '', location: m.location || '', role: m.committee_role || '' }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name) { showToast('Member name is required', 'error'); return }
    setSaving(true)
    try {
      if (editing) {
        await funeralsApi.updateCommitteeMember(activeFuneralId, editing.id, form)
        showToast('Member updated', 'success')
      } else {
        await funeralsApi.addCommitteeMember(activeFuneralId, form)
        showToast('Member added', 'success')
      }
      setShowModal(false)
      fetchMembers()
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await funeralsApi.deleteCommitteeMember(activeFuneralId, deleting.id)
      showToast('Member removed', 'success')
      setDeleting(null)
      fetchMembers()
    } catch (err) { showToast(err.response?.data?.message || 'Failed to remove', 'error') }
  }

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Committee Members</h1>
          <p className="page-subtitle">Manage funeral committee members, roles, and responsibilities.</p>
        </div>
        <Button onClick={openAdd}>+ Add Member</Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, role, or location..." />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading committee...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="users" message={search ? 'No matching members' : 'No committee members yet'} action={!search ? <Button onClick={openAdd}>Add First Member</Button> : null} />
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Joined</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.committee_role ? <span className="badge badge-active">{m.committee_role}</span> : <span className="badge badge-pending">Member</span>}</td>
                    <td>{m.phone || '-'}</td>
                    <td>{m.email || '-'}</td>
                    <td>{m.location || '-'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.joined_at ? new Date(m.joined_at).toLocaleDateString() : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleting(m)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Member' : 'Add Member'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Full Name *</label>
            <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Kamau" />
          </div>
          <div>
            <label className="form-label">Role / Title</label>
            <input className="form-control" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Treasurer, Coordinator" />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. +254712345678" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="e.g. john@example.com" />
          </div>
          <div>
            <label className="form-label">Location</label>
            <input className="form-control" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Nairobi" />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Add Member'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        message={`Remove ${deleting?.name || 'this member'} from the committee?`}
        confirmText="Remove"
        onConfirm={handleDelete}
        danger
      />
    </div>
  )
}
