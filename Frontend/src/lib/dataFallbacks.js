/**
 * Static fallbacks used when no live/cached runtime data exists yet.
 * Mirrors the demo-region weather observations used by the backend seed.
 */

export const WEATHER_OBSERVATIONS = [
  { temperature: 27, humidity: 72, rainfall_mm: 0.0 },
  { temperature: 26, humidity: 78, rainfall_mm: 2.1 },
  { temperature: 28, humidity: 69, rainfall_mm: 0.0 },
]

export const DEMO_REGION = { lat: 22.7, lon: 75.9, name: "Indore Rural" }