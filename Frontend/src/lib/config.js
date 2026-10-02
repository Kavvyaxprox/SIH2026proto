/**
 * AgriScan runtime configuration.
 *
 * `VITE_API_BASE` can override the backend URL at build time.
 * The prototype backend runs locally at http://localhost:8000; for a
 * hosted demo, point this at the deployed FastAPI URL.
 */

export const API_BASE =
  (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/\/$/, "")

export const MODEL_URL =
  (import.meta.env.BASE_URL || "/") + "models/agriscan-v0.1-demo.onnx"

export const MODEL_WASM_PATH = (import.meta.env.BASE_URL || "/") + "ort/"

export const DEMO_SAMPLES_URL = (import.meta.env.BASE_URL || "/") + "demo-samples/manifest.json"

export const APP_VERSION = "0.1.0"