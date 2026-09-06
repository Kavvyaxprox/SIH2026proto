import { Cpu } from 'lucide-react'
import LeafArt from './LeafArt'

/**
 * 1. Full-screen "Scanning…" overlay shown while the mock AI analyses
 * the captured image.
 *
 * The laser (a thin gradient line) animates up and down over the leaf
 * frame using the `animate-scan-laser` keyframes defined in index.css.
 *
 * @param {{ title?: string }} props
 */
export default function ScanningOverlay({
  title = 'Analyzing your plant…',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Scanning is in progress"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-950/90 px-6 backdrop-blur-sm"
    >
      {/* Bouncing leaf inside the scanning frame */}
      <div className="relative flex h-52 w-52 items-center justify-center rounded-3xl border border-green-400/30 bg-green-900/60">
        {/* Corner brackets */}
        <span className="absolute -top-px -left-px h-8 w-8 rounded-tl-3xl border-t-4 border-l-4 border-lime-300" />
        <span className="absolute -top-px -right-px h-8 w-8 rounded-tr-3xl border-t-4 border-r-4 border-lime-300" />
        <span className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-lime-300" />
        <span className="absolute -right-px -bottom-px h-8 w-8 rounded-br-3xl border-r-4 border-b-4 border-lime-300" />

        {/* Laser line sweeping the frame */}
        <div
          aria-hidden="true"
          className="animate-scan-laser absolute inset-x-4 h-[3px] rounded-full bg-gradient-to-r from-transparent via-lime-300 to-transparent shadow-[0_0_18px_2px_rgba(163,230,53,0.7)]"
        />

        {/* Scanning landmark */}
        <div className="animate-float text-lime-300">
          <LeafArt className="h-24 w-24" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-green-200/80">
          <Cpu className="h-3.5 w-3.5 animate-pulse-soft" />
          Running on-device AI model
        </p>
      </div>

      {/* Indeterminate progress bar */}
      <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-green-800">
        <div className="animate-progress h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-400" />
      </div>
    </div>
  )
}