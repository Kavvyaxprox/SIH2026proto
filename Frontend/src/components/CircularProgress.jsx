/**
 * Circular confidence indicator (feature 2).
 *
 * Renders an SVG donut whose arc length is proportional to `value`.
 * The gradient + center text make the score feel like a real AI gauge.
 *
 * @param {{ value: number, size?: number, stroke?: number }} props
 */
export default function CircularProgress({ value, size = 96, stroke = 9 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100)

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`AI confidence score ${value} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id="confidence-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="#dcfce7"
          strokeWidth={stroke}
        />
        {/* Progress arc, rotated so it starts at 12 o'clock */}
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="url(#confidence-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl leading-none font-bold tracking-tight text-green-950">
          {value}%
        </p>
        <p className="mt-1 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
          confidence
        </p>
      </div>
    </div>
  )
}