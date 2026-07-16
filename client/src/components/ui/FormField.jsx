export default function FormField({ label, error, required, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{required && ' *'}</label>}
      {children}
      {error && <div className="form-error" style={{ display: 'block' }}>⚠ {error}</div>}
    </div>
  )
}
