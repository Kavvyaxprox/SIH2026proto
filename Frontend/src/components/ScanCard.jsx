import { Camera, FlaskConical, ImagePlus, ScanLine, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "../i18n"
import { getSamples } from "../services/demoSamples"

/**
 * Interactive "Scan Plant" card.
 *
 * - "Take Photo" opens the native camera via a hidden capture input.
 * - "Upload Gallery" opens the file picker.
 * - "Try a Demo Sample" loads a bundled, verified sample image for a
 *   reliable offline demo run (clearly labelled "Demo Sample").
 */
export default function ScanCard({ onImage, onDemoSample }) {
  const { t } = useI18n()
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [samples, setSamples] = useState([])

  useEffect(() => {
    if (!pickerOpen) return
    let active = true
    getSamples()
      .then((list) => active && setSamples(list))
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [pickerOpen])

  const handleChange = (event) => {
    const [file] = event.target.files ?? []
    if (file) onImage(file)
    event.target.value = null
  }

  return (
    <>
      <section
        aria-label="Scan a plant"
        className="relative overflow-hidden rounded-2xl border border-dashed border-green-300 bg-green-50/70 p-5 text-center"
      >
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleChange}
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-100 to-green-200 text-green-700">
          <ScanLine className="h-7 w-7" />
        </div>

        <h2 className="mt-3 text-lg font-bold tracking-tight text-green-950">
          {t("home.scan_plant")}
        </h2>
        <p className="mx-auto mt-1 max-w-[16rem] text-xs leading-relaxed text-gray-500">
          {t("home.scan_note")}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition hover:brightness-105 active:scale-[0.98]"
          >
            <Camera className="h-4 w-4" />
            {t("home.take_photo")}
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-white px-3 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100/60 active:scale-[0.98]"
          >
            <ImagePlus className="h-4 w-4" />
            {t("home.upload_gallery")}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 active:scale-[0.98]"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          {t("home.try_demo_sample")}
        </button>

        <p className="mt-3 text-[11px] font-medium text-green-700/80">
          {t("home.on_device_note")}
        </p>
      </section>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setPickerOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("home.try_demo_sample")}
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold tracking-tight text-green-950">
                {t("home.try_demo_sample")}
              </h3>
              <button
                type="button"
                aria-label={t("common.cancel")}
                onClick={() => setPickerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-green-100 text-green-700 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t("home.demo_sample_note")}</p>

            <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {samples.map((sample) => (
                <li key={sample.file}>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerOpen(false)
                      onDemoSample(sample)
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-green-100 bg-green-50/50 p-2.5 text-left transition hover:border-green-300 active:scale-[0.99]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-100 text-[10px] font-bold text-green-700">
                      {sample.crop}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-green-950">
                        {sample.crop} — {sample.disease}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-gray-500">
                        {t("common.demo_sample")} · verified label
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {samples.length === 0 && (
                <li className="py-6 text-center text-xs text-gray-400">{t("common.loading")}</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}