import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActiveFuneral } from '../../contexts/FuneralContext'
import { useToast } from '../../contexts/ToastContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'
import * as funeralsApi from '../../api/funerals'

const steps = ['Deceased Info', 'Funeral Details', 'Fundraising & Committee']

const defaultForm = {
  deceasedName: '', dateOfBirth: '', dateOfDeath: '', biography: '',
  funeralDate: '', funeralTime: '', venue: '', burialSite: '', officiant: '', mortuary: '',
  fundraisingGoal: '', privacy: 'public', notifyMsg: '',
}

export default function CreateFuneral() {
  const navigate = useNavigate()
  const { setActiveFuneral } = useActiveFuneral()
  const { showToast } = useToast()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(defaultForm)
  const [photo, setPhoto] = useState(null)
  const [committee, setCommittee] = useState([{ name: '', phone: '', role: '' }])
  const [saving, setSaving] = useState(false)

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const updateCommittee = (idx, field) => (e) => {
    const updated = [...committee]
    updated[idx][field] = e.target.value
    setCommittee(updated)
  }

  const addCommitteeRow = () => setCommittee(p => [...p, { name: '', phone: '', role: '' }])
  const removeCommitteeRow = (idx) => setCommittee(p => p.filter((_, i) => i !== idx))

  const canNext = () => {
    if (step === 0) return form.deceasedName.trim()
    if (step === 1) return form.funeralDate.trim() && form.venue.trim()
    return true
  }

  const nextStep = () => { if (canNext()) setStep(s => Math.min(s + 1, steps.length - 1)) }
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    if (!form.deceasedName || !form.funeralDate || !form.venue) {
      showToast('Deceased name, funeral date, and venue are required', 'error')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (photo) fd.append('photo', photo)
      const validCommittee = committee.filter(m => m.name.trim())
      if (validCommittee.length) fd.append('committee', JSON.stringify(validCommittee))

      const { data } = await funeralsApi.saveFuneral(fd)
      const funeral = data.funeral || data.data?.funeral
      if (funeral?.id) {
        setActiveFuneral(funeral.id)
        showToast('Memorial created successfully!', 'success')
        navigate('/dashboard')
      } else {
        showToast('Created but redirecting...', 'success')
        navigate('/dashboard')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create memorial', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="container" style={{ padding: '24px 24px 60px', maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div className="breadcrumb" style={{ marginBottom: 8 }}>
          <a href="/dashboard" onClick={e => { e.preventDefault(); navigate('/dashboard') }}>Dashboard</a>
          <span className="breadcrumb-sep">›</span>
          <span>New Memorial</span>
        </div>
        <h1 className="page-title">Create New Memorial</h1>
        <p className="page-subtitle">Set up a new funeral memorial with fundraising and committee management.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
        {steps.map((s, i) => (
          <div key={i} onClick={() => i < step ? setStep(i) : null}
            style={{
              padding: '8px 20px', borderRadius: 20, fontSize: '0.85rem', cursor: i < step ? 'pointer' : 'default',
              background: i === step ? 'var(--gold)' : i < step ? 'var(--success)' : 'var(--bg-card)',
              color: i === step || i < step ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border-light)', transition: 'all 0.2s',
            }}>
            {i < step ? <><Icon name="check" size={14} /> </> : i + 1 + '. '}{s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card title={<><Icon name="dove" /> Deceased Information</>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input className="form-control" value={form.deceasedName} onChange={update('deceasedName')} placeholder="e.g. John Kamau" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Date of Birth</label>
                <input className="form-control" type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} />
              </div>
              <div>
                <label className="form-label">Date of Passing</label>
                <input className="form-control" type="date" value={form.dateOfDeath} onChange={update('dateOfDeath')} />
              </div>
            </div>
            <div>
              <label className="form-label">Biography / Tribute</label>
              <textarea className="form-control" rows={4} value={form.biography} onChange={update('biography')} placeholder="Write a brief tribute or biography..." />
            </div>
            <div>
              <label className="form-label">Photo</label>
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
              {photo && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>{photo.name}</p>}
            </div>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card title={<><Icon name="file-text" /> Funeral Details</>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Funeral Date *</label>
                <input className="form-control" type="date" value={form.funeralDate} onChange={update('funeralDate')} />
              </div>
              <div>
                <label className="form-label">Time</label>
                <input className="form-control" type="time" value={form.funeralTime} onChange={update('funeralTime')} />
              </div>
            </div>
            <div>
              <label className="form-label">Venue *</label>
              <input className="form-control" value={form.venue} onChange={update('venue')} placeholder="e.g. Nairobi Baptist Church" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Burial Site</label>
                <input className="form-control" value={form.burialSite} onChange={update('burialSite')} placeholder="e.g. Langata Cemetery" />
              </div>
              <div>
                <label className="form-label">Officiant</label>
                <input className="form-control" value={form.officiant} onChange={update('officiant')} placeholder="e.g. Pastor Mark" />
              </div>
            </div>
            <div>
              <label className="form-label">Mortuary / FH</label>
              <input className="form-control" value={form.mortuary} onChange={update('mortuary')} placeholder="e.g. Kenyatta University FH" />
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <>
          <Card title={<><Icon name="money" /> Fundraising</>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Fundraising Goal (KES)</label>
                  <input className="form-control" type="number" min="0" value={form.fundraisingGoal} onChange={update('fundraisingGoal')} placeholder="e.g. 500000" />
                </div>
                <div>
                  <label className="form-label">Privacy</label>
                  <select className="form-control" value={form.privacy} onChange={update('privacy')}>
                    <option value="public">Public — visible to everyone</option>
                    <option value="private">Private — only people with the link</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Notification Message (for diaspora announcement)</label>
                <textarea className="form-control" rows={2} value={form.notifyMsg} onChange={update('notifyMsg')} placeholder="Optional custom message..." />
              </div>
            </div>
          </Card>

          <Card title={<><Icon name="users" /> Committee Members</>} style={{ marginTop: 20 }}>
            {committee.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10, paddingBottom: 10, borderBottom: i < committee.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ flex: 2 }}>
                  <label className="form-label">Name</label>
                  <input className="form-control" value={m.name} onChange={updateCommittee(i, 'name')} placeholder="Full name" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={m.phone} onChange={updateCommittee(i, 'phone')} placeholder="Phone" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Role</label>
                  <input className="form-control" value={m.role} onChange={updateCommittee(i, 'role')} placeholder="e.g. Treasurer" />
                </div>
                {committee.length > 1 && (
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', marginBottom: 2 }} onClick={() => removeCommitteeRow(i)}>✕</button>
                )}
              </div>
            ))}
            <Button variant="ghost" onClick={addCommitteeRow} style={{ marginTop: 4 }}>+ Add Another Member</Button>
          </Card>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        <Button variant="ghost" onClick={step === 0 ? () => navigate('/dashboard') : prevStep}>
          {step === 0 ? 'Cancel' : <><Icon name="arrow-left" /> Back</>}
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={nextStep} disabled={!canNext()}>Next <Icon name="arrow-right" /></Button>
        ) : (
          <Button onClick={handleSubmit} loading={saving}><Icon name="dove" /> Create Memorial</Button>
        )}
      </div>
    </div>
  )
}
