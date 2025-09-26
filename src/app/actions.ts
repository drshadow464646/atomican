
'use server';

import { experimentStepsFlow, type GenerateExperimentStepsOutput } from "@/ai/flows/ai-guided-experiment-steps";

/**
 * Executes the AI flow to generate experiment steps based on a user's goal.
 * @param goal The user's goal for the experiment.
 * @returns The generated experiment steps.
 */
export async function getExperimentSteps(goal: string): Promise<GenerateExperimentStepsOutput> {
  // This feature is temporarily disabled and returns a static message.
  // The underlying issue is related to Google Cloud project configuration
  // where the necessary Gemini models are not enabled or accessible.
  return {
    title: 'AI Feature Disabled',
    requiredApparatus: [],
    requiredChemicals: [],
    steps: [
      'The AI Procedure Generation feature is currently disabled due to a persistent model access issue.',
      'Error: "NOT_FOUND: Model \'gemini-pro\' not found".',
      'This indicates that the necessary AI models are not enabled for your Google Cloud project.',
      'To fix this, please visit the Google Cloud Console, ensure you are in the correct project, and enable the "Vertex AI API" or "Generative Language API". You may need to check model availability in your region.',
    ],
  };
}
