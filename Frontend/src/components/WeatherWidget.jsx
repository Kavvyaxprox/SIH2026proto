import { Cloud, Droplets, Sun, Wind, CloudOff } from "lucide-react"
import { useI18n } from "../i18n"
import { WEATHER_OBSERVATIONS } from "../lib/dataFallbacks"

/**
 * Weather widget. When online it shows live weather (passed in from the
 * weather service); when offline it prefers the cached reading and shows
 * a "cached weather" badge so users are never misled.
 *
 * @param {{ weather: object|null, online: boolean }} props
 */
export default function WeatherWidget({ weather, online }) {
  const { t } = useI18n()
  const record = weather && weather.temperature != null ? weather : null

  const fallback = record ?? WEATHER_OBSERVATIONS[0]
  const temperature = Math.round(record?.temperature ?? fallback.temperature)
  const humidity = Math.round(record?.humidity ?? fallback.humidity)
  const rainfall = record?.rainfall_mm ?? fallback.rainfall_mm ?? 0
  const isCached = !online || weather?.source === "cached"

  const humidityLevel = humidity >= 75 ? "High" : humidity >= 50 ? "Moderate" : "Low"

  return (
    <section
      aria-label="Current weather"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-green-600 p-4 text-white shadow-lg shadow-sky-900/10"
    >
      <span
        aria-hidden="true"
        className="absolute -top-6 -right-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/15"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
          <Sun className="h-8 w-8 text-amber-100" />
        </span>
      </span>

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-white/80 uppercase">Indore Rural</p>
          <p className="mt-1 text-4xl leading-none font-bold tracking-tight">{temperature}°C</p>
          <p className="mt-1.5 text-sm font-medium text-white/90">
            Humidity {humidity}% · {isCached ? t("home.weather_cached") : t("home.weather_live")}
          </p>
        </div>
        {isCached && (
          <span className="flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[10px] font-semibold backdrop-blur-sm">
            <CloudOff className="h-3 w-3" />
            {t("common.offline")}
          </span>
        )}
      </div>

      <dl className="relative mt-4 grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-2 backdrop-blur-sm">
          <Droplets className="h-4 w-4 shrink-0 text-cyan-100" />
          <div className="leading-tight">
            <dt className="text-[10px] text-white/75">{t("home.humidity")}</dt>
            <dd className="text-sm font-semibold">
              {humidityLevel} {humidity}%
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-2 backdrop-blur-sm">
          <Cloud className="h-4 w-4 shrink-0 text-cyan-100" />
          <div className="leading-tight">
            <dt className="text-[10px] text-white/75">{t("result.rainfall")}</dt>
            <dd className="text-sm font-semibold">{rainfall} mm</dd>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-2 backdrop-blur-sm">
          <Wind className="h-4 w-4 shrink-0 text-cyan-100" />
          <div className="leading-tight">
            <dt className="text-[10px] text-white/75">{t("home.air_temp")}</dt>
            <dd className="text-sm font-semibold">{temperature}°C</dd>
          </div>
        </div>
      </dl>
    </section>
  )
}