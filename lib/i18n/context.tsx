'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Lang } from './translations'

interface LangContextValue {
  lang:      Lang
  setLang:   (l: Lang) => void
  toggle:    () => void
}

const LangContext = createContext<LangContextValue>({
  lang:    'id',
  setLang: () => {},
  toggle:  () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id')

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('filtrazon-lang') as Lang | null
    if (saved === 'en' || saved === 'id') setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('filtrazon-lang', l)
  }

  function toggle() {
    setLang(lang === 'id' ? 'en' : 'id')
  }

  return (
    <LangContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

// Convenience hook — returns a translate function bound to current lang
export function useT() {
  const { lang } = useLang()
  return function t(section: string, key: string): string {
    // dynamic import would cause issues in render, so we import inline
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { translations } = require('./translations') as { translations: Record<string, Record<string, Record<Lang, string>>> }
    return translations?.[section]?.[key]?.[lang] ?? key
  }
}
