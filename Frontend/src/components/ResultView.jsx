import {
  ArrowLeft,
  CalendarDays,
  Droplets,
  FlaskConical,
  Leaf,
  ListChecks,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useSpeech } from "../hooks/useSpeech"
import { useI18n } from "../i18n"
import CircularProgress from "./CircularProgress"

const SEVERITY_LABEL_KEYS = {
  Mild: "result.severity_mild",
  Moderate: "result.severity_moderate",
  Severe: "result.severity_severe",
}

const CONFIDENCE_STYLES = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-rose-200 bg-rose-50 text-rose-700",
}

function severityColor(score) {
  if (score <= 30) return "from-lime-400 to-green-500"
  if (score <= 60) return "from-amber-400 to-orange-500"
  return "from-rose-500 to-red-600"
}

/**
 * Full diagnostic report: prediction, confidence, severity meter,
 * environmental context, recommendations and save/sync state.
 */
export default function ResultView({ scan, failure, onBack, onScanAgain }) {
  const { t } = useI18n()
  const { supported, speaking, speak, stop } = useSpeech()

  // ---- Failure states ------------------------------------------------------
  if (failure) {
    const isQuality = failure.type === "quality"
    return (
      <div className="animate-slide-up min-h-full">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label={t("common.back")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 text-green-700 transition hover:bg-green-50 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
            {isQuality ? t("scan.quality_fail") : "Model unavailable"}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            {isQuality ? (
              <ScanLine className="h-7 w-7" />
            ) : (
              <FlaskConical className="h-7 w-7" />
            )}
          </div>
          <h2 className="mt-4 text-lg font-bold tracking-tight text-rose-950">
            {isQuality
              ? t("scan.quality_fail")
              : t("result.low_confidence_note")}
          </h2>
          <p className="mx-auto mt-1.5 max-w-[18rem] text-sm leading-relaxed text-rose-800">
            {isQuality
              ? t("scan.quality_retake")
              : `${t("result.retake_advice")} (${failure?.message ?? ""})`}
          </p>
          {failure.quality && (
            <dl className="mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-xl bg-white/70 p-3">
                <dt className="text-[10px] text-gray-500">Blur score</dt>
                <dd className="mt-0.5 text-sm font-bold text-rose-900">{failure.quality.blurScore}</dd>
              </div>
              <div className="rounded-xl bg-white/70 p-3">
                <dt className="text-[10px] text-gray-500">Brightness</dt>
                <dd className="mt-0.5 text-sm font-bold text-rose-900">{failure.quality.brightness}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onScanAgain}
            className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-white py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 active:scale-[0.98]"
          >
            <ScanLine className="h-4 w-4" />
            {t("result.scan_again")}
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
    )
  }

  if (!scan) return null

  const {
    crop,
    disease,
    confidencePercent,
    confidenceTier: tier,
    lowConfidence,
    severity,
    severityLabel,
    weather,
    envRisk,
    envRiskLabel,
    pathogen = "",
    summary = "",
    symptoms = [],
    recommendations = {},
    isDemoSample,
    createdAt,
    syncStatus,
  } = scan

  const severityKey = SEVERITY_LABEL_KEYS[severityLabel] ?? "result.severity_moderate"
  const confidenceLabel =
    tier === "high"
      ? t("result.confirm_confidence_high")
      : tier === "medium"
        ? t("result.confirm_confidence_medium")
        : t("result.low_confidence")

  return (
    <div className="animate-slide-up min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("common.back")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 text-green-700 transition hover:bg-green-50 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          {isDemoSample && (
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700">
              {t("common.demo_sample")}
            </span>
          )}
          <div className="rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
            {t("result.title")}
          </div>
        </div>

        {supported && (
          <button
            type="button"
            onClick={() =>
              speaking ? stop() : speak(`${crop} ${disease}. ${confidencePercent} percent confidence. ${summary ?? ""}`)
            }
            aria-pressed={speaking}
            aria-label={speaking ? "Stop reading" : "Read the report aloud"}
            className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition active:scale-95 ${
              speaking
                ? "border-emerald-300 bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                : "border-green-100 text-green-700 hover:bg-green-50"
            }`}
          >
            {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {speaking ? t("result.stop") : t("result.read")}
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {/* Captured image */}
        <section className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-green-950 shadow-lg shadow-green-900/20">
          {scan.thumbnail ? (
            <img src={scan.thumbnail} alt={`${crop} leaf showing ${disease}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Leaf className="h-20 w-20 text-green-600" />
            </div>
          )}

          <div className="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            {crop} — {disease}
          </div>
          <div className="absolute right-3 bottom-3 rounded-full bg-black/55 px-3 py-1.5 text-white backdrop-blur-sm">
            <span className="text-sm leading-none font-bold">{confidencePercent}%</span>{" "}
            <span className="text-[11px] text-green-100/80">{t("result.confidence")}</span>
          </div>
        </section>

        {/* Diagnosis summary */}
        <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-green-950">
              {crop} {disease}
            </h2>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${CONFIDENCE_STYLES[tier]}`}>
              {confidenceLabel}
            </span>
          </div>
          {pathogen && <p className="mt-0.5 text-xs text-gray-400 italic">{pathogen}</p>}
          {summary && <p className="mt-2.5 text-sm leading-relaxed text-gray-600">{summary}</p>}

          {/* Confidence ring + meta */}
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-green-50/70 p-3">
            <div className="min-w-0">
              <ListChecks className="h-4 w-4 text-green-600" />
              <p className="mt-1.5 text-xs font-medium text-green-800">
                {symptoms.length} {t("result.symptoms").toLowerCase()}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <CalendarDays className="h-3.5 w-3.5" />
                {createdAt
                  ? new Date(createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                <ScanLine className="h-3 w-3" />
                On-device model v0.1-demo
              </p>
            </div>
            <CircularProgress value={confidencePercent} />
          </div>

          {/* Expert review / low confidence callout */}
          {lowConfidence && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <p className="text-xs font-bold text-rose-800">{t("result.expert_review_required")}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-rose-700">
                  {t("result.low_confidence_note")} {t("result.retake_advice")}
                </p>
              </div>
            </div>
          )}

          {/* Severity meter */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-green-900">{t("result.severity_index")}</span>
              <span className="text-green-700">
                {severity}/100 · {t(severityKey)}
              </span>
            </div>
            <div
              className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-green-100"
              role="progressbar"
              aria-valuenow={severity}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("result.severity_index")}
            >
              <div
                className={`h-full rounded-full bg-gradient-to-r ${severityColor(severity)}`}
                style={{ width: `${severity}%`, transition: "width 800ms cubic-bezier(0.16,1,0.3,1)" }}
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              Prototype severity estimator ({t("about.disclaimer_text").split(". ")[0]}).
            </p>
          </div>
        </section>

        {/* Environmental context */}
        <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-green-950">
            <Droplets className="h-4 w-4 text-sky-600" />
            {t("result.environment")}
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-sky-50 p-3 text-center">
              <p className="text-[10px] font-medium text-sky-700">{t("result.temperature")}</p>
              <p className="mt-1 text-lg font-bold text-sky-950">
                {weather?.temperature != null ? `${Math.round(weather.temperature)}°C` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-3 text-center">
              <p className="text-[10px] font-medium text-cyan-700">{t("result.humidity_label")}</p>
              <p className="mt-1 text-lg font-bold text-cyan-950">
                {weather?.humidity != null ? `${Math.round(weather.humidity)}%` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3 text-center">
              <p className="text-[10px] font-medium text-indigo-700">{t("result.rainfall")}</p>
              <p className="mt-1 text-lg font-bold text-indigo-950">
                {weather?.rainfallMm != null ? `${weather.rainfallMm} mm` : "—"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-green-100 bg-green-50/60 p-3">
            <span className="text-xs font-semibold text-green-900">{t("result.environmental_risk")}</span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                envRisk >= 66
                  ? "bg-rose-100 text-rose-700"
                  : envRisk >= 40
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {envRiskLabel}
            </span>
          </div>

          <p className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
            {weather?.sourceLive ? (
              <CloudLive className="h-3 w-3" />
            ) : (
              <CloudOffIl className="h-3 w-3" />
            )}
            {weather?.sourceLive ? t("result.weather_source_live") : t("result.weather_source_cached")}
          </p>
        </section>

        {/* Recommendations */}
        <section className="space-y-3">
          {(recommendations.immediate ?? []).length > 0 && (
            <RecCard title={t("result.rec_immediate")} icon={<ShieldAlertIcon className="h-4 w-4 text-amber-600" />}>
              <ul className="mt-2.5 space-y-2">
                {recommendations.immediate.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </RecCard>
          )}

          {(recommendations.prevention ?? []).length > 0 && (
            <RecCard title={t("result.rec_prevention")} icon={<Leaf className="h-4 w-4 text-green-600" />}>
              <ul className="mt-2.5 space-y-2">
                {recommendations.prevention.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </RecCard>
          )}

          {(recommendations.treatment ?? []).length > 0 && (
            <RecCard
              title={t("result.rec_treatment")}
              icon={<FlaskConical className="h-4 w-4 text-violet-600" />}
              note={t("result.guidance_only")}
            >
              <ul className="mt-2.5 space-y-2.5">
                {recommendations.treatment.map((item) => (
                  <li key={item.name} className="rounded-xl border border-green-100 bg-green-50/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-green-950">{item.name}</p>
                      <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                        {item.dosage}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{item.frequency}</p>
                    {item.note && <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{item.note}</p>}
                  </li>
                ))}
              </ul>
            </RecCard>
          )}

          {recommendations.contact && (
            <RecCard
              title={t("result.rec_contact")}
              icon={<PhoneIcon className="h-4 w-4 text-sky-600" />}
            >
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{recommendations.contact}</p>
            </RecCard>
          )}
        </section>

        {/* Save / sync footer */}
        <section className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
          <div className="flex items-center gap-2">
            <CloudOffIl className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs font-bold text-amber-900">{t("result.saved_pending")}</p>
              <p className="text-[10px] text-amber-700">
                {syncStatus === "synced" ? t("history.synced") : t("common.pending_sync")}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white">
            {t("sync.pending_count")}
          </span>
        </section>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pb-2">
          <button
            type="button"
            onClick={onScanAgain}
            className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-white py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 active:scale-[0.98]"
          >
            <ScanLine className="h-4 w-4" />
            {t("result.scan_again")}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition hover:brightness-105 active:scale-[0.98]"
          >
            {t("result.done")}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---- small local helpers -------------------------------------------------- */

function RecCard({ title, icon, note, children }) {
  return (
    <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
      <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-green-950">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50">{icon}</span>
        {title}
      </h3>
      {note && <p className="mt-1.5 text-[11px] text-gray-400 italic">{note}</p>}
      {children}
    </section>
  )
}

function CloudLive({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 14.9" />
    </svg>
  )
}
function CloudOffIl({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20.35 14.65A4 4 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" />
      <path d="m1 1 22 22" />
    </svg>
  )
}
function ShieldAlertIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 2 4 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-8-3Z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}
function PhoneIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
    </svg>
  )
}