import { CheckCircle2, CloudOff, CloudUpload, X, Zap } from "lucide-react"
import { useState } from "react"
import { useI18n } from "../i18n"

const STEPS = [
  {
    key: "offline",
    icon: <CloudOff className="h-5 w-5" />,
    titleKey: "demo.offline_step",
    points: [
      "Open the Home tab",
      "Tap “Try a Demo Sample” and pick a labelled leaf",
      "Watch the 5-step on-device pipeline run with no network",
      "Result saves to local History as “pending sync”",
    ],
  },
  {
    key: "online",
    icon: <CloudUpload className="h-5 w-5" />,
    titleKey: "demo.online_step",
    points: [
      "Restore connectivity (network is back)",
      "Auto-sync fires; or open Sync Center → Sync Now",
      "Open the officer dashboard to see live aggregates",
      "Check the Expert Review queue for low-confidence cases",
    ],
  },
]

/**
 * Guided SIH demo walkthrough. Overlays the app with two clear stages:
 * offline-first diagnosis then connectivity restore + sync + dashboard.
 */
export default function DemoMode({ onClose }) {
  const { t } = useI18n()
  const [step, setStep] = useState(0)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("demo.mode")}
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-green-950">
            <Zap className="h-5 w-5 text-violet-600" />
            {t("demo.mode")}
          </h2>
          <button
            type="button"
            aria-label={t("demo.close")}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-green-100 text-green-700 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{t("demo.intro")}</p>

        {/* Progress dots */}
        <div className="mt-4 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`${t("demo.mode")} step ${i + 1}`}
              className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-violet-500" : "bg-gray-200"}`}
            />
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {STEPS.map((s, i) =>
            i === step ? (
              <div key={s.key} className="animate-fade-in rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
                <p className="flex items-start gap-2.5 text-sm leading-relaxed font-semibold text-violet-950">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
                    {s.icon}
                  </span>
                  {t(s.titleKey)}
                </p>
                <ul className="mt-3 space-y-2">
                  {s.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-xs text-violet-800">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-xl border border-green-300 bg-white py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 active:scale-[0.98]"
            >
              {t("common.back")}
            </button>
          )}
          <button
            type="button"
            onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : onClose())}
            className={`rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition hover:brightness-105 active:scale-[0.98] ${
              step === 0 ? "col-span-2" : ""
            }`}
          >
            {step < STEPS.length - 1 ? t("common.next") : t("demo.close")}
          </button>
        </div>
      </div>
    </div>
  )
}