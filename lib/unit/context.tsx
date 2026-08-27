'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface UnitDevice {
  id:   string
  name: string
  type: 'node' | 'gateway'
}

interface UnitContextValue {
  selectedUnit:    UnitDevice | null
  setSelectedUnit: (u: UnitDevice | null) => void
  clearUnit:       () => void
}

const UnitContext = createContext<UnitContextValue>({
  selectedUnit:    null,
  setSelectedUnit: () => {},
  clearUnit:       () => {},
})

export function UnitProvider({ children }: { children: ReactNode }) {
  const [selectedUnit, setSelectedUnitState] = useState<UnitDevice | null>(null)

  // Persist selection to sessionStorage (cleared on tab close)
  useEffect(() => {
    const saved = sessionStorage.getItem('filtrazon-unit')
    if (saved) {
      try { setSelectedUnitState(JSON.parse(saved)) } catch {}
    }
  }, [])

  function setSelectedUnit(u: UnitDevice | null) {
    setSelectedUnitState(u)
    if (u) sessionStorage.setItem('filtrazon-unit', JSON.stringify(u))
    else   sessionStorage.removeItem('filtrazon-unit')
  }

  function clearUnit() { setSelectedUnit(null) }

  return (
    <UnitContext.Provider value={{ selectedUnit, setSelectedUnit, clearUnit }}>
      {children}
    </UnitContext.Provider>
  )
}

export function useUnit() { return useContext(UnitContext) }
