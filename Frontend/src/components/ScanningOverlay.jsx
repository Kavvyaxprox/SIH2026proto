import { Cpu, Leaf, Loader2, Check, X } from "lucide-react"
import { useI18n } from "../i18n"

const STEP_LABEL_KEYS = [
  "scan.step_quality",
  "scan.step_detection",
  "scan.step_severity",
  "scan.step_environment",
  "scan.step_recommendation",
]

/**
 * Full-screen analysing overlay that walks through the real pipeline
 * stages so users can see each step completing.
 *
 * @param {{
 *   currentStep: number,               // index into STEP_LABEL_KEYS
 *   completedSteps: number[],          // indexes whose steps finished
 *   qualityFailed?: string|null,       // quality error code
 *   image?: {src:string, alt:string}|null,
 * }} props
 */
export default function ScanningOverlay({
  currentStep = 0,
  completedSteps = [],
  qualityFailed = null,
  image = null,
}) {
  const { t } = useI18n()

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-950/95 px-6 backdrop-blur-sm"
    >
      {/* Crop frame with the captured preview */}
      <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-3xl border border-green-400/30 bg-green-900/60">
        {image?.src ? (
          <img src={image.src} alt={image.alt ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="animate-float text-lime-300">
            <Leaf className="h-16 w-16" />
          </div>
        )}

        {!qualityFailed && (
          <div
            aria-hidden="true"
            className="animate-scan-laser absolute inset-x-4 h-[3px] rounded-full bg-gradient-to-r from-transparent via-lime-300 to-transparent shadow-[0_0_18px_2px_rgba(163,230,53,0.7)]"
          />
        )}
        {qualityFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-rose-950/70">
            <X className="h-10 w-10 text-rose-300" />
          </div>
        )}
      </div>

      <div className="mt-6 w-full max-w-xs text-center">
        <p className="text-base font-semibold text-white">
          {qualityFailed ? t("scan.quality_fail") : t("scan.analyzing")}
        </p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-green-200/80">
          <Cpu className="h-3.5 w-3.5 animate-pulse-soft" />
          {t("scan.on_device_ai")}
        </p>
      </div>

      {/* Pipeline steps */}
      <ol className="mt-6 w-full max-w-xs space-y-2.5">
        {STEP_LABEL_KEYS.map((key, index) => {
          const done = completedSteps.includes(index)
          const active = currentStep === index && !done
          return (
            <li key={key} className="flex items-center gap-3 text-left">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  qualityFailed && index === 0
                    ? "bg-rose-500 text-white"
                    : done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-lime-400 text-green-950"
                        : "bg-green-800 text-green-300"
                }`}
              >
                {qualityFailed && index === 0 ? (
                  <X className="h-3.5 w-3.5" />
                ) : done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`text-sm ${
                  done ? "font-medium text-emerald-200" : active ? "font-semibold text-white" : "text-green-400/70"
                }`}
              >
                {t(key)}
              </span>
            </li>
          )
        })}
      </ol>

      {qualityFailed && (
        <p className="mt-4 max-w-xs text-center text-xs leading-relaxed text-rose-200">
          {t("scan.quality_retake")}
        </p>
      )}

      {/* Indeterminate progress bar */}
      <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-green-800">
        <div className="animate-progress h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-400" />
      </div>
    </div>
  )
}