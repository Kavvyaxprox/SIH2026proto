import { Bell, Leaf, Languages, Shield, Wifi, WifiOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useI18n, SUPPORTED_LOCALES } from "../i18n"

const LOCALE_LABELS = { en: "EN", hi: "हिन्दी" }

/**
 * Sticky app header: brand, live online/offline pill, language switcher
 * and the officer dashboard shortcut.
 */
export default function Header({ onOpenOfficer }) {
  const { t, locale, changeLocale } = useI18n()
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  )
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  useEffect(() => {
    const handler = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const toggleLanguage = (code) => {
    changeLocale(code)
    setLangOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-green-100 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white shadow-sm shadow-green-600/30">
            <Leaf className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight text-green-950">{t("app.name")}</h1>
            <p className="text-[11px] font-medium text-gray-400">{t("app.tagline")}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Online / offline pill */}
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              isOnline
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
            role="status"
            title={isOnline ? "Online" : "Offline — AI still works on-device"}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                {t("common.online")}
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                {t("common.offline")}
              </>
            )}
          </span>

          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              aria-label={t("common.language")}
              aria-expanded={langOpen}
              onClick={() => setLangOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 text-green-700 transition hover:bg-green-50 active:scale-95"
            >
              <Languages className="h-4 w-4" />
            </button>
            {langOpen && (
              <div className="absolute top-11 right-0 z-40 w-36 overflow-hidden rounded-xl border border-green-100 bg-white shadow-lg">
                {SUPPORTED_LOCALES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleLanguage(code)}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 text-sm transition hover:bg-green-50 ${
                      locale === code ? "font-bold text-green-700" : "font-medium text-gray-600"
                    }`}
                  >
                    {LOCALE_LABELS[code]}
                    {locale === code && <span className="text-green-500">•</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Officer dashboard */}
          {typeof onOpenOfficer === "function" && (
            <button
              type="button"
              aria-label={t("nav.officer")}
              onClick={onOpenOfficer}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 text-green-700 transition hover:bg-green-50 active:scale-95"
            >
              <Shield className="h-4 w-4" />
            </button>
          )}

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