import { ArrowRight, CheckCircle2, Cloud, CloudOff, HardDrive, Loader2, RefreshCw, Wifi } from "lucide-react"
import { useState } from "react"
import { useI18n } from "../i18n"
import { db } from "../services/db"
import { syncNow } from "../services/syncEngine"

/**
 * Sync Center — the visible control point of the offline-first engine.
 * Shows the on-device queue, last sync time and a manual "Sync Now"
 * action, plus a live connectivity badge.
 *
 * @param {object} props
 * @param {number} props.pendingCount
 * @param {() => void} props.onSynced
 */
export default function SyncCenter({ pendingCount, onSynced }) {
  const { t } = useI18n()
  const [state, setState] = useState("idle") // idle | running | success | error
  const [lastSync, setLastSync] = useState(() => {
    try {
      return localStorage.getItem("agriscan:lastSync") ?? t("sync.never")
    } catch {
      return t("sync.never")
    }
  })
  const [syncedRank, setSyncedRank] = useState(null)

  const handleSync = async () => {
    if (state === "running") return
    setState("running")
    try {
      const result = await syncNow()
      const nowLabel = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      setLastSync(nowLabel)
      try {
        localStorage.setItem("agriscan:lastSync", nowLabel)
      } catch {
        /* storage may be unavailable in exotic modes */
      }

      // The device-side history that became "synced" — check how our own
      // offline diagnoses got uploaded.
      try {
        const myHistory = await db.getAll("diagnoses")
        const synced = myHistory.filter((h) => (h.sync_status ?? h.syncStatus) === "synced")
        setSyncedRank(result?.count ?? synced.length)
      } catch {
        setSyncedRank(0)
      }

      setState("success")
      onSynced?.()
    } catch {
      setState("error")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-green-950">{t("sync.title")}</h2>
        <p className="mt-0.5 text-xs text-gray-400">{t("sync.queue_note")}</p>
      </div>

      {/* Connectivity pill */}
      <div
        className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold ${
          state === "success"
            ? "bg-emerald-100 text-emerald-700"
            : state === "error"
              ? "bg-rose-100 text-rose-700"
              : navigator.onLine
                ? "bg-sky-100 text-sky-700"
                : "bg-amber-100 text-amber-700"
        }`}
      >
        {navigator.onLine ? <Wifi className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
        {!navigator.onLine ? t("common.offline") : t("common.online")} ·{" "}
        {state === "success" ? t("sync.sync_success") : state === "error" ? t("sync.sync_failed") : t("sync.auto_on_reconnect")}
      </div>

      {/* Queue card */}
      <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-green-950">{t("sync.offline_queue")}</span>
          <span className="flex items-center gap-1 rounded-full border border-green-100 px-3 py-1 text-sm font-bold text-green-700">
            <HardDrive className="h-3.5 w-3.5" />
            {pendingCount}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{t("sync.queue_note")}</p>

        <button
          type="button"
          onClick={handleSync}
          disabled={pendingCount === 0 || state === "running"}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
            state === "success"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
              : "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/25 hover:brightness-105"
          }`}
        >
          {state === "running" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("sync.sync_in_progress")}
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              {t("common.sync_now")}
            </>
          )}
        </button>
      </section>

      {/* Flow illustration */}
      <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-green-950">Offline-first flow</p>
        <div className="mt-3 flex items-center justify-between gap-2 text-center">
          <FlowStep icon={<CloudOff className="h-5 w-5" />} label="Device" sub="camera → AI" />
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-green-300" />
          <FlowStep icon={<HardDrive className="h-5 w-5" />} label="Local store" sub="IndexedDB" />
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-green-300" />
          <FlowStep icon={<Cloud className="h-5 w-5" />} label="Cloud" sub="FastAPI" />
        </div>
      </section>

      {/* Last result strip */}
      {state === "success" && syncedRank != null && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-xs font-semibold text-emerald-800">
            {t("sync.sync_success")} · {syncedRank} {t("history.synced")}
          </p>
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] text-gray-400">
        Last sync {lastSync}
      </p>
    </div>
  )
}

function FlowStep({ icon, label, sub }) {
  return (
    <div className="flex w-full flex-col items-center gap-1.5 rounded-xl bg-green-50/70 px-2 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white">{icon}</span>
      <span className="text-xs font-bold text-green-950">{label}</span>
      <span className="-mt-0.5 text-[10px] text-gray-400">{sub}</span>
    </div>
  )
}