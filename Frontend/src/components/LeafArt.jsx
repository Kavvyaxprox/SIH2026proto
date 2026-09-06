/**
 * Reusable leaf artwork used by the scanning overlay and result
 * placeholder. Drawn as inline SVG so it needs no image assets and
 * works offline out of the box.
 */
export default function LeafArt({ className = 'h-20 w-20' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Stalk */}
      <path
        d="M60 92c-.5-8-1-22 6-38 5-11.5 13-21 20-28"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Leaf body: two mirrored quadratic curves */}
      <path
        d="M60 88C38 84 22 66 22 44 22 24 42 18 60 18c18 0 38 6 38 26 0 22-16 40-38 44Z"
        fill="currentColor"
      />
      {/* Central vein */}
      <path
        d="M60 86c-2-14-1-38 8-56"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Side veins */}
      <path
        d="M60 70C54 62 48 56 43 52"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M61 56c5-8 11-14 17-19"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  )
}