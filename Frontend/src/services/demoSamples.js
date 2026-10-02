/**
 * Demo-sample dataset mode.
 *
 * Bundled leaf photos with verified labels let the SIH demo run even if
 * the live model is unavailable. The sample image is clearly labelled
 * "Demo Sample" in the UI; inference itself stays real (same on-device
 * pipeline). Nothing here is disguised as a live capture.
 */

import { DEMO_SAMPLES_URL } from "../lib/config"

/**
 * @returns {Promise<Array<{name:string, classId:string, crop:string, disease:string}>>}
 */
export async function loadSampleManifest() {
  const response = await fetch(DEMO_SAMPLES_URL)
  if (!response.ok) throw new Error("Demo samples not found")
  const manifest = await response.json()
  return manifest.samples ?? []
}

/**
 * @param {object} sample from loadSampleManifest
 * @returns {Promise<File>}
 */
export async function loadSampleFile(sample) {
  const base = DEMO_SAMPLES_URL.replace(/manifest\.json$/, "")
  const response = await fetch(`${base}${sample.file}`)
  if (!response.ok) throw new Error("Sample image missing")
  const blob = await response.blob()
  return new File([blob], sample.file, { type: "image/jpeg" })
}

const SAMPLE_CACHE = new Map()

export async function getSamples() {
  if (SAMPLE_CACHE.has("samples")) return SAMPLE_CACHE.get("samples")
  const samples = await loadSampleManifest()
  SAMPLE_CACHE.set("samples", samples)
  return samples
}