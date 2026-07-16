export default function Avatar({ name, src, size = 'md' }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const sizeMap = { sm: '28px', md: '36px', lg: '48px' }
  const px = sizeMap[size] || sizeMap.md


  
  if (src) {
    return <img src={src} alt={name} className={`avatar avatar-${size}`} style={{ width: px, height: px, borderRadius: '50%', objectFit: 'cover' }} />
  }

  return (
    <div className={`avatar avatar-${size}`} style={{ width: px, height: px, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size === 'sm' ? '0.65rem' : '0.8rem', background: 'var(--charcoal-3)', color: 'var(--text-secondary)' }}>
      {initials}
    </div>
  )
}
