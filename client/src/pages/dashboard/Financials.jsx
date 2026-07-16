import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useActiveFuneral } from '../../contexts/FuneralContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Widget from '../../components/ui/Widget'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Icon from '../../components/ui/Icon'
import * as expensesApi from '../../api/expenses'
import * as donationsApi from '../../api/donations'

const categories = ['Transport', 'Catering', 'Venue', 'Coffin', 'Flowers', 'Printing', 'Clothing', 'Food', 'Other']
const defaultForm = { description: '', category: '', amount: '', paidBy: '', expenseDate: '', status: 'pending', notes: '' }

export default function Financials() {
  const { activeFuneralId } = useActiveFuneral()
  const { showToast } = useToast()
  const [expenses, setExpenses] = useState([])
  const [totals, setTotals] = useState({ total: 0, paid: 0, pending: 0 })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [tab, setTab] = useState('expenses')

  if (!activeFuneralId) return <Navigate to="/dashboard" />

  const fetchData = async () => {
    setLoading(true)
    try {
      const [eRes, rRes] = await Promise.all([
        expensesApi.getExpenses(activeFuneralId),
        donationsApi.getDonationReport(activeFuneralId).catch(() => ({ data: null })),
      ])
      const ed = eRes.data
      setExpenses(ed.expenses || [])
      setTotals({ total: ed.total || 0, paid: ed.paid || 0, pending: ed.pending || 0 })
      setReport(rRes.data || null)
    } catch (_) { showToast('Failed to load financials', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [activeFuneralId])

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true) }
  const openEdit = (e) => {
    setEditing(e)
    setForm({
      description: e.description, category: e.category || '', amount: e.amount,
      paidBy: e.paid_by || '', expenseDate: e.expense_date ? e.expense_date.slice(0, 10) : '',
      status: e.status || 'pending', notes: e.notes || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.description || !form.amount) { showToast('Description and amount are required', 'error'); return }
    setSaving(true)
    try {
      if (editing) {
        await expensesApi.updateExpense(editing.id, form)
        showToast('Expense updated', 'success')
      } else {
        await expensesApi.saveExpense(activeFuneralId, form)
        showToast('Expense added', 'success')
      }
      setShowModal(false)
      fetchData()
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await expensesApi.deleteExpense(deleting.id)
      showToast('Expense deleted', 'success')
      setDeleting(null)
      fetchData()
    } catch (_) { showToast('Failed to delete', 'error') }
  }

  const summary = report?.summary || {}
  const byMethod = report?.byMethod || []

  const reportBalance = Number(summary.raised || 0) - Number(summary.expenses || 0)

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Financial Summary</h1>
          <p className="page-subtitle">Track income, expenses, and the financial balance of the memorial fund.</p>
        </div>
        <Button onClick={openAdd}>+ Add Expense</Button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        <Widget icon="money" value={`KES ${Number(summary.raised || totals.total || 0).toLocaleString()}`} label="Total Raised" />
        <Widget icon="credit-card" value={`KES ${Number(totals.paid).toLocaleString()}`} label="Paid Expenses" />
        <Widget icon="hourglass" value={`KES ${Number(totals.pending).toLocaleString()}`} label="Pending Expenses" />
        <Widget icon="chart" value={`KES ${Number(reportBalance).toLocaleString()}`} label="Net Balance" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['expenses', 'report'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>
            {t === 'expenses' ? <><Icon name="clipboard-list" /> Expenses</> : <><Icon name="chart" /> Financial Report</>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading financials...</div>
      ) : tab === 'expenses' ? (
        expenses.length === 0 ? (
          <EmptyState icon="chart" message="No expenses recorded yet" action={<Button onClick={openAdd}>Add First Expense</Button>} />
        ) : (
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Paid By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ width: 90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(ex => (
                    <tr key={ex.id}>
                      <td><strong>{ex.description}</strong></td>
                      <td>{ex.category ? <span className="cat-chip">{ex.category}</span> : '-'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--danger)' }}>KES {Number(ex.amount).toLocaleString()}</td>
                      <td>{ex.paid_by || '-'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{ex.expense_date ? new Date(ex.expense_date).toLocaleDateString() : '-'}</td>
                      <td>{ex.status === 'paid' ? <span className="badge badge-active">Paid</span> : <span className="badge badge-pending">Pending</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ex)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleting(ex)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        <div className="grid grid-2">
          <Card title="Income vs Expenses">
            {summary.goal ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                    <span>Fundraising Goal</span>
                    <span>KES {Number(summary.goal).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                    <span>Total Raised</span>
                    <span style={{ color: 'var(--success)' }}>KES {Number(summary.raised || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span>Total Expenses</span>
                    <span style={{ color: 'var(--danger)' }}>KES {Number(summary.expenses || 0).toLocaleString()}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700 }}>
                    <span>Net Balance</span>
                    <span style={{ color: reportBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      KES {Number(reportBalance).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-main)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Fundraising Progress</div>
                  <div style={{ height: 8, background: 'var(--bg-main)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      width: `${Math.min(100, (summary.raised / summary.goal) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--gold), #f0a030)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {Math.round((summary.raised / summary.goal) * 100)}%
                  </div>
                </div>
              </>
            ) : (
              <EmptyState icon="chart" message="No fundraising goal set" />
            )}
          </Card>

          <Card title="Payment Methods">
            {byMethod.length === 0 ? (
              <EmptyState icon="credit-card" message="No confirmed contributions" />
            ) : (
              <table className="data-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {byMethod.map(m => (
                    <tr key={m.payment_method}>
                      <td><span className="cat-chip">{m.payment_method}</span></td>
                      <td style={{ fontWeight: 700 }}>KES {Number(m.total).toLocaleString()}</td>
                      <td>{m.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Description *</label>
            <input className="form-control" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Flower arrangement" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Amount (KES) *</label>
              <input className="form-control" type="number" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Date</label>
              <input className="form-control" type="date" value={form.expenseDate} onChange={e => setForm(p => ({ ...p, expenseDate: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Paid By</label>
            <input className="form-control" value={form.paidBy} onChange={e => setForm(p => ({ ...p, paidBy: e.target.value }))} placeholder="Who paid?" />
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Add Expense'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)}
        message={`Delete expense "${deleting?.description || ''}"?`} confirmText="Delete" onConfirm={handleDelete} danger />
    </div>
  )
}
