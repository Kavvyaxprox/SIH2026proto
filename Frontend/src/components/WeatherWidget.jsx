import { Cloud, Droplets, Sun, Wind } from 'lucide-react'
import { WEATHER } from '../lib/mockData'

/**
 * 4. Sleek weather widget shown at the top of the Home dashboard.
 * Renders the mock weather summary with high-contrast text on a soft
 * sky-to-lawn gradient card.
 */
export default function WeatherWidget() {
  const humidityLevel =
    WEATHER.humidity >= 75 ? 'High' : WEATHER.humidity >= 50 ? 'Moderate' : 'Low'

  return (
    <section
      aria-label="Current weather"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-green-600 p-4 text-white shadow-lg shadow-sky-900/10"
    >
      {/* Decorative sun */}
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
          <p className="text-xs font-semibold tracking-wide text-white/80 uppercase">
            {WEATHER.place}
          </p>
          <p className="mt-1 text-4xl leading-none font-bold tracking-tight">
            {WEATHER.temperature}°C
          </p>
          <p className="mt-1.5 text-sm font-medium text-white/90">
            Feels like {WEATHER.feelsLike}°C · {WEATHER.condition}
          </p>
        </div>
      </div>

      <dl className="relative mt-4 grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-2 backdrop-blur-sm">
          <Droplets className="h-4 w-4 shrink-0 text-cyan-100" />
          <div className="leading-tight">
            <dt className="text-[10px] text-white/75">Humidity</dt>
            <dd className="text-sm font-semibold">{humidityLevel} {WEATHER.humidity}%</dd>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-2 backdrop-blur-sm">
          <Wind className="h-4 w-4 shrink-0 text-cyan-100" />
          <div className="leading-tight">
            <dt className="text-[10px] text-white/75">Wind</dt>
            <dd className="text-sm font-semibold">{WEATHER.windKph} km/h</dd>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-2 backdrop-blur-sm">
          <Cloud className="h-4 w-4 shrink-0 text-cyan-100" />
          <div className="leading-tight">
            <dt className="text-[10px] text-white/75">Conditions</dt>
            <dd className="text-sm leading-tight font-semibold">{WEATHER.condition}</dd>
          </div>
        </div>
      </dl>
    </section>
  )
}