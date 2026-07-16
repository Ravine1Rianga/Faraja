import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useActiveFuneral } from '../../contexts/FuneralContext'
import { useToast } from '../../contexts/ToastContext'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/ui/Icon'
import * as funeralsApi from '../../api/funerals'

const emptyEvent = { time: '', title: '', description: '', speaker: '' }

export default function OrderOfService() {
  const { activeFuneralId } = useActiveFuneral()
  const { showToast } = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingIdx, setEditingIdx] = useState(null)
  const [form, setForm] = useState(emptyEvent)
  const [funeralName, setFuneralName] = useState('')

  if (!activeFuneralId) return <Navigate to="/dashboard" />

  useEffect(() => {
    setLoading(true)
    funeralsApi.getFuneral(activeFuneralId).then(({ data }) => {
      const f = data.funeral || data
      setFuneralName(f.deceased_name || '')
      try {
        const parsed = typeof f.order_of_service === 'string' ? JSON.parse(f.order_of_service) : (f.order_of_service || [])
        setEvents(Array.isArray(parsed) ? parsed : [])
      } catch { setEvents([]) }
    }).catch(() => showToast('Failed to load funeral', 'error')).finally(() => setLoading(false))
  }, [activeFuneralId])

  const saveEvents = async (newEvents) => {
    setSaving(true)
    try {
      await funeralsApi.updateFuneral(activeFuneralId, { orderOfService: JSON.stringify(newEvents) })
      setEvents(newEvents)
      showToast('Order of service saved', 'success')
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error') }
    finally { setSaving(false) }
  }

  const openAdd = () => { setEditingIdx(null); setForm(emptyEvent); setShowModal(true) }
  const openEdit = (idx) => {
    setEditingIdx(idx)
    setForm({ ...events[idx] })
    setShowModal(true)
  }

  const handleSaveEvent = () => {
    if (!form.title) { showToast('Event title is required', 'error'); return }
    let newEvents = [...events]
    if (editingIdx !== null) {
      newEvents[editingIdx] = form
    } else {
      newEvents.push(form)
    }
    setEvents(newEvents)
    setShowModal(false)
  }

  const removeEvent = (idx) => {
    const newEvents = events.filter((_, i) => i !== idx)
    setEvents(newEvents)
  }

  const moveEvent = (idx, dir) => {
    const newEvents = [...events]
    const target = idx + dir
    if (target < 0 || target >= newEvents.length) return
    ;[newEvents[idx], newEvents[target]] = [newEvents[target], newEvents[idx]]
    setEvents(newEvents)
  }

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Order of Service</h1>
          <p className="page-subtitle">Build the funeral program for {funeralName || 'the memorial'}.</p>
        </div>
        <Button onClick={openAdd}>+ Add Event</Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <>
          {events.length === 0 ? (
            <EmptyState icon="file-text" message="No events yet. Add the funeral program order." action={<Button onClick={openAdd}>Add First Event</Button>} />
          ) : (
            <div style={{ maxWidth: 700 }}>
              <div className="card" style={{ padding: 0 }}>
                {events.map((ev, i) => (
                  <div key={i} style={{
                    padding: '16px 20px',
                    borderBottom: i < events.length - 1 ? '1px solid var(--border-light)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button className="btn btn-ghost btn-xs" onClick={() => moveEvent(i, -1)} disabled={i === 0} style={{ padding: '0 4px', opacity: i === 0 ? 0.3 : 1 }}><Icon name="chevron-up" size={14} /></button>
                      <button className="btn btn-ghost btn-xs" onClick={() => moveEvent(i, 1)} disabled={i === events.length - 1} style={{ padding: '0 4px', opacity: i === events.length - 1 ? 0.3 : 1 }}><Icon name="chevron-down" size={14} /></button>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          {ev.time && <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, marginRight: 10 }}>{ev.time}</span>}
                          <strong>{ev.title}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(i)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeEvent(i)}>Remove</button>
                        </div>
                      </div>
                      {ev.description && <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ev.description}</p>}
                      {ev.speaker && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}><Icon name="mic" size={14} /> {ev.speaker}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                <Button onClick={() => saveEvents(events)} loading={saving}><Icon name="save" /> Save Order of Service</Button>
                {events.length > 0 && (
                  <Button variant="ghost" onClick={() => {
                    const preview = events.map(ev =>
                      `${ev.time ? ev.time + ' - ' : ''}${ev.title}${ev.speaker ? ` (${ev.speaker})` : ''}`
                    ).join('\n')
                    showToast('Preview:\n' + preview.slice(0, 200), 'info')
                  }}><Icon name="eye" /> Preview</Button>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <Button variant="ghost" onClick={async () => {
              if (!activeFuneralId) return
              try {
                await funeralsApi.updateFuneral(activeFuneralId, { orderOfService: '' })
                setEvents([])
                showToast('Cleared order of service', 'info')
              } catch (_) { showToast('Failed to clear', 'error') }
            }}><Icon name="trash" /> Clear All Events</Button>
          </div>
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingIdx !== null ? 'Edit Event' : 'Add Event'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Event Title *</label>
            <input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Opening Prayer" />
          </div>
          <div>
            <label className="form-label">Time</label>
            <input className="form-control" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Details about this event..." />
          </div>
          <div>
            <label className="form-label">Speaker / Officiant</label>
            <input className="form-control" value={form.speaker} onChange={e => setForm(p => ({ ...p, speaker: e.target.value }))} placeholder="e.g. Pastor John" />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSaveEvent}>{editingIdx !== null ? 'Update' : 'Add Event'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
