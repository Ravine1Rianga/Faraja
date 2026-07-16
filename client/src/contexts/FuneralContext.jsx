import { createContext, useContext, useState, useCallback } from 'react'

const FuneralContext = createContext(null)

const STORAGE_KEY = 'faraja_active_funeral'

export function FuneralProvider({ children }) {
  const [activeFuneralId, setActiveFuneralId] = useState(() => localStorage.getItem(STORAGE_KEY))

  const setActiveFuneral = useCallback((id) => {
    localStorage.setItem(STORAGE_KEY, id)
    setActiveFuneralId(id)
  }, [])

  const clearActiveFuneral = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setActiveFuneralId(null)
  }, [])

  return (
    <FuneralContext.Provider value={{ activeFuneralId, setActiveFuneral, clearActiveFuneral }}>
      {children}
    </FuneralContext.Provider>
  )
}

export const useActiveFuneral = () => useContext(FuneralContext)
