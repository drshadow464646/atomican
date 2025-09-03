
import type { ExperimentStepSuggestionOutput } from "@/ai/flows/ai-guided-experiment-steps";

export type Chemical = {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base' | 'indicator' | 'salt' | 'solvent' | 'oxidant' | 'reductant' | 'other';
  concentration?: number; // Molarity (mol/L)
};

export type Equipment = {
  id: string;
  name: string;
  type: 'beaker' | 'burette' | 'pipette' | 'graduated-cylinder' | 'erlenmeyer-flask' | 'volumetric-flask' | 'test-tube' | 'funnel' | 'heating' | 'measurement' | 'microscopy' | 'other';
  volume?: number; // in ml
  description: string;
  size: number; // scale factor, e.g., 1 for 100%
  position: { x: number; y: number };
  isSelected: boolean;
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
  id: string;
  timestamp: string; // Use ISO string for consistency
  text: string;
  isCustom?: boolean;
};

export type AiSuggestion = ExperimentStepSuggestionOutput | null;

export const INITIAL_CHEMICALS: Chemical[] = [
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'acid', concentration: 0.1 },
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'base', concentration: 0.1 },
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'C20H14O4', type: 'indicator' },
];


export function calculatePH(state: ExperimentState): number {
  if (!state.beaker || !state.beaker.solutions.length) return 7;

  const analyteSolution = state.beaker.solutions[0];
  const titrant = state.burette;
  
  if (!titrant || !analyteSolution) return 7;

  // Titrating base into acid
  if (analyteSolution.chemical.type === 'acid' && titrant.chemical.type === 'base') {
    if (!analyteSolution.chemical.concentration || !titrant.chemical.concentration) return 7;

    const initialMolesH = (analyteSolution.volume / 1000) * analyteSolution.chemical.concentration;
    const addedMolesOH = (state.volumeAdded / 1000) * titrant.chemical.concentration;
    const totalVolumeL = (analylohyte.volume + state.volumeAdded) / 1000;

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
  if (analyteSolution.chemical.type === 'base' && titrant.chemical.type === 'acid') {
    if (!analyteSolution.chemical.concentration || !titrant.chemical.concentration) return 7;

    const initialMolesOH = (analyteSolution.volume / 1000) * analyteSolution.chemical.concentration;
    const addedMolesH = (state.volumeAdded / 1000) * titrant.chemical.concentration;
    const totalVolumeL = (analyteSolution.volume + state.volumeAdded) / 1000;
    
    if (addedMolesH < initialMolesOH) {
        const remainingMolesOH = initialMolesOH - addedMolesH;
        const concentrationOH = remainingMolesOH / totalVolumeL;
        const pOH = -Math.log10(concentrationOH);
        return 14 - pOH;
    } else if (addedMolesH > initialMolesOH) {
        const excessMolesH = addedMolesH - initialMolesH;
        const concentrationH = excessMolesH / totalVolumeL;
        return -Math.log10(concentrationH);
    } else {
        return 7; // Equivalence point for strong acid-strong base
    }
  }

  return 7; // Default pH if conditions aren't met
}
