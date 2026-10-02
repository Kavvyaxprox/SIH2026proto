/**
 * Bundled offline knowledge base.
 *
 * The same JSON ships on the backend (`/api/knowledge`) and is bundled
 * here so recommendations work with no connectivity. When online the
 * sync engine can request the backend copy to check for a newer version.
 */

import kbBundle from "./knowledgeBase.json"

export const KNOWLEDGE_BASE_VERSION = kbBundle.version

/**
 * @param {string} classId e.g. "tomato_early_blight"
 * @returns {object|undefined} the structured KB entry.
 */
export function getKnowledgeEntry(classId) {
  return kbBundle.entries[classId]
}

export function getAllKnowledge() {
  return Object.values(kbBundle.entries)
}