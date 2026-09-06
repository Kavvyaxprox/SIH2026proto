/**
 * Mock data layer for the AgriScan prototype.
 *
 * In a production build these values would come from the edge-AI model
 * and a weather API, but for this prototype they power the full UX and
 * make the scan/history flows feel real.
 */

/** 4. Mock weather data for the home dashboard widget. */
export const WEATHER = {
  place: 'Indore, MP',
  temperature: 28,
  feelsLike: 31,
  humidity: 78, // 78% => "High Humidity" bucket
  windKph: 6,
  condition: 'High Humidity',
  conditionIcon: 'cloud',
}

/** Alert copy shown below the weather widget when risk conditions exist. */
export const HUMIDITY_ALERT =
  'High humidity detected. Optimal conditions for fungal spread. Consider preventative measures.'

/**
 * Disease library. Each record contains everything the Result view needs:
 * diagnosis text, confidence, symptoms and both treatment strategies.
 *
 * @type {Array<{
 *   id: string,
 *   name: string,
 *   pathogen: string,
 *   severity: 'Moderate'|'High'|'Low',
 *   confidence: number,
 *   summary: string,
 *   symptoms: string[],
 *   organic: {name: string, detail: string}[],
 *   chemical: {name: string, dosage: string, frequency: string, note: string}[],
 *   prevention: string[],
 * }>}
 */
const DISEASE_LIBRARY = [
  {
    id: 'early-blight',
    name: 'Early Blight in Tomato',
    pathogen: 'Alternaria solani (fungus)',
    severity: 'Moderate',
    confidence: 88,
    summary:
      'A common fungal disease that attacks foliage, stems and fruit of tomato crops, forming dark lesions with a characteristic "bull\u2019s-eye" ring pattern.',
    symptoms: [
      'Dark brown spots with concentric rings on older leaves',
      'Yellow halo surrounding necrotic lesions',
      'Defoliation starting from the base of the plant',
      'Sunken, leathery spots on stems and fruit (often near the calyx)',
    ],
    organic: [
      {
        name: 'Neem oil spray',
        detail:
          'Mix 5 ml of cold-pressed neem oil with 1 litre of water plus a drop of mild soap. Spray stems and leaf undersides every 3\u20134 days.',
      },
      {
        name: 'Copper-soap mixture',
        detail:
          'Dissolve 2 g of copper oxychloride in 1 litre of water. Apply as a preventative drench in the early morning.',
      },
      {
        name: 'Milk + baking soda',
        detail:
          'Combine 1 part milk, 9 parts water and a pinch of baking soda. Weekly spray raises leaf pH, discouraging fungal growth.',
      },
    ],
    chemical: [
      {
        name: 'Chlorothalonil (75% WP)',
        dosage: '1.5 g / L water',
        frequency: 'Every 7 days',
        note: 'Alternate with a systemic fungicide to avoid resistance. Avoid application within 3 days of harvest.',
      },
      {
        name: 'Mancozeb (75% WP)',
        dosage: '2.0 g / L water',
        frequency: 'Every 7\u201310 days',
        note: 'Apply in early morning or evening. Do not spray before expected rain.',
      },
    ],
    prevention: [
      'Rotate crops: avoid planting tomato after potato or pepper',
      'Prune lower, oldest leaves to improve airflow',
      'Water at the base and avoid wetting foliage',
      'Mulch soil to stop spores splashing onto plants',
    ],
  },
  {
    id: 'powdery-mildew',
    name: 'Powdery Mildew in Cucurbits',
    pathogen: 'Podosphaera xanthii (fungus)',
    severity: 'High',
    confidence: 91,
    summary:
      'A fast-spreading fungal disease covering leaves in white powdery patches. Leaves yellow and shrivel, slashing yields of squash, cucumber and melon.',
    symptoms: [
      'White, flour-like patches on upper leaf surfaces',
      'Yellowing and curling of infected leaves',
      'Stunted vine growth and poor fruit set',
      'Powdery colonies spreading to stems and buds',
    ],
    organic: [
      {
        name: 'Sulfur (wettable) spray',
        detail:
          'Mix 3 g of wettable sulfur per litre of water. Apply on a calm day when temperature is below 30\u00b0C.',
      },
      {
        name: 'Bicarbonate wash',
        detail:
          'Stir 1 teaspoon of potassium bicarbonate into 1 litre of water with a splash of horticultural oil. Spray every 5\u20137 days.',
      },
      {
        name: 'Garlic-chilli tea',
        detail:
          'Steep crushed garlic and green chilli in water overnight, strain and spray as a fungal deterrent.',
      },
    ],
    chemical: [
      {
        name: 'Dinocap (48% EC)',
        dosage: '1.0 ml / L water',
        frequency: 'Every 7 days',
        note: 'Apply at first sign of white patches. Do not use within 7 days of harvest.',
      },
      {
        name: 'Hexaconazole (5% SC)',
        dosage: '2.0 ml / L water',
        frequency: 'Every 10\u201312 days',
        note: 'A systemic fungicide; always alternate with a contact treatment.',
      },
    ],
    prevention: [
      'Provide wide row spacing for air movement',
      'Avoid overhead irrigation late in the day',
      'Remove and destroy infected leaves immediately',
      'Choose tolerant hybrid varieties next season',
    ],
  },
  {
    id: 'bacterial-leaf-spot',
    name: 'Bacterial Leaf Spot in Chilli',
    pathogen: 'Xanthomonas campestris (bacterium)',
    severity: 'Moderate',
    confidence: 84,
    summary:
      'Water-soaked leaf spots that dry into tan lesions with a yellow margin. Spreads through splashing water and is very contagious during rains.',
    symptoms: [
      'Small, water-soaked spots that expand into tan lesions',
      'Yellow (halo) border around each lesion',
      'Leaf drop and stem cankers in severe cases',
      'Spots on fruit that later crack and rot',
    ],
    organic: [
      {
        name: 'Copper oxychloride spray',
        detail:
          'Mix 3 g of copper oxychloride per litre and add 1 g of streptocycline. Spray both leaf surfaces weekly.',
      },
      {
        name: 'Pseudomonas bio-culture',
        detail:
          'Seed/seedling treatment with a Pseudomonas fluorescens culture suppresses bacterial spread in the field.',
      },
    ],
    chemical: [
      {
        name: 'Streptocycline (90%)',
        dosage: '0.5 g / 10 L water',
        frequency: 'Every 10 days',
        note: 'Use sparingly and only during active spread to delay resistance.',
      },
      {
        name: 'Copper oxychloride (50% WP)',
        dosage: '3.0 g / L water',
        frequency: 'Every 7\u201310 days',
        note: 'Apply after strong rain events; protect uninfected plants first.',
      },
    ],
    prevention: [
      'Use certified, disease-free seed',
      'Avoid working in the field when foliage is wet',
      'Stake plants to keep leaves off the ground',
      'Disinfect tools between rows',
    ],
  },
]

/**
 * Returns a pseudo-random diagnosis the way the "edge-AI" model would.
 * Includes a small severity/confidence variance so history feels organic.
 */
export function getMockDiagnosis() {
  const base = DISEASE_LIBRARY[Math.floor(Math.random() * DISEASE_LIBRARY.length)]
  const jitter = Math.floor(Math.random() * 7) - 3 // -3..+3
  return {
    ...base,
    confidence: Math.min(97, Math.max(78, base.confidence + jitter)),
  }
}