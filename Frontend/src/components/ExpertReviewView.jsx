import { CheckCircle2, ClipboardCheck, Loader2, Send } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useI18n } from "../i18n"
import { api } from "../services/api"
import ExpertReviewCard from "./ExpertReviewCard"

/**
 * Expert review queue built from backend low-confidence cases.
 * The expert decides: confirm / incorrect / need more info — with an
 * optional note. Decisions are POSTed to the backend.
 */
export default function ExpertReviewView({ onUpdate }) {
  const { t } = useI18n()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCaseId, setActiveCaseId] = useState(null)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [lastDecision, setLastDecision] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const queue = await api.reviewQueue()
      setCases(queue.cases ?? [])
    } catch {
      setCases([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submit = async (decision) => {
    if (!activeCaseId) return
    setSaving(true)
    try {
      await api.submitReview(activeCaseId, decision, note)
      setCases((prev) => prev.filter((c) => c.id !== activeCaseId))
      setLastDecision({ decision, caseId: activeCaseId })
      setActiveCaseId(null)
      setNote("")
      onUpdate?.()
    } catch {
      /* surface via banner below */
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-green-950">
        <ClipboardCheck className="h-4 w-4 text-green-700" />
        {t("expert.queue")}
        <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
          {cases.length}
        </span>
      </h2>

      {loading && (
        <div className="mt-3 flex items-center justify-center gap-2 py-6 text-xs font-semibold text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.loading")}
        </div>
      )}

      {!loading && cases.length === 0 && (
        <div className="mt-3 rounded-xl bg-green-50 px-4 py-6 text-center">
          <CheckCircle2 className="mx-auto h-6 w-6 text-green-500" />
          <p className="mt-2 text-sm font-semibold text-green-800">{t("expert.queue_empty")}</p>
        </div>
      )}

      {!loading && cases.length > 0 && (
        <ul className="mt-3 space-y-2.5">
          {cases.map((c) => (
            <li key={c.id}>
              <ExpertReviewCard
                item={c}
                open={activeCaseId === c.id}
                note={note}
                onNoteChange={setNote}
                onToggle={() => setActiveCaseId((prev) => (prev === c.id ? null : c.id))}
                disabled={saving}
                onDecide={submit}
              />
            </li>
          ))}
        </ul>
      )}

      {lastDecision && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <Send className="h-3.5 w-3.5" />
            {t("expert.decision_saved")}
          </p>
          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white capitalize">
            {lastDecision.decision}
          </span>
        </div>
      )}
    </section>
  )
}