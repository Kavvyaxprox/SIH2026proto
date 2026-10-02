import { ChevronDown, ChevronUp, Microscope } from "lucide-react"
import { useI18n } from "../i18n"

/**
 * A single review-queue case with the expert's decision controls.
 */
export default function ExpertReviewCard({ item, open, note, onNoteChange, onToggle, onDecide, disabled }) {
  const { t } = useI18n()
  const confidencePercent = Math.round((item.confidence ?? 0) * 100)

  return (
    <div className={`overflow-hidden rounded-xl border transition ${open ? "border-green-300 bg-green-50/50" : "border-green-100 bg-white"}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left">
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Microscope className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-green-950">
              {item.crop} — {item.disease}
            </span>
            <span className="mt-0.5 block text-[11px] text-gray-400">
              {t("expert.confidence")}: {confidencePercent}% · {item.severity_label ?? t("expert.severity_unknown")}
            </span>
          </span>
        </span>
        <span className="shrink-0 text-green-400">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {open && (
        <div className="border-t border-green-100 px-3.5 py-3">
          <p className="text-[11px] font-semibold text-green-800">{t("expert.ai_possible")}</p>
          <p className="mt-0.5 text-sm font-bold text-green-950">
            {item.crop} {item.disease}
          </p>

          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={2}
            placeholder={t("expert.note_placeholder")}
            className="mt-3 w-full resize-none rounded-xl border border-green-200 bg-white px-3 py-2 text-sm text-green-950 placeholder:text-gray-400 focus:border-green-400 focus:outline-none"
          />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onDecide("confirmed")}
              className="rounded-lg bg-emerald-600 px-2 py-2.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-50"
            >
              {t("expert.confirmed")}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onDecide("incorrect")}
              className="rounded-lg bg-rose-600 px-2 py-2.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-50"
            >
              {t("expert.incorrect")}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onDecide("more_info")}
              className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-2.5 text-xs font-semibold text-amber-700 transition active:scale-95 disabled:opacity-50"
            >
              {t("expert.more_info")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}