import { Camera, ImagePlus, ScanLine } from 'lucide-react'
import { useRef } from 'react'

/**
 * 1. Interactive "Scan Plant" card.
 *
 * - "Take Photo" triggers a hidden `<input type="file" capture>` —
 *   mobile browsers will open the native camera app.
 * - "Upload Gallery" opens the standard file picker.
 *
 * Both funnel into `onImage(file)` so the parent can show the scanning
 * overlay and run the (mock) diagnosis.
 *
 * @param {{ onImage: (file: File) => void }} props
 */
export default function ScanCard({ onImage }) {
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const handleChange = (event) => {
    const [file] = event.target.files ?? []
    if (file) onImage(file)
    // Allow picking the same file again next time.
    event.target.value = null
  }

  return (
    <section
      aria-label="Scan a plant"
      className="relative overflow-hidden rounded-2xl border border-dashed border-green-300 bg-green-50/70 p-5 text-center"
    >
      {/* Hidden inputs wake the native camera / gallery. */}
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
        Scan Plant Health
      </h2>
      <p className="mx-auto mt-1 max-w-[16rem] text-xs leading-relaxed text-gray-500">
        Point your camera at a leaf to detect diseases early, right on your
        device.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition hover:brightness-105 active:scale-[0.98]"
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-white px-3 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100/60 active:scale-[0.98]"
        >
          <ImagePlus className="h-4 w-4" />
          Upload Gallery
        </button>
      </div>

      <p className="mt-3 text-[11px] font-medium text-green-700/80">
        100% on-device · no cloud needed
      </p>
    </section>
  )
}