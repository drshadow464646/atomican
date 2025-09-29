
import type { Chemical } from './experiment';

export const commonChemicals: Chemical[] = [
  {
    id: 'hydrochloric-acid-0-1m',
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    type: 'acid',
    concentration: 0.1,
  },
  {
    id: 'sodium-hydroxide-0-1m',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    type: 'base',
    concentration: 0.1,
  },
  {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    formula: 'C₂₀H₁₄O₄',
    type: 'indicator',
  },
  {
    id: 'sulfuric-acid-0-1m',
    name: 'Sulfuric Acid',
    formula: 'H₂SO₄',
    type: 'acid',
    concentration: 0.1,
  },
  {
    id: 'potassium-hydroxide-0-1m',
    name: 'Potassium Hydroxide',
    formula: 'KOH',
    type: 'base',
    concentration: 0.1,
  },
  {
    id: 'sodium-chloride',
    name: 'Sodium Chloride',
    formula: 'NaCl',
    type: 'salt',
  },
  {
    id: 'distilled-water',
    name: 'Distilled Water',
    formula: 'H₂O',
    type: 'solvent',
  },
  {
    id: 'methyl-orange',
    name: 'Methyl Orange',
    formula: 'C₁₄H₁₄N₃NaO₃S',
    type: 'indicator',
  },
];
