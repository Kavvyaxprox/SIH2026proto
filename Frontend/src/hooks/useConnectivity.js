import { useEffect, useState } from "react"

/**
 * Online/offline connectivity hook (Feature: offline-first).
 *
 * Uses `navigator.onLine` plus the browser `online`/`offline` events.
 * `wasOffline` flips to true after a disconnect so screens can keep a
 * persistent offline banner.
 */
export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  )
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true)
    }
    const goOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}