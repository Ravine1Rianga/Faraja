export default function Badge({ variant, children, className = '' }) {
  return <span className={`badge${variant ? ` badge-${variant}` : ''} ${className}`}>{children}</span>
}
