
import type { ExperimentStepSuggestionOutput } from "@/ai/flows/ai-guided-experiment-steps";

export type Chemical = {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base' | 'indicator' | 'salt' | 'solvent' | 'oxidant' | 'reductant';
  concentration?: number; // Molarity (mol/L)
};

export type Equipment = {
  id: 'beaker-250' | 'burette-50' | 'pipette-25' | 'grad-cyl-100';
  name: string;
  type: 'beaker' | 'burette' | 'pipette' | 'cylinder';
  volume?: number; // in ml
};

export type Solution = {
  chemical: Chemical;
  volume: number; // in ml
};

export type ExperimentState = {
  equipment: Equipment[];
  beaker: {
    solutions: Solution[];
    indicator: Chemical | null;
  } | null;
  burette: Solution | null;
  volumeAdded: number; // in ml
  ph: number | null;
  color: string;
};

export type LabLog = {
  id: number;
  timestamp: string; // Use ISO string for consistency
  text: string;
  isCustom?: boolean;
};

export type AiSuggestion = ExperimentStepSuggestionOutput | null;

export const INITIAL_EQUIPMENT: Equipment[] = [
  { id: 'beaker-250', name: '250ml Beaker', type: 'beaker', volume: 250 },
  { id: 'burette-50', name: '50ml Burette', type: 'burette', volume: 50 },
];

export const INITIAL_CHEMICALS: Chemical[] = [
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'acid', concentration: 0.1 },
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'base', concentration: 0.1 },
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'C20H14O4', type: 'indicator' },
];

export const ALL_CHEMICALS: Chemical[] = [
  // Strong Acids
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'acid', concentration: 0.1 },
  { id: 'h2so4', name: 'Sulfuric Acid', formula: 'H₂SO₄', type: 'acid', concentration: 0.1 },
  { id: 'hno3', name: 'Nitric Acid', formula: 'HNO₃', type: 'acid', concentration: 0.1 },
  { id: 'hbr', name: 'Hydrobromic Acid', formula: 'HBr', type: 'acid', concentration: 0.1 },
  { id: 'hi', name: 'Hydroiodic Acid', formula: 'HI', type: 'acid', concentration: 0.1 },
  { id: 'hclo4', name: 'Perchloric Acid', formula: 'HClO₄', type: 'acid', concentration: 0.1 },

  // Weak Acids
  { id: 'ch3cooh', name: 'Acetic Acid', formula: 'CH₃COOH', type: 'acid', concentration: 0.1 },
  { id: 'hcooh', name: 'Formic Acid', formula: 'HCOOH', type: 'acid', concentration: 0.1 },
  { id: 'hf', name: 'Hydrofluoric Acid', formula: 'HF', type: 'acid', concentration: 0.1 },
  { id: 'hcn', name: 'Hydrocyanic Acid', formula: 'HCN', type: 'acid', concentration: 0.1 },
  { id: 'h3po4', name: 'Phosphoric Acid', formula: 'H₃PO₄', type: 'acid', concentration: 0.1 },
  { id: 'h2co3', name: 'Carbonic Acid', formula: 'H₂CO₃', type: 'acid', concentration: 0.1 },

  // Strong Bases
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'base', concentration: 0.1 },
  { id: 'koh', name: 'Potassium Hydroxide', formula: 'KOH', type: 'base', concentration: 0.1 },
  { id: 'lioh', name: 'Lithium Hydroxide', formula: 'LiOH', type: 'base', concentration: 0.1 },
  { id: 'ca(oh)2', name: 'Calcium Hydroxide', formula: 'Ca(OH)₂', type: 'base', concentration: 0.02 },
  { id: 'ba(oh)2', name: 'Barium Hydroxide', formula: 'Ba(OH)₂', type: 'base', concentration: 0.1 },
  
  // Weak Bases
  { id: 'nh3', name: 'Ammonia', formula: 'NH₃', type: 'base', concentration: 0.1 },
  { id: 'c5h5n', name: 'Pyridine', formula: 'C₅H₅N', type: 'base', concentration: 0.1 },
  { id: 'nh4oh', name: 'Ammonium Hydroxide', formula: 'NH₄OH', type: 'base', concentration: 0.1 },
  { id: 'ch3nh2', name: 'Methylamine', formula: 'CH₃NH₂', type: 'base', concentration: 0.1 },

  // Indicators
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'C₂₀H₁₄O₄', type: 'indicator' },
  { id: 'methyl_orange', name: 'Methyl Orange', formula: 'C₁₄H₁₄N₃NaO₃S', type: 'indicator' },
  { id: 'bromothymol_blue', name: 'Bromothymol Blue', formula: 'C₂₇H₂₈Br₂O₅S', type: 'indicator' },
  { id: 'litmus', name: 'Litmus', formula: 'N/A', type: 'indicator' },
  { id: 'crystal_violet', name: 'Crystal Violet', formula: 'C₂₅H₃₀ClN₃', type: 'indicator' },

  // Common Salts
  { id: 'nacl', name: 'Sodium Chloride', formula: 'NaCl', type: 'salt' },
  { id: 'kcl', name: 'Potassium Chloride', formula: 'KCl', type: 'salt' },
  { id: 'mgso4', name: 'Magnesium Sulfate', formula: 'MgSO₄', type: 'salt' },
  { id: 'cuso4', name: 'Copper(II) Sulfate', formula: 'CuSO₄', type: 'salt' },
  { id: 'nano3', name: 'Sodium Nitrate', formula: 'NaNO₃', type: 'salt' },
  { id: 'kno3', name: 'Potassium Nitrate', formula: 'KNO₃', type: 'salt' },
  { id: 'nh4cl', name: 'Ammonium Chloride', formula: 'NH₄Cl', type: 'salt' },
  { id: 'na2co3', name: 'Sodium Carbonate', formula: 'Na₂CO₃', type: 'salt' },
  { id: 'cacl2', name: 'Calcium Chloride', formula: 'CaCl₂', type: 'salt' },
  
  // Solvents
  { id: 'h2o', name: 'Distilled Water', formula: 'H₂O', type: 'solvent' },
  { id: 'c2h5oh', name: 'Ethanol', formula: 'C₂H₅OH', type: 'solvent' },
  { id: 'ch3oh', name: 'Methanol', formula: 'CH₃OH', type: 'solvent' },
  { id: 'c3h6o', name: 'Acetone', formula: '(CH₃)₂CO', type: 'solvent' },
  
  // Oxidizing Agents
  { id: 'kmno4', name: 'Potassium Permanganate', formula: 'KMnO₄', type: 'oxidant', concentration: 0.02 },
  { id: 'k2cr2o7', name: 'Potassium Dichromate', formula: 'K₂Cr₂O₇', type: 'oxidant', concentration: 0.1 },
  { id: 'h2o2', name: 'Hydrogen Peroxide', formula: 'H₂O₂', type: 'oxidant', concentration: 0.1 },
  
  // Reducing Agents
  { id: 'na2s2o3', name: 'Sodium Thiosulfate', formula: 'Na₂S₂O₃', type: 'reductant', concentration: 0.1 },
  { id: 'h2c2o4', name: 'Oxalic Acid', formula: 'H₂C₂O₄', type: 'reductant', concentration: 0.1 },
];


export function calculatePH(state: ExperimentState): number {
  if (!state.beaker) return 7;

  const acidSolution = state.beaker.solutions.find(s => s.chemical.type === 'acid');
  const baseSolutionInBeaker = state.beaker.solutions.find(s => s.chemical.type === 'base');
  const titrant = state.burette;
  
  if (!titrant) return 7; // Can't calculate pH without a titrant

  // Titrating base into acid
  if (acidSolution && titrant.chemical.type === 'base') {
    if (!acidSolution.chemical.concentration || !titrant.chemical.concentration) return 7;

    const initialMolesH = (acidSolution.volume / 1000) * acidSolution.chemical.concentration;
    const addedMolesOH = (state.volumeAdded / 1000) * titrant.chemical.concentration;
    const totalVolumeL = (acidSolution.volume + state.volumeAdded) / 1000;

    if (addedMolesOH < initialMolesH) {
      const remainingMolesH = initialMolesH - addedMolesOH;
      const concentrationH = remainingMolesH / totalVolumeL;
      return -Math.log10(concentrationH);
    } else if (addedMolesOH > initialMolesH) {
      const excessMolesOH = addedMolesOH - initialMolesH;
      const concentrationOH = excessMolesOH / totalVolumeL;
      const pOH = -Math.log10(concentrationOH);
      return 14 - pOH;
    } else {
      return 7; // Equivalence point for strong acid-strong base
    }
  }

  // Titrating acid into base
  if (baseSolutionInBeaker && titrant.chemical.type === 'acid') {
    if (!baseSolutionInBeaker.chemical.concentration || !titrant.chemical.concentration) return 7;

    const initialMolesOH = (baseSolutionInBeaker.volume / 1000) * baseSolutionInBeaker.chemical.concentration;
    const addedMolesH = (state.volumeAdded / 1000) * titrant.chemical.concentration;
    const totalVolumeL = (baseSolutionInBeaker.volume + state.volumeAdded) / 1000;
    
    if (addedMolesH < initialMolesOH) {
        const remainingMolesOH = initialMolesOH - initialMolesOH;
        const concentrationOH = remainingMolesOH / totalVolumeL;
        const pOH = -Math.log10(concentrationOH);
        return 14 - pOH;
    } else if (addedMolesH > initialMolesOH) {
        const excessMolesH = addedMolesH - initialMolesOH;
        const concentrationH = excessMolesH / totalVolumeL;
        return -Math.log10(concentrationH);
    } else {
        return 7; // Equivalence point for strong acid-strong base
    }
  }

  return 7; // Default pH if conditions aren't met
}

    