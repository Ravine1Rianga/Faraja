export default function Spinner({ size = 'md' }) {
  const px = { sm: 16, md: 24, lg: 40 }[size] || 24
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div style={{ width: px, height: px, border: '3px solid var(--border-light)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}
