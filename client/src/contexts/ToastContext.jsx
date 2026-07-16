import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

let toastId = 0

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => {
          const ToastIcon = iconMap[t.type] || Info
          return (
            <div
              key={t.id}
              onClick={() => removeToast(t.id)}
              style={{
                padding: '10px 20px', borderRadius: 12, background: '#1f1f2e',
                border: '1px solid rgba(255,255,255,0.08)', color: '#f0ede8',
                fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', gap: 8, minWidth: 240,
              }}
            >
              <ToastIcon size={18} />
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
