import {
  AlertIcon,
  BackIcon,
  DropIcon,
  LeafIcon,
  SprayIcon,
  ThermometerIcon,
  WarningIcon,
} from './icons'

function FarmImage() {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="as-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6ecdc" />
          <stop offset="55%" stopColor="#edf7ee" />
          <stop offset="100%" stopColor="#f8fbf3" />
        </linearGradient>
        <linearGradient id="as-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fc992" />
          <stop offset="100%" stopColor="#7fb273" />
        </linearGradient>
        <linearGradient id="as-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c6dfa6" />
          <stop offset="100%" stopColor="#a4c884" />
        </linearGradient>
        <radialGradient id="as-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9a3" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffe9a3" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill="url(#as-sky)" />
      <circle cx="316" cy="56" r="64" fill="url(#as-sun-glow)" />
      <circle cx="316" cy="56" r="26" fill="#ffe9a3" />

      <path d="M0 168 Q90 126 190 158 T400 148 V300 H0Z" fill="url(#as-hill)" opacity="0.85" />
      <path d="M0 200 Q120 170 260 196 T400 190 V300 H0Z" fill="url(#as-hill)" opacity="0.7" />

      <g>
        <rect x="52" y="148" width="7" height="24" rx="3" fill="#8a6a4b" />
        <circle cx="55.5" cy="140" r="17" fill="#6ba45e" />
      </g>
      <g>
        <rect x="106" y="158" width="6" height="20" rx="3" fill="#8a6a4b" />
        <circle cx="109" cy="150" r="13" fill="#5d9c53" />
      </g>
      <g>
        <rect x="328" y="150" width="6" height="22" rx="3" fill="#8a6a4b" />
        <circle cx="331" cy="142" r="15" fill="#78b46b" />
      </g>

      <path d="M0 210 Q200 196 400 210 V300 H0Z" fill="url(#as-field)" />

      <g>
        <path d="M200 212 197.4 212 58 300 92 300Z" fill="#5e9d54" />
        <path d="M200 212 202.6 212 342 300 308 300Z" fill="#5e9d54" />
        <path d="M200 212 196.2 212 116 300 146 300Z" fill="#7ab76d" />
        <path d="M200 212 203.8 212 284 300 254 300Z" fill="#7ab76d" />
        <path d="M200 212 195.1 212 172 300 197 300Z" fill="#47853f" />
        <path d="M200 212 204.9 212 228 300 203 300Z" fill="#47853f" />
        <path d="M200 212 200 212 200.5 300 199.5 300Z" fill="#2f6b2b" />
      </g>

      <rect y="205" width="400" height="95" fill="#0b331a" opacity="0.1" />
    </svg>
  )
}

function MetricCard({ chip, chipClass, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-green-100 bg-white px-2 py-3.5 text-center shadow-sm">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${chipClass}`}
      >
        {chip}
      </span>
      <span className="text-lg font-bold tracking-tight text-green-950">
        {value}
      </span>
      <span className="text-[11px] font-medium text-gray-500">{label}</span>
    </div>
  )
}

export default function DashboardScreen({ onLogout }) {
  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto w-full max-w-md">
        <header className="sticky top-0 z-20 border-b border-green-100 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white shadow-sm shadow-green-600/30">
                <LeafIcon className="h-5 w-5" />
              </span>
              <h1 className="text-lg font-bold tracking-tight text-green-950">
                AgriScan AI
              </h1>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Back to login"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 text-green-700 transition hover:bg-green-50 active:scale-95"
            >
              <BackIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="space-y-4 px-4 py-4 pb-10">
          <section className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1 ring-green-100">
            <FarmImage />
            <div className="animate-scanline pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-green-400/90 to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                  Early Blight
                </span>
                <div className="relative h-40 w-44">
                  <span className="absolute -top-1.5 -left-1.5 h-9 w-9 rounded-tl-2xl border-l-[3px] border-t-[3px] border-green-400/90" />
                  <span className="absolute -top-1.5 -right-1.5 h-9 w-9 rounded-tr-2xl border-r-[3px] border-t-[3px] border-green-400/90" />
                  <span className="absolute -bottom-1.5 -left-1.5 h-9 w-9 rounded-bl-2xl border-b-[3px] border-l-[3px] border-green-400/90" />
                  <span className="absolute -bottom-1.5 -right-1.5 h-9 w-9 rounded-br-2xl border-b-[3px] border-r-[3px] border-green-400/90" />
                  <span className="absolute inset-0 rounded-2xl border border-green-400/30" />
                </div>
              </div>
            </div>

            <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-white backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="text-sm font-bold tracking-tight">94%</span>
              <span className="text-[11px] font-medium text-green-100/80">
                Confidence
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-green-950">
                Early Blight
              </h2>
              <span className="rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-800">
                Stage 1 – Mild
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500 italic">
              @Alternaria_solani
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-green-900">Severity Index</span>
                <span className="text-green-600">Mild (28%)</span>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-green-100"
                role="progressbar"
                aria-valuenow={28}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Severity Index"
              >
                <div className="h-full w-[28%] rounded-full bg-gradient-to-r from-lime-400 to-green-600" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3">
            <MetricCard
              chip={<AlertIcon className="h-4 w-4" />}
              chipClass="bg-amber-50 text-amber-600"
              value="Low"
              label="Infection Risk"
            />
            <MetricCard
              chip={<DropIcon className="h-4 w-4" />}
              chipClass="bg-sky-50 text-sky-600"
              value="67%"
              label="Humidity"
            />
            <MetricCard
              chip={<ThermometerIcon className="h-4 w-4" />}
              chipClass="bg-orange-50 text-orange-500"
              value="24°C"
              label="Air Temp"
            />
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-lg shadow-green-900/10 ring-1 ring-green-100">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600/10 text-green-700">
                <SprayIcon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold tracking-tight text-green-950">
                Precision Dosage
              </h3>
            </div>

            <ul className="mt-4 divide-y divide-green-50">
              <li className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-green-950">
                    Chlorothalonil
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">Every 7 days</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-emerald-700">
                  1.5 g / L
                </span>
              </li>
              <li className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-green-950">
                    Mancozeb WP 75%
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Alternating mode
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-emerald-700">
                  2.0 g / L
                </span>
              </li>
            </ul>

            <div className="mt-2 flex items-start gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 p-3">
              <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
              <p className="text-xs leading-relaxed text-yellow-800">
                Apply in early morning or evening. Avoid pre-rain application.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}