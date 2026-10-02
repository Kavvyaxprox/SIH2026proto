/**
 * End-to-end diagnosis pipeline (works fully offline).
 *
 *   image → quality gate → on-device ONNX inference → confidence
 *        → severity → environmental context → recommendation
 *
 * Exposes an async `runDiagnosis` that returns the complete structured
 * result. When offline, weather resolves from cache/manual input and the
 * diagnosis is still fully usable.
 */

import { assessImageQuality } from "./imageQuality"
import { predict, loadModel } from "./onnxInference"
import { summarizeTop } from "../lib/classMap"
import { computeSeverity, environmentalRisk, envRiskLabel, confidenceTier } from "./scoring"
import { buildRecommendations } from "./recommendation"
import { resolveWeather } from "./weather"
import { getKnowledgeEntry } from "../lib/knowledge"

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read the selected image."))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Selected file is not a valid image."))
      img.onload = () => resolve(img)
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export async function createImageBitmapSafe(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file)
    } catch {
      /* fall through to FileReader path */
    }
  }
  return readImageFile(file)
}

/**
 * A hybrid split: slices of a single leaf image, useful to compute blur.
 * Kept here to make the pipeline stage boundaries explicit.
 */
export { assessImageQuality }

/**
 * @param {object} opts
 * @param {File} opts.file
 * @param {{lat?:number, lon?:number, online?:boolean}} [opts.context]
 * @param {(step:string) => void} [opts.onStep]  called when a stage begins
 * @returns {Promise<object>} structured diagnosis result
 */
export async function runDiagnosis({ file, context = {}, onStep }) {
  const bump = (step) => onStep?.(step)

  bump("quality")
  let image
  try {
    image = await createImageBitmapSafe(file)
  } catch (error) {
    throw { stage: "quality", type: "unreadable", message: error.message }
  }
  const quality = assessImageQuality(image)

  if (!quality.pass) {
    return {
      ok: false,
      stage: "quality",
      quality,
      message: "Image quality too low",
    }
  }

  bump("detection")
  let probs
  try {
    // Ensure the (lazily loaded) session is ready before reporting the
    // "on-device AI" step as complete.
    await loadModel()
    probs = await predict(image)
  } catch (error) {
    throw {
      stage: "detection",
      type: "model_failed",
      message: error instanceof Error ? error.message : String(error),
    }
  }

  const top = summarizeTop(probs)
  const conf = top.confidence
  const tier = confidenceTier(conf)

  bump("severity")
  const lat = context.lat ?? 22.7
  const lon = context.lon ?? 75.9
  const online = context.online ?? true

  const weather = await resolveWeather(lat, lon, online)
  const envRisk = environmentalRisk(weather.temperature, weather.humidity)
  const severity = computeSeverity({
    confidence: conf,
    healthy: top.healthy,
    temperature: weather.temperature,
    humidity: weather.humidity,
  })

  bump("environment")

  const kb = getKnowledgeEntry(top.classId) ?? {}
  const recommendations = buildRecommendations(top.classId, severity)
  const recommendationsSource = "local"

  bump("recommendation")

  const now = new Date()

  return {
    ok: true,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `scan-${Date.now()}`,
    createdAt: now.toISOString(),
    crop: top.crop,
    disease: top.disease,
    classId: top.classId,
    healthy: top.healthy,
    confidence: conf,
    confidencePercent: Math.round(conf * 100),
    confidenceTier: tier,
    lowConfidence: tier === "low",
    severity: severity.score,
    severityLabel: severity.label,
    severityTier: severity.label,
    quality,
    weather: {
      temperature: weather.temperature,
      humidity: weather.humidity,
      rainfallMm: weather.rainfall_mm,
      source: weather.source,
      sourceLive: weather.source === "Open-Meteo (live)",
    },
    envRisk,
    envRiskLabel: envRiskLabel(envRisk),
    pathogen: kb.pathogen ?? "",
    summary: kb.summary ?? "",
    symptoms: kb.symptoms ?? [],
    recommendations,
    recommendationsSource,
    image: null, // filled below by the caller (thumbnail data-url)
    reviewStatus: tier === "low" ? "needs_review" : "none",
    syncStatus: "pending",
    modelVersion: "v0.1-demo",
  }
}