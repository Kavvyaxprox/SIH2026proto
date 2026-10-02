import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "../i18n"

const DEFAULT_CENTER = [22.7, 75.9]
const DEFAULT_ZOOM = 7

const SEVERITY_COLOR = {
  Severe: "#e11d48",
  Moderate: "#f59e0b",
  Mild: "#22c55e",
  Healthy: "#22c55e",
}

/**
 * Regional outbreak map. Renders marker dots per diagnosis point.
 *
 * Tile layers require connectivity; the map degrades gracefully to the
 * marker layer alone when the app is offline (base map omitted).
 *
 * @param {object} props
 * @param {Array<{lat:number,lon:number,crop?:string,condition?:string,severity?:string,case?:string,date?:string,region?:string}>} props.points
 */
export default function RegionalMap({ points = [] }) {
  const { t } = useI18n()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined
    const map = L.map(containerRef.current, { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
    mapRef.current = map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)
    setReady(true)
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return undefined
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
      layerRef.current = null
    }
    if (points.length === 0) return undefined

    const layer = L.layerGroup().addTo(map)
    layerRef.current = layer

    for (const point of points) {
      const color = SEVERITY_COLOR[point.severity] ?? SEVERITY_COLOR.Mild
      const icon = L.divIcon({
        className: "",
        html: `<span style="
          display:block;width:14px;height:14px;border-radius:50%;
          background:${color};border:2px solid #fff;
          box-shadow:0 1px 3px rgba(0,0,0,.45)"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker([point.lat, point.lon], { icon, title: `${point.crop ?? ""} ${point.condition ?? ""}` })
        .bindPopup(
          `<strong>${point.crop ?? "Unknown"} — ${point.condition ?? "Unknown"}</strong><br>` +
            `${point.severity ?? "Unknown"} · ${point.region ?? ""}<br>` +
            `<small>${point.date ?? ""} · ${point.case ?? ""}</small>`,
        )
        .addTo(layer)
    }

    // Fit to points when there are enough of them; otherwise keep the
    // regional overview centered on Indore.
    if (points.length > 1) {
      map.fitBounds(layer.getBounds().pad(0.2))
    }

    return () => {
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [points, ready])

  return (
    <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
      {!navigator.onLine && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          {t("officer.map_offline")}
        </div>
      )}
      <div ref={containerRef} className="h-72 w-full" style={{ background: "#e7f0e5" }} />
      <Legend />
    </div>
  )
}

function Legend() {
  const { t } = useI18n()
  const items = [
    { color: "#22c55e", label: t("officer.map_legend_healthy") },
    { color: "#f59e0b", label: t("officer.map_legend_moderate") },
    { color: "#e11d48", label: t("officer.map_legend_severe") },
  ]
  return (
    <div className="flex items-center justify-center gap-5 border-t border-green-50 px-3 py-2.5">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}