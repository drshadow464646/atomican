import type { ExperimentStepSuggestionOutput } from "@/ai/flows/ai-guided-experiment-steps";

export type Chemical = {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base' | 'indicator';
  concentration?: number; // Molarity (mol/L)
};

export type Equipment = {
  id: string;
  name: string;
  type: 'beaker' | 'burette' | 'pipette';
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
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: '', type: 'indicator' },
];

export function calculatePH(state: ExperimentState): number {
  if (!state.beaker) return 7;

  const acidSolution = state.beaker.solutions.find(s => s.chemical.type === 'acid');
  const baseSolution = state.burette;
  
  if (!acidSolution || !baseSolution || !acidSolution.chemical.concentration || !baseSolution.chemical.concentration) return 7;

  const initialMolesH = (acidSolution.volume / 1000) * acidSolution.chemical.concentration;
  const addedMolesOH = (state.volumeAdded / 1000) * baseSolution.chemical.concentration;
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
    // Equivalence point
    return 7;
  }
}
