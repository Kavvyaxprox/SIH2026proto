/**
 * Class registry for the prototype classifier.
 *
 * `CLASS_LIST` order MUST match the ONNX model output index, which is the
 * alphabetical order of the training folders in AI/data/raw. Verify with
 * AI/models/class_map.json after retraining.
 *
 * Each entry maps a class id to human-facing crop / disease labels used
 * by the UI and the recommendation engine.
 */

export const CLASS_LIST = [
  "apple_healthy",
  "apple_scab",
  "maize_healthy",
  "maize_leaf_blight",
  "potato_early_blight",
  "potato_healthy",
  "potato_late_blight",
  "tomato_early_blight",
  "tomato_healthy",
  "tomato_late_blight",
]

/**
 * @type {Record<string, {crop: string, disease: string, healthy: boolean}>}
 */
export const CLASS_META = {
  apple_healthy: { crop: "Apple", disease: "Healthy", healthy: true },
  apple_scab: { crop: "Apple", disease: "Apple Scab", healthy: false },
  maize_healthy: { crop: "Maize", disease: "Healthy", healthy: true },
  maize_leaf_blight: { crop: "Maize", disease: "Northern Leaf Blight", healthy: false },
  potato_early_blight: { crop: "Potato", disease: "Early Blight", healthy: false },
  potato_healthy: { crop: "Potato", disease: "Healthy", healthy: true },
  potato_late_blight: { crop: "Potato", disease: "Late Blight", healthy: false },
  tomato_early_blight: { crop: "Tomato", disease: "Early Blight", healthy: false },
  tomato_healthy: { crop: "Tomato", disease: "Healthy", healthy: true },
  tomato_late_blight: { crop: "Tomato", disease: "Late Blight", healthy: false },
}

export function summarizeTop(probs) {
  /** Convert a softmax probability array to the top-1 prediction object. */
  let bestIndex = 0
  for (let i = 1; i < probs.length; i += 1) {
    if (probs[i] > probs[bestIndex]) bestIndex = i
  }
  const classId = CLASS_LIST[bestIndex]
  const meta = CLASS_META[classId]
  return {
    classId,
    crop: meta.crop,
    disease: meta.disease,
    healthy: meta.healthy,
    confidence: probs[bestIndex],
  }
}