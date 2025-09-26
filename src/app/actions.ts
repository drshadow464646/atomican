
'use server';

import { experimentStepsFlow, type GenerateExperimentStepsOutput } from "@/ai/flows/ai-guided-experiment-steps";

/**
 * Executes the AI flow to generate experiment steps based on a user's goal.
 * @param goal The user's goal for the experiment.
 * @returns The generated experiment steps.
 */
export async function getExperimentSteps(goal: string): Promise<GenerateExperimentStepsOutput> {
  try {
    const result = await experimentStepsFlow(goal);
    return result;
  } catch (error: any) {
    console.error("Error generating procedure:", error);
    // Return a structured error that the frontend can display
    return {
      title: 'Error Generating Procedure',
      requiredApparatus: [],
      requiredChemicals: [],
      steps: [
        'An error occurred while generating the procedure. Details below:',
        error.message || 'An unknown error occurred.',
      ],
    };
  }
}
