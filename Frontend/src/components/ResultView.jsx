import {
  ArrowLeft,
  CalendarDays,
  FlaskConical,
  Leaf,
  ListChecks,
  ScanLine,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'
import CircularProgress from './CircularProgress'
import TreatmentPlan from './TreatmentPlan'

const SEVERITY_STYLES = {
  Low: 'border-green-200 bg-green-50 text-green-700',
  Moderate: 'border-amber-200 bg-amber-50 text-amber-700',
  High: 'border-rose-200 bg-rose-50 text-rose-700',
}

/** Builds the full voice script read by the Text-to-Speech button. */
function buildSpeechText(scan) {
  const d = scan.disease
  const organic = d.organic.map((o) => ` — ${o.name}. ${o.detail}`).join('')
  const chemical = d.chemical
    .map((c) => ` — ${c.name}, at ${c.dosage}, ${c.frequency}. ${c.note}`)
    .join('')
  return [
    `Diagnosis: ${d.name}, detected with ${d.confidence} percent confidence.`,
    `Cause: ${d.pathogen}.`,
    d.summary,
    `For organic treatment:${organic}`,
    `For chemical treatment:${chemical}`,
  ].join(' ')
}

/**
 * 2. Results dashboard shown after a scan completes.
 *
 * Displays the captured thumbnail, the AI diagnosis, a circular
 * confidence score, the treatment plan tabs and a "Read Aloud" button
 * that speaks the result via the native SpeechSynthesis API.
 *
 * @param {{ scan: object, onBack: () => void, onScanAgain: () => void }} props
 */
export default function ResultView({ scan, onBack, onScanAgain }) {
  const { supported, speaking, speak, stop } = useSpeech()
  const { disease, thumbnail, date } = scan

  const severityStyle = SEVERITY_STYLES[disease.severity] ?? SEVERITY_STYLES.Moderate

  return (
    <div className="animate-slide-up min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 text-green-700 transition hover:bg-green-50 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
          <Sparkles className="h-3.5 w-3.5" />
          Diagnostic Report
        </div>

        {/* Text-to-speech toggle */}
        {supported && (
          <button
            type="button"
            onClick={() =>
              speaking ? stop() : speak(buildSpeechText(scan))
            }
            aria-pressed={speaking}
            aria-label={speaking ? 'Stop reading the report aloud' : 'Read the report aloud'}
            className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition active:scale-95 ${
              speaking
                ? 'border-emerald-300 bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'border-green-100 text-green-700 hover:bg-green-50'
            }`}
          >
            {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {speaking ? 'Stop' : 'Read'}
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {/* Captured image card */}
        <section className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-green-950 shadow-lg shadow-green-900/20">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={`Uploaded leaf showing signs of ${disease.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Leaf className="h-20 w-20 text-green-600" />
            </div>
          )}

          {/* Diagnosis badge */}
          <div className="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            {disease.name}
          </div>
          {/* Confidence pill */}
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-white backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
            </span>
            <span className="text-sm leading-none font-bold">{disease.confidence}%</span>
            <span className="text-[11px] leading-none text-green-100/80">AI confidence</span>
          </div>
        </section>

        {/* Diagnosis summary */}
        <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-green-950">
              {disease.name}
            </h2>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${severityStyle}`}>
              Severity {disease.severity}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400 italic">{disease.pathogen}</p>
          <p className="mt-2.5 text-sm leading-relaxed text-gray-600">{disease.summary}</p>

          {/* Confidence ring + scan meta */}
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-green-50/70 p-3">
            <div className="min-w-0">
              <ListChecks className="h-4 w-4 text-green-600" />
              <p className="mt-1.5 text-xs font-medium text-green-800">
                {disease.symptoms.length} symptoms matched
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(date).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                <ScanLine className="h-3 w-3" />
                On-device scan
              </p>
            </div>
            <CircularProgress value={disease.confidence} />
          </div>
        </section>

        {/* Likely symptoms */}
        <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-green-950">
            <FlaskConical className="h-4 w-4 text-green-600" />
            Observable Symptoms
          </h3>
          <ul className="mt-2.5 space-y-2">
            {disease.symptoms.map((symptom) => (
              <li key={symptom} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {symptom}
              </li>
            ))}
          </ul>
        </section>

        {/* Treatment tabs */}
        <TreatmentPlan organic={disease.organic} chemical={disease.chemical} />

        {/* Prevention */}
        <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <h3 className="text-base font-bold tracking-tight text-green-950">
            Preventative Care
          </h3>
          <ul className="mt-2.5 space-y-2">
            {disease.prevention.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-gray-600">
                <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pb-2">
          <button
            type="button"
            onClick={onScanAgain}
            className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-white py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 active:scale-[0.98]"
          >
            <ScanLine className="h-4 w-4" />
            Scan Again
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition hover:brightness-105 active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}