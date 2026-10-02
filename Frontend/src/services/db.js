/**
 * IndexedDB persistence layer for the offline-first store.
 *
 * Stores:
 *   diagnoses  — every diagnosis (keyPath `id`), with `sync_status`
 *                pending | synced  as an index for the sync engine.
 *   weather    — keyPath `key` = "region:<lat>,<lon>" cached readings.
 *   meta       — keyPath `key` for app meta (model versions, last sync…).
 *   reviews    — local expert-review decisions (mirrored to backend).
 *
 * Promises wrap the IndexedDB API so services can `await` comfortably.
 */

const DB_NAME = "agriscan-db"
const DB_VERSION = 1

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains("diagnoses")) {
        const store = db.createObjectStore("diagnoses", { keyPath: "id" })
        store.createIndex("by_sync_status", "sync_status", { unique: false })
        store.createIndex("by_created", "created_at", { unique: false })
      }
      if (!db.objectStoreNames.contains("weather")) {
        db.createObjectStore("weather", { keyPath: "key" })
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" })
      }
      if (!db.objectStoreNames.contains("reviews")) {
        db.createObjectStore("reviews", { keyPath: "diagnosis_id" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function requestOf(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function tx(db, storeName, mode = "readonly") {
  return db.transaction(storeName, mode).objectStore(storeName)
}

export const db = {
  async put(storeName, value) {
    const database = await openDb()
    try {
      await requestOf(tx(database, storeName, "readwrite").put(value))
    } finally {
      database.close()
    }
  },

  async putMany(storeName, values) {
    const database = await openDb()
    try {
      const store = tx(database, storeName, "readwrite")
      for (const value of values) await requestOf(store.put(value))
    } finally {
      database.close()
    }
  },

  async getAll(storeName) {
    const database = await openDb()
    try {
      return await requestOf(tx(database, storeName).getAll())
    } finally {
      database.close()
    }
  },

  /** getAll by an index + optional key range. */
  async getAllByIndex(storeName, indexName, query) {
    const database = await openDb()
    try {
      const index = tx(database, storeName).index(indexName)
      return await requestOf(index.getAll(query))
    } finally {
      database.close()
    }
  },

  async get(storeName, key) {
    const database = await openDb()
    try {
      return await requestOf(tx(database, storeName).get(key))
    } finally {
      database.close()
    }
  },

  async delete(storeName, key) {
    const database = await openDb()
    try {
      await requestOf(tx(database, storeName, "readwrite").delete(key))
    } finally {
      database.close()
    }
  },

  async clear(storeName) {
    const database = await openDb()
    try {
      await requestOf(tx(database, storeName, "readwrite").clear())
    } finally {
      database.close()
    }
  },
}