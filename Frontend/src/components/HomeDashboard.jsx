import { Droplets, RefreshCw, Thermometer } from "lucide-react"
import { useEffect, useState } from "react"
import { useI18n } from "../i18n"
import { resolveWeather } from "../services/weather"
import AlertBanner from "./AlertBanner"
import ScanCard from "./ScanCard"
import WeatherWidget from "./WeatherWidget"

/**
 * Home dashboard for the farmer: weather context, risk alert, scan entry
 * and a quick-glance strip (temperature / humidity / scans / pending).
 */
export default function HomeDashboard({ onImage, onDemoSample, historyCount, pendingCount, online }) {
  const { t } = useI18n()
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    let active = true
    resolveWeather(22.7, 75.9, online).then((data) => {
      if (active) setWeather(data)
    })
    return () => {
      active = false
    }
  }, [online])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-green-950">{t("home.greeting")}</h2>
        <p className="mt-0.5 text-xs text-gray-500">{t("home.greeting_note")}</p>
      </div>

      <WeatherWidget weather={weather} online={online} />
      <AlertBanner humidity={weather?.humidity} />

      <ScanCard onImage={onImage} onDemoSample={onDemoSample} />

      {/* Quick glance strip */}
      <section className="grid grid-cols-4 gap-2.5">
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-green-100 bg-white px-1 py-3 text-center shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
            <Thermometer className="h-4 w-4" />
          </span>
          <span className="text-lg leading-none font-bold text-green-950">
            {weather?.temperature != null ? `${Math.round(weather.temperature)}°` : "—"}
          </span>
          <span className="text-[11px] font-medium text-gray-500">{t("home.air_temp")}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-green-100 bg-white px-1 py-3 text-center shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Droplets className="h-4 w-4" />
          </span>
          <span className="text-lg leading-none font-bold text-green-950">
            {weather?.humidity != null ? `${Math.round(weather.humidity)}%` : "—"}
          </span>
          <span className="text-[11px] font-medium text-gray-500">{t("home.humidity")}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-green-100 bg-white px-1 py-3 text-center shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ScanIcon />
          </span>
          <span className="text-lg leading-none font-bold text-green-950">{historyCount}</span>
          <span className="text-[11px] font-medium text-gray-500">{t("home.saved_scans")}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-amber-100 bg-amber-50/60 px-1 py-3 text-center shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <RefreshCw className="h-4 w-4" />
          </span>
          <span className="text-lg leading-none font-bold text-amber-800">{pendingCount}</span>
          <span className="text-[11px] font-medium text-amber-700">{t("common.pending_sync")}</span>
        </div>
      </section>
    </div>
  )
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </svg>
  )
}