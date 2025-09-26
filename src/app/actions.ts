
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
  } catch (error) {
    console.error('Error generating experiment steps:', error);
    // Return a structured error object that includes the specific error message.
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      title: 'Error Generating Procedure',
      requiredApparatus: [],
      requiredChemicals: [],
      steps: [
        'An error occurred while generating the procedure. Details below:',
        errorMessage,
      ],
    };
  }
}
