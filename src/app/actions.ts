
'use server';

import { generateExperimentSteps } from "@/ai/flows/ai-guided-experiment-steps";
import type { GenerateExperimentStepsOutput } from "@/ai/flows/ai-guided-experiment-steps";
import { searchApparatus } from "@/ai/flows/apparatus-search";
import type { ApparatusSearchOutput } from "@/ai/flows/apparatus-search";
import { searchChemicals } from "@/ai/flows/chemical-search";
import type { ChemicalSearchOutput } from "@/ai/flows/chemical-search";
import { predictReaction } from "@/ai/flows/chemical-reaction";
import type { ReactionPrediction, Solution } from "@/lib/experiment";

export async function getExperimentSteps(goal: string): Promise<GenerateExperimentStepsOutput> {
  return generateExperimentSteps(goal);
}

export async function findApparatus(query: string): Promise<ApparatusSearchOutput> {
    return searchApparatus(query);
}

export async function findChemicals(query: string): Promise<ChemicalSearchOutput> {
    return searchChemicals(query);
}

export async function getReactionPrediction(solutions: Solution[]): Promise<ReactionPrediction> {
    return predictReaction(solutions);
}
