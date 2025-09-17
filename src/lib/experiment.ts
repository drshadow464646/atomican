
import type { ExperimentStepSuggestionOutput } from "@/ai/flows/ai-guided-experiment-steps";

export type Chemical = {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base' | 'indicator' | 'salt' | 'solvent' | 'oxidant' | 'reductant' | 'other';
  concentration?: number; // Molarity (mol/L)
};

export type Equipment = {
  id:string;
  name: string;
  type: 'beaker' | 'burette' | 'pipette' | 'graduated-cylinder' | 'erlenmeyer-flask' | 'volumetric-flask' | 'test-tube' | 'funnel' | 'heating' | 'measurement' | 'microscopy' | 'other' | 'glassware' | 'vacuum' | 'safety';
  volume?: number; // in ml
  description: string;
  size: number; // scale factor, e.g., 1 for 100%
  position: { x: number; y: number };
  isSelected: boolean;
  solutions: Solution[];
  ph?: number;
  color?: string;
};

export type Solution = {
  chemical: Chemical;
  volume: number; // in ml
};

export type ExperimentState = {
  title: string;
  equipment: Equipment[];
  // Legacy state, to be deprecated
  volumeAdded: number; // in ml, legacy for simple titration
  ph: number | null; // legacy
  color: string; // legacy
};

export type LabLog = {
  id: string;
  timestamp: string; // Use ISO string for consistency
  text: string;
  isCustom?: boolean;
};

export type AiSuggestion = ExperimentStepSuggestionOutput | null;

export function calculatePH(solutions: Solution[]): number {
  if (!solutions || solutions.length === 0) return 7;

  let molesH = 0;
  let molesOH = 0;
  let totalVolumeL = 0;

  for (const solution of solutions) {
    // Ignore indicators in pH calculation
    if (solution.chemical.type === 'indicator') continue;

    const volumeL = solution.volume / 1000;
    totalVolumeL += volumeL;

    if (solution.chemical.type === 'acid' && solution.chemical.concentration) {
      molesH += volumeL * solution.chemical.concentration;
    } else if (solution.chemical.type === 'base' && solution.chemical.concentration) {
      molesOH += volumeL * solution.chemical.concentration;
    }
  }

  if (totalVolumeL === 0) return 7;

  if (molesH > molesOH) {
    const remainingMolesH = molesH - molesOH;
    const concentrationH = remainingMolesH / totalVolumeL;
    if (concentrationH <= 0) return 7;
    return -Math.log10(concentrationH);
  } else if (molesOH > molesH) {
    const remainingMolesOH = molesOH - molesH;
    const concentrationOH = remainingMolesOH / totalVolumeL;
    if (concentrationOH <= 0) return 7;
    const pOH = -Math.log10(concentrationOH);
    return 14 - pOH;
  } else {
    return 7; // Equivalence point
  }
}

export function getIndicatorColor(indicatorId: string, ph: number): string {
    switch(indicatorId) {
        case 'phenolphthalein':
            if (ph < 8.2) return 'transparent'; // Colorless
            if (ph >= 8.2 && ph <= 10) return 'hsl(300 100% 80% / 0.5)'; // Pink
            return 'hsl(300 100% 60% / 0.7)'; // Fuchsia
        case 'methyl-orange':
            if (ph < 3.1) return 'hsl(0 100% 60% / 0.6)'; // Red
            if (ph >= 3.1 && ph <= 4.4) return 'hsl(30 100% 60% / 0.6)'; // Orange
            return 'hsl(60 100% 60% / 0.6)'; // Yellow
        case 'bromothymol-blue':
            if (ph < 6.0) return 'hsl(60 100% 50% / 0.6)'; // Yellow
            if (ph >= 6.0 && ph <= 7.6) return 'hsl(120 100% 80% / 0.6)'; // Green
            return 'hsl(240 100% 60% / 0.6)'; // Blue
        default:
            return 'transparent';
    }
}
