import {
  BookOpen,
  Cpu,
  Database,
  FlaskConical,
  Info,
  Layers,
  Leaf,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react"
import { useI18n } from "../i18n"

/**
 * About page — methodology, prototype stack, the real AI pipeline and an
 * honest prototype disclaimer.
 */
export default function AboutView({ onOpenDemo }) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-green-950">{t("about.title")}</h2>
        <p className="mt-0.5 text-xs text-gray-400">{t("app.concept")}</p>
      </div>

      {/* Model status */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-gray-400 uppercase">
            <Cpu className="h-3.5 w-3.5" />
            {t("model.version")}
          </p>
          <p className="mt-2 text-lg font-bold text-green-950">MobileNetV3-Small</p>
          <p className="text-[11px] text-gray-400">v0.1-demo · ONNX · on-device</p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-gray-400 uppercase">
            <Database className="h-3.5 w-3.5" />
            {t("model.knowledge_version")}
          </p>
          <p className="mt-2 text-lg font-bold text-green-950">v1.0</p>
          <p className="text-[11px] text-gray-400">10 classes · verified labels</p>
        </div>
      </section>

      {/* Pipeline */}
      <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-green-950">
          <Workflow className="h-4 w-4 text-green-600" />
          {t("about.pipeline")}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("about.pipeline_text")}</p>

        <ol className="mt-3 space-y-1.5">
          {[
            { icon: <Layers className="h-3.5 w-3.5" />, label: t("scan.step_quality") },
            { icon: <Cpu className="h-3.5 w-3.5" />, label: t("scan.step_detection") },
            { icon: <FlaskConical className="h-3.5 w-3.5" />, label: t("scan.step_severity") },
            { icon: <Network className="h-3.5 w-3.5" />, label: t("scan.step_environment") },
            { icon: <BookOpen className="h-3.5 w-3.5" />, label: t("scan.step_recommendation") },
          ].map((step, i) => (
            <li key={step.label} className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-600">
                {step.icon}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                {String(i + 1).padStart(2, "0")} · {step.label}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Stack */}
      <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-green-950">
          <Leaf className="h-4 w-4 text-green-600" />
          {t("about.stack")}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Vite · React", "onnxruntime-web", "IndexedDB", "FastAPI", "SQLite", "Leaflet", "Open-Meteo", "PWA/SW"].map(
            (chip) => (
              <span key={chip} className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                {chip}
              </span>
            ),
          )}
        </div>
      </section>

      {/* Offline guarantee */}
      <section className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
        <div>
          <p className="text-sm font-bold text-sky-900">Offline-first by design</p>
          <p className="mt-1 text-xs leading-relaxed text-sky-800">
            The AI model, knowledge base and scan history live on this device. Diagnostics keep working with no signal;
            sync uploads happen automatically once connectivity returns.
          </p>
        </div>
      </section>

      {/* Demo launcher */}
      <button
        type="button"
        onClick={onOpenDemo}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition hover:brightness-105 active:scale-[0.99]"
      >
        <Sparkles className="h-4 w-4" />
        {t("demo.mode")}
      </button>

      {/* Disclaimer */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
          <Info className="h-3.5 w-3.5" />
          {t("about.disclaimer")}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-amber-800">{t("about.disclaimer_text")}</p>
      </section>
    </div>
  )
}