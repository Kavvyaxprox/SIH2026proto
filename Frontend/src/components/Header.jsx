import { Bell, Leaf, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Sticky app header for the whole shell.
 * - Brand mark + name on the left.
 * - Live online/offline pill + notifications bell on the right.
 */
export default function Header() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  // Feature 5: reflect connection status so users know history is usable offline.
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b border-green-100 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white shadow-sm shadow-green-600/30">
            <Leaf className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight text-green-950">
              AgriScan AI
            </h1>
            <p className="text-[11px] font-medium text-gray-400">
              Crop Health Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              isOnline
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
            title={isOnline ? 'Online' : 'Offline — history still available'}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </span>
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 text-green-700 transition hover:bg-green-50 active:scale-95"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  )
}