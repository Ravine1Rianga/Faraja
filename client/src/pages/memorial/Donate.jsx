import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import * as funeralsApi from '../../api/funerals'
import * as donationsApi from '../../api/donations'

const presetAmounts = [500, 1000, 2000, 5000, 10000, 50000]

export default function Donate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [funeral, setFuneral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [testMode, setTestMode] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    funeralsApi.getPublicMemorial(id).then(({ data }) => {
      setFuneral(data.memorial || data)
    }).catch(() => {
      showToast('Memorial not found', 'error')
      navigate('/')
    }).finally(() => setLoading(false))
  }, [id])

  const handlePreset = (val) => {
    setAmount(val)
    setCustomAmount('')
  }

  const finalAmount = customAmount || amount

  const handleSubmit = async () => {
    const amt = Number(finalAmount)
    if (!amt || amt < 1) { showToast('Please enter an amount of at least KES 1', 'error'); return }
    if (!testMode && !phone) { showToast('Phone number is required for M-PESA', 'error'); return }

    setSubmitting(true)
    try {
      const payload = {
        funeralId: Number(id),
        amount: amt,
        donorName: donorName || undefined,
        paymentMethod: testMode ? 'test' : 'mpesa',
        message: message || undefined,
        isAnonymous,
        testMode,
        phone: testMode ? undefined : phone,
      }
      const { data } = await donationsApi.createDonation(payload)
      setResult(data)
      showToast(testMode ? 'Test contribution recorded!' : 'M-PESA STK push sent! Check your phone.', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment failed', 'error')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
  if (!funeral) return null

  const progressPct = Number(funeral.fundraising_goal) > 0
    ? Math.min(100, Math.round((Number(funeral.raised || 0) / Number(funeral.fundraising_goal)) * 100))
    : 0

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}><Icon name="dove" size={48} /></div>
        <h2 style={{ margin: 0 }}>Support the Family of {funeral.deceased_name}</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
          Your generous contribution helps ease the financial burden during this difficult time.
        </p>
      </div>

      <Card title={<><Icon name="money" /> Fundraising Progress — KES {Number(funeral.raised || 0).toLocaleString()} raised</>}>
        <div style={{ height: 8, background: 'var(--bg-main)', borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ height: '100%', borderRadius: 4, width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--gold), #f0a030)', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>{progressPct}% of KES {Number(funeral.fundraising_goal || 0).toLocaleString()}</span>
        </div>
      </Card>

      {result ? (
        <Card title={<><Icon name="check" /> Contribution Recorded</>} style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}><Icon name="heart" size={48} style={{ color: 'var(--success)' }} /></div>
          <h3>Thank You!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your contribution of <strong>KES {Number(finalAmount).toLocaleString()}</strong> has been {testMode ? 'recorded (test mode)' : 'initiated'}.
          </p>
          {result.ref && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Reference: {result.ref}</p>}
          {result.checkoutRequestID && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Checkout: {result.checkoutRequestID}</p>}
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Button onClick={() => setResult(null)}>Make Another Contribution</Button>
            <Button variant="ghost" onClick={() => navigate(`/memorial/${id}`)}>Back to Memorial</Button>
          </div>
        </Card>
      ) : (
        <Card title={<><Icon name="heart" style={{ color: 'var(--success)' }} /> Make a Contribution</>} style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Select Amount</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {presetAmounts.map(a => (
                  <button key={a} onClick={() => handlePreset(a)}
                    style={{
                      padding: '8px 18px', borderRadius: 8, border: `2px solid ${amount === a ? 'var(--gold)' : 'var(--border-light)'}`,
                      background: amount === a ? 'rgba(212,175,55,0.12)' : 'transparent',
                      color: amount === a ? 'var(--gold)' : 'var(--text-secondary)',
                      fontWeight: amount === a ? 700 : 400, cursor: 'pointer', fontSize: '0.88rem',
                    }}>
                    KES {a.toLocaleString()}
                  </button>
                ))}
              </div>
              <input className="form-control" type="number" min="1" placeholder="Or enter custom amount..."
                value={customAmount} onChange={e => { setCustomAmount(e.target.value); setAmount('') }} />
            </div>

            <div>
              <label className="form-label">Your Name</label>
              <input className="form-control" value={donorName} onChange={e => setDonorName(e.target.value)} placeholder="Leave blank for anonymous" />
            </div>

            {!testMode && (
              <div>
                <label className="form-label">M-PESA Phone Number</label>
                <input className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 254712345678" />
              </div>
            )}

            <div>
              <label className="form-label">Message (optional)</label>
              <textarea className="form-control" rows={2} value={message} onChange={e => setMessage(e.target.value)} placeholder="A message of comfort..." />
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                Donate anonymously
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={testMode} onChange={e => setTestMode(e.target.checked)} />
                Test mode (no real payment)
              </label>
            </div>

            <Button onClick={handleSubmit} loading={submitting} style={{ width: '100%', padding: 14, fontSize: '1rem' }}>
              {testMode ? <><Icon name="heart" style={{ color: 'var(--success)' }} /> Record Test Contribution</> : <><Icon name="heart" style={{ color: 'var(--success)' }} /> Contribute via M-PESA</>}
            </Button>

            {!testMode && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                You will receive an M-PESA STK push on your phone to complete payment.
              </p>
            )}
          </div>
        </Card>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  )
}
