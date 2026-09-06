import { useCallback, useState } from 'react'

/**
 * useState that transparently persists its value to localStorage.
 *
 * Used for the scan history (feature 3) and survives page reloads and
 * offline sessions (feature 5).
 *
 * @param {string} key        Storage key, e.g. `'agriscan:history'`.
 * @param {any}    initialValue Fallback value when nothing is stored.
 * @returns {[any, (next: any | (prev: any) => any) => void, () => void]}
 */
export function useLocalStorage(key, initialValue) {
  // Lazy init: read from storage only on first render.
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  const setStoredValue = useCallback(
    (next) => {
      setValue((prev) => {
        // Support the functional-updater pattern setValue(prev => ...).
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // Storage quota exceeded or unavailable - keep in-memory state.
        }
        return resolved
      })
    },
    [key],
  )

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    setValue(initialValue)
  }, [key, initialValue])

  return [value, setStoredValue, remove]
}