import { History, Home, Info, Leaf, RefreshCw } from "lucide-react"
import { useI18n } from "../i18n"

const LEFT_TABS = [
  { id: "home", key: "nav.home", icon: Home },
  { id: "history", key: "nav.history", icon: History },
]

const RIGHT_TABS = [
  { id: "sync", key: "nav.sync", icon: RefreshCw, badge: "sync" },
  { id: "about", key: "nav.about", icon: Info },
]

/**
 * Mobile-first bottom navigation with an elevated centre scan shortcut.
 *
 * @param {{
 *   active: 'home'|'history'|'sync'|'about',
 *   pendingCount: number,
 *   onChange: (id) => void,
 *   onScan: () => void,
 * }} props
 */
export default function BottomNav({ active, onChange, onScan, pendingCount }) {
  const { t } = useI18n()

  const renderTab = ({ id, key, icon: Icon, badge }) => (
    <button
      key={id}
      type="button"
      onClick={() => onChange(id)}
      aria-current={active === id ? "page" : undefined}
      className={`relative flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition ${
        active === id ? "text-green-700" : "text-gray-400 hover:text-green-600"
      }`}
    >
      <Icon className="h-5 w-5" />
      {t(key)}
      {badge === "sync" && pendingCount > 0 && (
        <span className="absolute top-0 -right-1 min-w-4 rounded-full bg-amber-500 px-1 text-center text-[9px] leading-4 font-bold text-white">
          {pendingCount}
        </span>
      )}
    </button>
  )

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky bottom-0 z-20 border-t border-green-100 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-md items-center gap-1 px-3 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        <div className="flex flex-1 items-center justify-around">
          {LEFT_TABS.map(renderTab)}
        </div>

        {/* Centre scan shortcut */}
        <button
          type="button"
          onClick={onScan}
          aria-label={t("nav.scan")}
          className="-mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white shadow-lg shadow-green-600/40 ring-4 ring-white transition hover:brightness-105 active:scale-95"
        >
          <Leaf className="h-6 w-6" />
        </button>

        <div className="flex flex-1 items-center justify-around">
          {RIGHT_TABS.map(renderTab)}
        </div>
      </div>
    </nav>
  )
}