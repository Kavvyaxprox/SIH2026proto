import { Droplets, Thermometer, Wifi } from 'lucide-react'
import AlertBanner from './AlertBanner'
import ScanCard from './ScanCard'
import WeatherWidget from './WeatherWidget'
import { WEATHER } from '../lib/mockData'

/**
 * 1 + 4. Home dashboard.
 *
 * Composes the welcoming header content, the weather widget, the
 * humidity alert and the interactive "Scan Plant" card.
 *
 * @param {{ onImage: (file: File) => void, historyCount: number }} props
 */
export default function HomeDashboard({ onImage, historyCount }) {
  return (
    <div className="space-y-4">
      {/* Welcoming copy */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-green-950">
          Good morning, Farmer
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Let&apos;s keep your crops healthy today.
        </p>
      </div>

      <WeatherWidget />
      <AlertBanner />

      <ScanCard onImage={onImage} />

      {/* Quick glance strip */}
      <section className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-green-100 bg-white px-2 py-3 text-center shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
            <Thermometer className="h-4 w-4" />
          </span>
          <span className="text-lg leading-none font-bold text-green-950">
            {WEATHER.temperature}°
          </span>
          <span className="text-[11px] font-medium text-gray-500">Air Temp</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-green-100 bg-white px-2 py-3 text-center shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Droplets className="h-4 w-4" />
          </span>
          <span className="text-lg leading-none font-bold text-green-950">
            {WEATHER.humidity}%
          </span>
          <span className="text-[11px] font-medium text-gray-500">Humidity</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-green-100 bg-white px-2 py-3 text-center shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Wifi className="h-4 w-4" />
          </span>
          <span className="text-lg leading-none font-bold text-green-950">
            {historyCount}
          </span>
          <span className="text-[11px] font-medium text-gray-500">Saved Scans</span>
        </div>
      </section>
    </div>
  )
}