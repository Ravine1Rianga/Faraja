import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, maxWidth }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={onClose}>
      <div className="modal-box" style={maxWidth ? { maxWidth } : {}} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {title && <h3 className="modal-title">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
