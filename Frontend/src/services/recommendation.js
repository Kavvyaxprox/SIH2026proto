/**
 * Local recommendation engine.
 *
 * Retrieves structured agronomy guidance from the bundled KB by
 * crop + disease + severity. It never generates dosages; it surfaces
 * (a) immediate actions, (b) prevention, (c) verified-label treatment
 * guidance when severity is moderate+, and (d) contact-an-expert advice
 * for severe cases.
 */

import { getKnowledgeEntry } from "../lib/knowledge"

/**
 * @param {string} classId
 * @param {{score:number, label:string}} severity
 * @returns {{ immediate: string[], prevention: string[], treatment: object[], organic: object[], contact: string, guidanceOnly: boolean }}
 */
export function buildRecommendations(classId, severity) {
  const entry = getKnowledgeEntry(classId) ?? {}
  const severe = severity.label === "Severe"
  const moderate = severity.label === "Moderate"

  return {
    immediate: entry.immediate_actions ?? [],
    prevention: entry.prevention ?? [],
    treatment: severe || moderate ? entry.chemical_guidance ?? [] : [],
    organic: entry.organic ?? [],
    contact: severe ? (entry.contact_advice ?? "") : "",
    guidanceOnly: true,
  }
}