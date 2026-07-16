export default function Button({ variant = 'primary', size, loading, icon, disabled, onClick, children, className = '', type = 'button', ...props }) {
  const cls = `btn btn-${variant}${size ? ` btn-${size}` : ''}${loading ? ' btn-loading' : ''} ${className}`
  return (
    <button type={type} className={cls} disabled={disabled || loading} onClick={onClick} {...props}>
      {loading ? <span className="spinner" /> : icon ? <span>{icon}</span> : null}
      {children}
    </button>
  )
}
