
import type { Chemical } from './experiment';

export const ALL_CHEMICALS: Chemical[] = [
  // Acids
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'acid', concentration: 0.1 },
  { id: 'h2so4', name: 'Sulfuric Acid', formula: 'H₂SO₄', type: 'acid', concentration: 0.1 },
  { id: 'hno3', name: 'Nitric Acid', formula: 'HNO₃', type: 'acid', concentration: 0.1 },
  { id: 'ch3cooh', name: 'Acetic Acid', formula: 'CH₃COOH', type: 'acid', concentration: 0.1 },

  // Bases
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'base', concentration: 0.1 },
  { id: 'koh', name: 'Potassium Hydroxide', formula: 'KOH', type: 'base', concentration: 0.1 },
  { id: 'nh3', name: 'Ammonia', formula: 'NH₃', type: 'base', concentration: 0.1 },
  
  // Indicators
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'C₂₀H₁₄O₄', type: 'indicator' },
  { id: 'methyl-orange', name: 'Methyl Orange', formula: 'C₁₄H₁₄N₃NaO₃S', type: 'indicator' },
  { id: 'bromothymol-blue', name: 'Bromothymol Blue', formula: 'C₂₇H₂₈Br₂O₅S', type: 'indicator' },

  // Salts
  { id: 'nacl', name: 'Sodium Chloride', formula: 'NaCl', type: 'salt' },
  { id: 'cuso4', name: 'Copper(II) Sulfate', formula: 'CuSO₄', type: 'salt' },
  { id: 'kno3', name: 'Potassium Nitrate', formula: 'KNO₃', type: 'salt' },

  // Solvents
  { id: 'h2o', name: 'Distilled Water', formula: 'H₂O', type: 'solvent' },
  { id: 'ethanol', name: 'Ethanol', formula: 'C₂H₅OH', type: 'solvent' },
];
