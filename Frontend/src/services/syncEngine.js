/**
 * Sync engine — offline-first synchronisation queue.
 *
 * Workflow:
 *   diagnosis → IndexedDB (sync_status = "pending")
 *   online    → POST /api/sync (batch) → mark "synced" + record lastSync
 *   offline   → stays "pending"; auto-sync fires on the browser `online`
 *               event + manual [Sync Now].
 */

import { db } from "./db"
import { api } from "./api"

export const DEVICE_ID =
  (() => {
    try {
      let id = localStorage.getItem("agriscan:device_id")
      if (!id) {
        id = crypto.randomUUID?.() ?? `device-${Date.now()}`
        localStorage.setItem("agriscan:device_id", id)
      }
      return id
    } catch {
      return "demo-device"
    }
  })()

const META_KEY_LAST_SYNC = "last_sync_at"
const META_KEY_MODEL_VERSION = "model_version"
const META_KEY_KB_VERSION = "knowledge_version"
export const META_KEYS = {
  LAST_SYNC: META_KEY_LAST_SYNC,
  MODEL_VERSION: META_KEY_MODEL_VERSION,
  KB_VERSION: META_KEY_KB_VERSION,
}

export async function getPendingDiagnoses() {
  try {
    return await db.getAllByIndex("diagnoses", "by_sync_status", "pending")
  } catch {
    return []
  }
}

export async function getDiagnosis(id) {
  return db.get("diagnoses", id)
}

export async function saveDiagnosis(diagnosis) {
  await db.put("diagnoses", {
    ...diagnosis,
    syncStatus: "pending",
    sync_status: "pending",
  })
}

export async function markSynced(ids) {
  const all = await db.getAll("diagnoses")
  const syncedIds = new Set(ids)
  const kept = new Map()
  for (const record of all) {
    if (syncedIds.has(record.id) && record.sync_status !== "synced") {
      kept.set(record.id, {
        ...record,
        sync_status: "synced",
        syncStatus: "synced",
        synced_at: new Date().toISOString(),
      })
    } else {
      kept.set(record.id, record) // keep pending + already-synced history
    }
  }
  await db.putMany("diagnoses", [...kept.values()])
}

export async function clearLocalHistory() {
  await db.clear("diagnoses")
}

/**
 * Upload the pending queue. Returns a summary or throws.
 */
export async function syncNow() {
  const pending = await getPendingDiagnoses()
  if (pending.length === 0) {
    return { synced: 0, skipped: 0, ids: [] }
  }

  // Send minimal fields only — no personal data beyond the demo user.
  const payload = pending.map((d) => {
    const weather = d.weather ?? {}
    const location = d.location ?? {}
    return {
      id: d.id,
      user_id: d.user_id ?? "demo-farmer-001",
      crop: d.crop,
      disease: d.disease,
      class_id: d.classId,
      confidence: d.confidence,
      severity: d.severity,
      severity_label: d.severityLabel,
      temperature: weather.temperature,
      humidity: weather.humidity,
      rainfall_mm: weather.rainfallMm,
      weather_cached: !weather.sourceLive,
      latitude: location.lat ?? d.latitude,
      longitude: location.lon ?? d.longitude,
      created_at: d.createdAt,
      is_demo_sample: d.isDemoSample ?? false,
    }
  })

  const result = await api.sync(DEVICE_ID, payload)
  await markSynced(result.ids)
  await db.put("meta", { key: META_KEY_LAST_SYNC, value: new Date().toISOString() })
  return result
}

export async function getLastSync() {
  try {
    const meta = await db.get("meta", META_KEY_LAST_SYNC)
    return meta?.value ?? null
  } catch {
    return null
  }
}

export async function checkModelVersion(onOnline) {
  if (!onOnline) return { ai_model: null, knowledge_base: null, checked: false }
  try {
    const info = await api.modelVersion()
    await db.put("meta", { key: META_KEY_MODEL_VERSION, value: info.ai_model })
    await db.put("meta", { key: META_KEY_KB_VERSION, value: info.knowledge_base })
    return { ai_model: info.ai_model, knowledge_base: info.knowledge_base, checked: true }
  } catch {
    return { ai_model: null, knowledge_base: null, checked: false }
  }
}

export async function refreshKnowledgeBase(onOnline) {
  if (!onOnline) return false
  try {
    await api.knowledge()
    return true
  } catch {
    return false
  }
}