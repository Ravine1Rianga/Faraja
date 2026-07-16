import Icon from './Icon'
export default function EmptyState({ icon = 'file-text', message = 'Nothing here yet', action }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{typeof icon === 'string' ? <Icon name={icon} size={36} /> : icon}</div>
      <div style={{ fontSize: '0.92rem', marginBottom: action ? 16 : 0 }}>{message}</div>
      {action}
    </div>
  )
}
