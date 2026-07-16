import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useActiveFuneral } from '../../contexts/FuneralContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Icon from '../../components/ui/Icon'
import * as tasksApi from '../../api/tasks'
import * as funeralsApi from '../../api/funerals'

const statuses = ['todo', 'in_progress', 'completed']
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }
const priorityColors = { high: 'var(--danger)', medium: 'var(--gold)', low: 'var(--success)' }
const defaultForm = { title: '', description: '', assignedTo: '', priority: 'medium', status: 'todo', dueDate: '' }

export default function Tasks() {
  const { activeFuneralId } = useActiveFuneral()
  const { showToast } = useToast()
  const [tasks, setTasks] = useState([])
  const [committee, setCommittee] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  if (!activeFuneralId) return <Navigate to="/dashboard" />

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tRes, cRes] = await Promise.all([
        tasksApi.getTasks(activeFuneralId),
        funeralsApi.getCommittee(activeFuneralId).catch(() => ({ data: { members: [] } })),
      ])
      setTasks(tRes.data.tasks || [])
      setCommittee(cRes.data.members || [])
    } catch (_) { showToast('Failed to load tasks', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [activeFuneralId])

  const grouped = statuses.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s)
    return acc
  }, {})

  const openAdd = (status = 'todo') => {
    setEditing(null)
    setForm({ ...defaultForm, status })
    setShowModal(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    setForm({
      title: t.title,
      description: t.description || '',
      assignedTo: t.assigned_to || '',
      priority: t.priority || 'medium',
      status: t.status || 'todo',
      dueDate: t.due_date ? t.due_date.slice(0, 10) : '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title) { showToast('Task title is required', 'error'); return }
    setSaving(true)
    try {
      if (editing) {
        await tasksApi.updateTask(editing.id, form)
        showToast('Task updated', 'success')
      } else {
        await tasksApi.saveTask(activeFuneralId, form)
        showToast('Task created', 'success')
      }
      setShowModal(false)
      fetchData()
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error') }
    finally { setSaving(false) }
  }

  const toggleComplete = async (task) => {
    try {
      if (task.status === 'completed') {
        await tasksApi.updateTask(task.id, { status: 'todo' })
      } else {
        await tasksApi.completeTask(task.id)
      }
      fetchData()
    } catch (_) { showToast('Failed to update task', 'error') }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await tasksApi.deleteTask(deleting.id)
      showToast('Task deleted', 'success')
      setDeleting(null)
      fetchData()
    } catch (_) { showToast('Failed to delete', 'error') }
  }

  const changeStatus = async (task, newStatus) => {
    try {
      await tasksApi.updateTask(task.id, { status: newStatus })
      fetchData()
    } catch (_) { showToast('Failed to update status', 'error') }
  }

  const getAssigneeName = (id) => committee.find(m => String(m.id) === String(id))?.name || 'Unassigned'

  return (
    <div className="container" style={{ padding: '24px 24px 60px' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="page-subtitle">Manage funeral tasks — drag between columns to update status.</p>
        </div>
        <Button onClick={() => openAdd('todo')}>+ New Task</Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <EmptyState icon="check" message="No tasks yet" action={<Button onClick={() => openAdd('todo')}>Create First Task</Button>} />
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
          {statuses.map(status => (
            <div key={status}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>{statusLabels[status]} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({grouped[status]?.length || 0})</span></h4>
                {status !== 'completed' && <button className="btn btn-ghost btn-sm" onClick={() => openAdd(status)}>+</button>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(grouped[status] || []).map(task => (
                  <div key={task.id} className="card" style={{ padding: 14, cursor: 'pointer' }}
                    onClick={() => openEdit(task)}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <input type="checkbox" checked={task.status === 'completed'}
                        onChange={e => { e.stopPropagation(); toggleComplete(task) }}
                        style={{ marginTop: 2, width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', textDecoration: task.status === 'completed' ? 'line-through' : 'none', marginBottom: 2 }}>
                          {task.title}
                        </div>
                        {task.priority !== 'medium' && (
                          <span style={{
                            display: 'inline-block', padding: '1px 7px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                            background: priorityColors[task.priority] + '20',
                            color: priorityColors[task.priority],
                          }}>{task.priority}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: status !== 'completed' ? 8 : 0 }}>
                      <span><Icon name="user" size={13} /> {getAssigneeName(task.assigned_to)}</span>
                      <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : ''}</span>
                    </div>
                    {status !== 'completed' && (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <select value={task.status}
                          onChange={e => { e.stopPropagation(); changeStatus(task, e.target.value) }}
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: '0.75rem', padding: '3px 6px', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-secondary)', outline: 'none' }}>
                          {statuses.filter(s => s !== task.status).map(s => (
                            <option key={s} value={s}>Move to {statusLabels[s]}</option>
                          ))}
                        </select>
                        <button className="btn btn-ghost btn-xs" style={{ color: 'var(--danger)', marginLeft: 'auto', padding: '2px 6px', lineHeight: 1 }}
                          onClick={e => { e.stopPropagation(); setDeleting(task) }}><Icon name="trash" size={13} /></button>
                      </div>
                    )}
                  </div>
                ))}
                {(!grouped[status] || grouped[status].length === 0) && (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-light)', borderRadius: 12 }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Task' : 'New Task'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Title *</label>
            <input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Order flowers" />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Details about this task..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Priority</label>
              <select className="form-control" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Due Date</label>
              <input className="form-control" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Assign To</label>
              <select className="form-control" value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}>
                <option value="">Unassigned</option>
                {committee.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create Task'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)}
        message={`Delete task "${deleting?.title || ''}"?`} confirmText="Delete" onConfirm={handleDelete} danger />
    </div>
  )
}
