/**
 * Thin API client for the AgriScan prototype backend.
 *
 * Every call throws on network failure so callers can decide between
 * online and offline behaviour. No PII is ever sent for public endpoints.
 */

import { API_BASE } from "../lib/config"

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!response.ok) throw new Error(`API ${response.status} for ${path}`)
  return response.json()
}

export const api = {
  health: () => request("/api/health"),

  sync: (deviceId, diagnoses) =>
    request("/api/sync", {
      method: "POST",
      body: JSON.stringify({ device_id: deviceId, diagnoses }),
    }),

  createDiagnosis: (payload) =>
    request("/api/diagnoses", { method: "POST", body: JSON.stringify(payload) }),

  weather: (lat = null, lon = null) => {
    const q = new URLSearchParams()
    if (lat != null && lon != null) q.set("lat", lat)
    if (lat != null && lon != null) q.set("lon", lon)
    return request(`/api/weather?${q.toString()}`)
  },

  diseaseRisk: () => request("/api/disease-risk"),

  outbreaks: () => request("/api/outbreaks"),

  knowledge: () => request("/api/knowledge"),

  modelVersion: () => request("/api/model/version"),

  dashboardStats: () => request("/api/dashboard/stats"),

  reviewQueue: () => request("/api/diagnoses/review-queue"),

  submitReview: (diagnosisId, decision, note = "") =>
    request("/api/expert-review", {
      method: "POST",
      body: JSON.stringify({ diagnosis_id: diagnosisId, decision, note }),
    }),
}