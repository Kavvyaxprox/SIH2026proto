/**
 * Severity + environmental-risk prototype models.
 *
 * These are intentionally transparent, documented formulas that satisfy
 * real rural UX requirements (a farmer can act on them) while being
 * clearly labelled prototype logic — not agronomically validated.
 */

/**
 * Environmental favourability 0..100 for fungal disease spread.
 */
export function environmentalRisk(tempC, humidity) {
  if (tempC === null || tempC === undefined || humidity === null || humidity === undefined) {
    return 50
  }
  const tempOk = tempC >= 18 && tempC <= 32 ? 1 : 0.4
  const hum = Math.max(0, Math.min(1, humidity / 100))
  return Math.round(100 * (0.6 * hum + 0.4 * tempOk))
}

/**
 * Severity index 0..100 from model confidence + environmental risk.
 *
 * severity = clamp(  (conf-driven base) * 0.7  +  envRisk * 0.3 , 0..100 )
 *
 * base        : 20 + 60 * confidence  (healthy leaves score ~0)
 * envRisk     : from temperature/humidity favourability
 * mild        : 0–30
 * moderate    : 31–60
 * severe      : 61–100
 */
export function computeSeverity({ confidence, healthy, temperature, humidity }) {
  if (healthy) return { score: 0, label: "Mild" }

  const env = environmentalRisk(temperature, humidity)
  const base = 20 + 60 * Math.max(0, Math.min(1, confidence))
  const score = Math.round(Math.max(0, Math.min(100, base * 0.7 + env * 0.3)))

  const label = score <= 30 ? "Mild" : score <= 60 ? "Moderate" : "Severe"
  return { score, label }
}

/**
 * Label an environmental risk score for display.
 */
export function envRiskLabel(score) {
  if (score >= 66) return "High"
  if (score >= 40) return "Elevated"
  return "Low"
}

/**
 * Confidence tier used for the human-in-the-loop flow.
 */
export function confidenceTier(confidence) {
  if (confidence >= 0.8) return "high"
  if (confidence >= 0.6) return "medium"
  return "low"
}