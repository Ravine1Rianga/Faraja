export default function ProgressBar({ value = 0, max = 100, size, showLabel = true, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={`progress-wrap${size ? ` progress-${size}` : ''}`}>
      <div
        className="progress-bar"
        data-progress={Math.round(pct)}
        style={{ width: `${pct}%`, background: color ? `var(--${color})` : undefined }}
      />
      {showLabel && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
        {Math.round(pct)}%
      </span>}
    </div>
  )
}
