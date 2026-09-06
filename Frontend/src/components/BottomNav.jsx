import { Home, Leaf, History } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'history', label: 'History', icon: History },
]

/**
 * Mobile-first bottom navigation with an elevated center scan shortcut.
 *
 * @param {{ active: 'home'|'history', onChange: (id: 'home'|'history') => void, onScan: () => void }} props
 */
export default function BottomNav({ active, onChange, onScan }) {
  return (
    <nav
      aria-label="Primary navigation"
      className="sticky bottom-0 z-20 border-t border-green-100 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-4 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={active === id ? 'page' : undefined}
            className={`flex min-w-20 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
              active === id
                ? 'text-green-700'
                : 'text-gray-400 hover:text-green-600'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}

        {/* Center scan shortcut */}
        <button
          type="button"
          onClick={onScan}
          aria-label="Scan a plant now"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white shadow-lg shadow-green-600/40 ring-4 ring-white transition hover:brightness-105 active:scale-95"
        >
          <Leaf className="h-6 w-6" />
        </button>

        {/* Spacer keeps the layout centred around the FAB */}
        <span className="min-w-20" aria-hidden="true" />
      </div>
    </nav>
  )
}