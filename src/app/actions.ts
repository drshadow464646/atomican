
'use server';

import { generateExperimentSteps } from "@/ai/flows/ai-guided-experiment-steps";
import type { GenerateExperimentStepsOutput } from "@/ai/flows/ai-guided-experiment-steps";
import { searchApparatus } from "@/ai/flows/apparatus-search";
import type { ApparatusSearchOutput } from "@/ai/flows/apparatus-search";
import { searchChemicals } from "@/ai/flows/chemical-search";
import type { ChemicalSearchOutput } from "@/ai/flows/chemical-search";


/**
 * Executes a direct API call to OpenRouter to generate experiment steps.
 * This bypasses the Genkit flow for greater reliability with the OpenRouter API.
 * @param goal The user's goal for the experiment.
 * @returns The generated experiment steps.
 */
export async function getExperimentSteps(goal: string): Promise<GenerateExperimentStepsOutput> {
  // Directly calling the new implementation which doesn't use Genkit for this specific flow.
  return generateExperimentSteps(goal);
}

/**
 * Calls the AI flow to search for laboratory apparatus.
 * @param query The search query.
 * @returns A list of apparatus matching the query.
 */
export async function findApparatus(query: string): Promise<ApparatusSearchOutput> {
    return searchApparatus(query);
}

/**
 * Calls the AI flow to search for laboratory chemicals.
 * @param query The search query.
 * @returns A list of chemicals matching the query.
 */
export async function findChemicals(query: string): Promise<ChemicalSearchOutput> {
    return searchChemicals(query);
}
