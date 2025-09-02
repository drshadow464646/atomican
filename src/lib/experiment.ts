
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
  size?: number; // scale factor, e.g., 1 for 100%
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

export const INITIAL_EQUIPMENT: Equipment[] = [
    { id: 'beaker-250', name: '250ml Beaker', type: 'beaker', volume: 250, description: 'A cylindrical container used for holding, mixing, and heating liquids.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'burette-50', name: '50ml Burette', type: 'burette', volume: 50, description: 'A graduated glass tube with a tap at one end, for delivering known volumes of a liquid, especially in titrations.', position: {x: 0, y: 0}, isSelected: false },
];

export const ALL_EQUIPMENT: Equipment[] = [
    { id: 'beaker-250', name: '250ml Beaker', type: 'beaker', volume: 250, description: 'A cylindrical container used for holding, mixing, and heating liquids.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'erlenmeyer-flask', name: '250ml Erlenmeyer Flask', type: 'erlenmeyer-flask', volume: 250, description: 'A conical flask with a narrow neck, used to hold and mix chemicals. The small neck helps prevent splashes.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'graduated-cylinder', name: '100ml Graduated Cylinder', type: 'graduated-cylinder', volume: 100, description: 'A piece of laboratory equipment used to measure the volume of a liquid. It is generally more accurate than a beaker.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'burette-50', name: '50ml Burette', type: 'burette', volume: 50, description: 'A graduated glass tube with a tap at one end, for delivering known volumes of a liquid, especially in titrations.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'pipette', name: '10ml Pipette', type: 'pipette', volume: 10, description: 'A laboratory tool used to transport a measured volume of liquid, often as a media dispenser.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'thermometer', name: 'Digital Thermometer', type: 'measurement', description: 'Used to measure temperature with high precision.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'ph-meter', name: 'pH Meter', type: 'measurement', description: 'A scientific instrument that measures the hydrogen-ion activity in water-based solutions.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'hot-plate', name: 'Hot Plate Stirrer', type: 'heating', description: 'A portable self-contained tabletop appliance that features one or more electric heating elements or gas burners.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'analytical-balance', name: 'Analytical Balance', type: 'measurement', description: 'A highly sensitive lab instrument designed to accurately measure mass.', position: {x: 0, y: 0}, isSelected: false },
    { id: 'microscope', name: 'Compound Microscope', type: 'microscopy', description: 'A high-power microscope that uses a compound lens system for observing small specimens.', position: {x: 0, y: 0}, isSelected: false },
];


export const INITIAL_CHEMICALS: Chemical[] = [
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'acid', concentration: 0.1 },
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'base', concentration: 0.1 },
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'C20H14O4', type: 'indicator' },
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
        const remainingMolesOH = initialMolesOH - addedMolesH;
        const concentrationOH = remainingMolesOH / totalVolumeL;
        const pOH = -Math.log10(concentrationOH);
        return 14 - pOH;
    } else if (addedMolesH > initialMolesH) {
        const excessMolesH = addedMolesH - initialMolesH;
        const concentrationH = excessMolesH / totalVolumeL;
        return -Math.log10(concentrationH);
    } else {
        return 7; // Equivalence point for strong acid-strong base
    }
  }

  return 7; // Default pH if conditions aren't met
}
