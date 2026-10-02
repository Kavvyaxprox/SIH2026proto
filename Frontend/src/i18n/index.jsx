import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

/** i18n context: holds the active bundle and a `t()` lookup function. */

const I18nContext = createContext(null)

export const SUPPORTED_LOCALES = ["en", "hi"]

// Lazy-loaded per locale so only one bundle ships in the main chunk.
const BUNDLES = {
  en: () => import("./locales/en.json"),
  hi: () => import("./locales/hi.json"),
}

function lookup(bundle, key) {
  return key.split(".").reduce((obj, part) => obj?.[part], bundle) ?? key
}

export function I18nProvider({ initialLocale = "en", children }) {
  const [locale, setLocale] = useState(initialLocale)
  const [bundle, setBundle] = useState(null)

  useEffect(() => {
    let active = true
    BUNDLES[locale]?.()
      .then((mod) => active && setBundle(mod.default))
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [locale])

  const changeLocale = useCallback(async (code) => {
    if (!SUPPORTED_LOCALES.includes(code)) return
    setLocale(code)
    try {
      localStorage.setItem("agriscan:locale", code)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ locale, t: (key) => lookup(bundle, key), changeLocale }),
    [locale, bundle, changeLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}