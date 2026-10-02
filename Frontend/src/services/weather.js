/**
 * Weather context service — ONLINE enhances, OFFLINE never blocks.
 *
 * Online  -> backend proxy to Open-Meteo returns live readings, which we
 *            cache in IndexedDB together with a timestamp + source.
 * Offline -> cached readings are reused and clearly labelled; if nothing
 *            is cached we return null and the UI asks the farmer for
 *            rough manual values instead.
 */

import { db } from "./db"
import { api } from "./api"

function regionKey(lat, lon) {
  return `region:${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`
}

export async function getCachedWeather(lat = 22.7, lon = 75.9) {
  try {
    return await db.get("weather", regionKey(lat, lon))
  } catch {
    return null
  }
}

/**
 * @param {number} lat
 * @param {number} lon
 * @param {boolean} online
 * @returns {Promise<{temperature:number|null, humidity:number|null, rainfall_mm:number|null, source:string, cachedAt:number|null}>}
 */
export async function resolveWeather(lat, lon, online) {
  const cached = await getCachedWeather(lat, lon)

  if (online) {
    try {
      const data = await api.weather(lat, lon)
      const record = {
        key: regionKey(lat, lon),
        temperature: Math.round(data.temperature ?? NaN),
        humidity: Math.round(data.humidity ?? NaN),
        rainfall_mm: Math.round((data.rainfall_mm ?? 0) * 10) / 10,
        source: data.source,
        cachedAt: Date.now(),
      }
      await db.put("weather", record)
      return record
    } catch {
      // fall through to cache
    }
  }

  if (cached) {
    return {
      temperature: cached.temperature,
      humidity: cached.humidity,
      rainfall_mm: cached.rainfall_mm,
      source: "cached",
      cachedAt: cached.cachedAt,
    }
  }

  // Nothing cached: let the farmer provide local values.
  return {
    temperature: null,
    humidity: null,
    rainfall_mm: null,
    source: "manual",
    cachedAt: null,
  }
}