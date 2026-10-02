import {
  Activity,
  ArrowLeft,
  BarChart3,
  ClipboardCheck,
  Cloud,
  Gauge,
  Loader2,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
  Users,
  WifiOff,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useI18n } from "../i18n"
import { api } from "../services/api"
import ExpertReviewView from "./ExpertReviewView"
import RegionalMap from "./RegionalMap"

/**
 * Officer ("Agri Intelligence") dashboard.
 * Purely online: pulls live aggregates from the backend. Clearly labels
 * the risk model as a prototype so nothing is presented as ground truth.
 */
export default function OfficerDashboard({ onBack, online }) {
  const { t } = useI18n()
  const [stats, setStats] = useState(null)
  const [risk, setRisk] = useState(null)
  const [outbreaks, setOutbreaks] = useState({ count: 0, points: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [s, r, o] = await Promise.all([api.dashboardStats(), api.diseaseRisk(), api.outbreaks()])
      setStats(s)
      setRisk(r)
      setOutbreaks(o)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, online])

  const riskScore = risk?.risk?.score ?? null
  const riskLabel = risk?.risk?.label ?? "—"
  const riskTone =
    riskScore == null ? "bg-gray-100 text-gray-600"
      : riskScore >= 66 ? "bg-rose-100 text-rose-700"
        : riskScore >= 40 ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700"

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-green-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label={t("common.back")}
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 text-green-700 transition hover:bg-green-50 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight text-green-950">{t("officer.dashboard")}</h1>
              <p className="flex items-center gap-1 text-[11px] text-gray-400">
                <Users className="h-3 w-3" />
                {t("officer.regional_risk")} · Indore Rural
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!online && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <WifiOff className="h-3 w-3" />
                {t("common.offline")}
              </span>
            )}
            <button
              type="button"
              aria-label="Refresh"
              onClick={load}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 text-green-700 transition hover:bg-green-50 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 pt-4 pb-8">
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-green-100 bg-green-50/60 py-10 text-sm font-semibold text-green-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("common.loading")}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p className="text-sm font-bold text-rose-800">{t("common.offline")}</p>
            <p className="mt-1 text-xs text-rose-700">{t("sync.sync_failed")}</p>
            <button
              type="button"
              onClick={load}
              className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white active:scale-95"
            >
              {t("common.retry")}
            </button>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="space-y-4">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label={t("officer.total_cases")}
                value={stats.total_diagnoses}
                icon={<BarChart3 className="h-4 w-4" />}
                accent="bg-green-50 text-green-700"
              />
              <KpiCard
                label={t("officer.high_risk")}
                value={stats.high_severity}
                icon={<TriangleAlert className="h-4 w-4" />}
                accent="bg-rose-50 text-rose-600"
              />
              <KpiCard
                label={t("officer.expert_review")}
                value={stats.expert_review_due}
                icon={<ClipboardCheck className="h-4 w-4" />}
                accent="bg-amber-50 text-amber-600"
              />
              <KpiCard
                label={t("officer.synced")}
                value={stats.synced}
                icon={<Cloud className="h-4 w-4" />}
                accent="bg-sky-50 text-sky-600"
              />
            </div>

            {/* Top condition */}
            {stats.top_condition && (
              <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold tracking-wide text-gray-400 uppercase">{t("officer.top_condition")}</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-green-950">
                  {stats.top_condition.crop} — {stats.top_condition.disease}
                </p>
                <p className="text-xs text-gray-500">{stats.top_condition.count} cases</p>
              </section>
            )}

            {/* Risk gauge */}
            <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-gray-400 uppercase">
                <Gauge className="h-3.5 w-3.5" />
                {t("officer.regional_risk")}
              </p>
              <div className="mt-3 flex items-center gap-4">
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold ${riskTone}`}>
                  {riskScore ?? "—"}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-green-950">{riskLabel}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{t("officer.prototype_model")}</p>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${riskScore >= 66 ? "bg-rose-500" : riskScore >= 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${riskScore ?? 0}%` }}
                />
              </div>
            </section>

            {/* Severity distribution */}
            <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-gray-400 uppercase">
                <Activity className="h-3.5 w-3.5" />
                {t("officer.severity_dist")}
              </p>
              <SeverityBars data={stats.severity_distribution} />
            </section>

            {/* Timeline */}
            <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold tracking-wide text-gray-400 uppercase">{t("officer.timeline")}</p>
              <Timeline data={stats.timeline} />
            </section>

            {/* Regional outbreak map */}
            <section className="space-y-2">
              <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-green-950">
                <ShieldAlert className="h-4 w-4 text-green-700" />
                {t("officer.map")}
              </h2>
              <RegionalMap points={outbreaks.points} />
            </section>

            {/* Expert review queue */}
            <ExpertReviewView onUpdate={load} />
          </div>
        )}
      </main>
    </div>
  )
}

function KpiCard({ label, value, icon, accent }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-white p-3.5 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-2xl leading-none font-bold tracking-tight text-green-950">{value}</p>
      </div>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>{icon}</span>
    </div>
  )
}

function SeverityBars({ data = [] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const colors = { Mild: "bg-emerald-400", Moderate: "bg-amber-400", Severe: "bg-rose-500" }
  return (
    <div className="mt-3 space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-[11px] font-medium text-gray-500">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${colors[d.label] ?? "bg-green-400"}`}
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-[11px] font-bold text-gray-600">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

function Timeline({ data = [] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="mt-3 flex h-28 items-end gap-1">
      {data.map((d) => (
        <div key={d.date} className="group relative flex flex-1 flex-col items-center">
          <span className="mb-1 hidden rounded bg-gray-800 px-1 text-[9px] font-bold text-white group-hover:block">
            {d.count}
          </span>
          <div
            className={`w-full rounded-t bg-gradient-to-t from-green-600 to-lime-400 ${d.count === 0 ? "from-gray-200 to-gray-100" : ""}`}
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count === 0 ? 4 : 6 }}
          />
        </div>
      ))}
    </div>
  )
}