export default function Card({ title, action, className = '', children, style }) {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || action) && (
        <div className="card-header">
          {title && <div className="card-title">{title}</div>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
