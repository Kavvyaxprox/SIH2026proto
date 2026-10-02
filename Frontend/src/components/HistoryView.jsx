import { CalendarDays, ChevronRight, CloudOff, CloudUpload, Leaf, Trash2 } from "lucide-react"
import { useI18n } from "../i18n"
import LeafArt from "./LeafArt"

const SEVERITY_DOT = {
  Mild: "bg-green-500",
  Moderate: "bg-amber-500",
  Severe: "bg-rose-500",
}

/**
 * Scan history tab, backed by the on-device IndexedDB store so entries
 * survive reloads and work fully offline. Each row shows its sync state.
 */
export default function HistoryView({ history, onOpen, onClear }) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-green-950">{t("history.title")}</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            {history.length} {t("history.subtitle")}
          </p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("history.clear")}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 px-6 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <LeafArt className="h-10 w-10" />
          </div>
          <p className="mt-4 text-sm font-semibold text-green-950">{t("history.no_scans")}</p>
          <p className="mx-auto mt-1 max-w-[15rem] text-xs leading-relaxed text-gray-500">
            {t("history.no_scans_note")}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map((scan) => {
            const disease = scan.disease ?? "Unknown"
            const crop = scan.crop ?? ""
            const title = crop ? `${crop} — ${disease}` : disease
            return (
              <li key={scan.id}>
                <button
                  type="button"
                  onClick={() => onOpen(scan)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-green-100 bg-white p-3 text-left shadow-sm transition hover:border-green-200 hover:bg-green-50/50 active:scale-[0.99]"
                >
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-green-100 bg-green-950">
                    {scan.thumbnail ? (
                      <img src={scan.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-green-600">
                        <Leaf className="h-6 w-6" />
                      </span>
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="block truncate text-sm font-bold text-green-950">{title}</span>
                      {scan.isDemoSample && (
                        <span className="shrink-0 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">
                          {t("common.demo_sample")}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {new Date(scan.createdAt ?? scan.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          SEVERITY_DOT[scan.severityLabel ?? "Moderate"] ?? SEVERITY_DOT.Moderate
                        }`}
                      />
                      <span className="text-[11px] font-medium text-gray-500">
                        {scan.severityLabel ?? "Mild"} · {scan.confidencePercent ?? Math.round((scan.confidence ?? 0) * 100)}%{" "}
                        {t("result.confidence")}
                      </span>
                    </span>
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        scan.syncStatus === "synced"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {scan.syncStatus === "synced" ? (
                        <>
                          <CloudUpload className="h-3 w-3" />
                          {t("history.synced")}
                        </>
                      ) : (
                        <>
                          <CloudOff className="h-3 w-3" />
                          {t("history.pending")}
                        </>
                      )}
                    </span>
                  </span>

                  <ChevronRight className="h-4 w-4 shrink-0 text-green-300" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-[11px] text-gray-400">
        <CloudOff className="h-3.5 w-3.5" />
        {t("history.local_note")}
      </p>
    </div>
  )
}