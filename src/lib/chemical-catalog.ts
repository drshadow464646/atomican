
import type { Chemical } from './experiment';

// This acts as a local database for all available chemicals.
export const ALL_CHEMICALS: Chemical[] = [
  // == Strong Acids ==
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'acid', concentration: 0.1 },
  { id: 'h2so4', name: 'Sulfuric Acid', formula: 'H₂SO₄', type: 'acid', concentration: 0.1 },
  { id: 'hno3', name: 'Nitric Acid', formula: 'HNO₃', type: 'acid', concentration: 0.1 },
  { id: 'hbr', name: 'Hydrobromic Acid', formula: 'HBr', type: 'acid', concentration: 0.1 },
  { id: 'hi', name: 'Hydroiodic Acid', formula: 'HI', type: 'acid', concentration: 0.1 },
  { id: 'hclo4', name: 'Perchloric Acid', formula: 'HClO₄', type: 'acid', concentration: 0.1 },
  
  // == Weak Acids ==
  { id: 'ch3cooh', name: 'Acetic Acid', formula: 'CH₃COOH', type: 'acid', concentration: 0.1 },
  { id: 'h2co3', name: 'Carbonic Acid', formula: 'H₂CO₃', type: 'acid', concentration: 0.1 },
  { id: 'h3po4', name: 'Phosphoric Acid', formula: 'H₃PO₄', type: 'acid', concentration: 0.1 },
  { id: 'hf', name: 'Hydrofluoric Acid', formula: 'HF', type: 'acid', concentration: 0.1 },
  { id: 'hcn', name: 'Hydrocyanic Acid', formula: 'HCN', type: 'acid', concentration: 0.1 },

  // == Strong Bases ==
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'base', concentration: 0.1 },
  { id: 'koh', name: 'Potassium Hydroxide', formula: 'KOH', type: 'base', concentration: 0.1 },
  { id: 'caoh2', name: 'Calcium Hydroxide', formula: 'Ca(OH)₂', type: 'base', concentration: 0.1 },
  
  // == Weak Bases ==
  { id: 'nh3', name: 'Ammonia', formula: 'NH₃', type: 'base', concentration: 0.1 },
  { id: 'ch3nh2', name: 'Methylamine', formula: 'CH₃NH₂', type: 'base', concentration: 0.1 },
  
  // == Indicators ==
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'C₂₀H₁₄O₄', type: 'indicator' },
  { id: 'methyl-orange', name: 'Methyl Orange', formula: 'C₁₄H₁₄N₃NaO₃S', type: 'indicator' },
  { id: 'bromothymol-blue', name: 'Bromothymol Blue', formula: 'C₂₇H₂₈Br₂O₅S', type: 'indicator' },
  { id: 'litmus', name: 'Litmus', formula: 'N/A', type: 'indicator' },

  // == Common Salts ==
  { id: 'nacl', name: 'Sodium Chloride', formula: 'NaCl', type: 'salt' },
  { id: 'cuso4', name: 'Copper(II) Sulfate', formula: 'CuSO₄', type: 'salt' },
  { id: 'kno3', name: 'Potassium Nitrate', formula: 'KNO₃', type: 'salt' },
  { id: 'nahco3', name: 'Sodium Bicarbonate', formula: 'NaHCO₃', type: 'salt' },
  { id: 'agcl', name: 'Silver Chloride', formula: 'AgCl', type: 'salt' },
  { id: 'kmno4', name: 'Potassium Permanganate', formula: 'KMnO₄', type: 'oxidant' },

  // == Common Solvents ==
  { id: 'h2o', name: 'Distilled Water', formula: 'H₂O', type: 'solvent' },
  { id: 'ethanol', name: 'Ethanol', formula: 'C₂H₅OH', type: 'solvent' },
  { id: 'methanol', name: 'Methanol', formula: 'CH₃OH', type: 'solvent' },
  { id: 'isopropanol', name: 'Isopropanol', formula: 'C₃H₈O', type: 'solvent' },
  { id: 'acetone', name: 'Acetone', formula: 'C₃H₆O', type: 'solvent' },

  // == Other ==
  { id: 'h2o2', name: 'Hydrogen Peroxide', formula: 'H₂O₂', type: 'oxidant', concentration: 0.3 },
];


export const COMMON_CHEMICAL_IDS = [
  'hcl',
  'naoh',
  'ch3cooh',
  'nh3',
  'phenolphthalein',
  'methyl-orange',
  'bromothymol-blue',
  'nacl',
  'cuso4',
  'h2o',
  'ethanol',
];
