import { AlertTriangle } from 'lucide-react'
import { HUMIDITY_ALERT } from '../lib/mockData'

/**
 * 4. Proactive disease-risk alert rendered right below the weather
 * widget. Uses an amber/earth tone so it is clearly distinguishable
 * from success-oriented greens elsewhere in the app.
 */
export default function AlertBanner() {
  return (
    <section
      role="alert"
      aria-label="Disease risk alert"
      className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3.5"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm shadow-amber-500/30">
        <AlertTriangle className="h-4 w-4" />
      </span>
      <div className="leading-snug">
        <p className="text-sm font-bold text-amber-900">Alert: High humidity detected.</p>
        <p className="mt-0.5 text-xs text-amber-800">{HUMIDITY_ALERT}</p>
      </div>
    </section>
  )
}