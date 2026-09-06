import { ChevronDown, FlaskConical, Leaf, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

const TABS = [
  { id: 'organic', label: 'Organic Remedies', icon: Leaf },
  { id: 'chemical', label: 'Chemical Treatments', icon: FlaskConical },
]

/**
 * 2. Treatment plan selector.
 *
 * Two tabs — "Organic Remedies" and "Chemical Treatments" — each shown
 * as a stack of expandable accordion rows so the plan stays compact on
 * small screens.
 *
 * @param {{
 *   organic: { name: string, detail: string }[],
 *   chemical: { name: string, dosage: string, frequency: string, note: string }[],
 * }} props
 */
export default function TreatmentPlan({ organic, chemical }) {
  const [activeTab, setActiveTab] = useState('organic')
  const [openIndex, setOpenIndex] = useState(0)

  const isOrganic = activeTab === 'organic'
  const items = isOrganic
    ? organic.map((item) => ({
        title: item.name,
        body: item.detail,
        note: null,
      }))
    : chemical.map((item) => ({
        title: item.name,
        body: item.note,
        note: `${item.dosage} · ${item.frequency}`,
      }))

  const toggle = (index) => setOpenIndex((prev) => (prev === index ? -1 : index))

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
      <h3 className="text-base font-bold tracking-tight text-green-950">
        Treatment Plan
      </h3>

      {/* Tab switcher */}
      <div
        className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-green-50 p-1"
        role="tablist"
        aria-label="Treatment type"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => {
              setActiveTab(id)
              setOpenIndex(0)
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition ${
              activeTab === id
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-green-600/70 hover:text-green-700'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Expandable remedy rows */}
      <ul className="mt-3 divide-y divide-green-50">
        {items.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={openIndex === index}
              className="flex w-full items-center justify-between gap-3 py-3 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-green-950">
                  {item.title}
                </span>
                {item.note && (
                  <span className="mt-0.5 block text-xs font-medium text-emerald-700">
                    {item.note}
                  </span>
                )}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-green-500 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <p className="animate-fade-in pb-3 text-xs leading-relaxed text-gray-600">
                {item.body}
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* Safety reminder */}
      <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">
          Always follow label instructions and the prescribed withholding period
          before harvest.
        </p>
      </div>
    </div>
  )
}