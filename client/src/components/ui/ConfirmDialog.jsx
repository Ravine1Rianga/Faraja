import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, message, confirmText = 'Confirm', danger }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚠ Confirm" maxWidth="400px">
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose() }}>{confirmText}</Button>
      </div>
    </Modal>
  )
}
