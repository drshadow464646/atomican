
'use server';
/**
 * @fileOverview A flow that generates experiment steps based on a user's goal.
 * This has been refactored to use a direct API call for reliability.
 */
import { z } from 'zod';
import { callOpenRouterWithFallback } from './openrouter-fallback';

const ExperimentStepsSchema = z.object({
  title: z.string().describe('A short, descriptive title for the experiment.'),
  requiredApparatus: z.array(z.object({
    name: z.string().describe('The name of the apparatus, e.g., "Beaker (250ml)".'),
    quantity: z.number().describe('The number of this apparatus needed.'),
  })).describe('A list of all laboratory equipment required for the experiment.'),
  requiredChemicals: z.array(z.object({
    name: z.string().describe('The name of the chemical, e.g., "Hydrochloric Acid".'),
    amount: z.string().describe('The amount and concentration needed, e.g., "100ml of 0.1M".'),
  })).describe('A list of all chemicals and reagents required for the experiment.'),
  steps: z.array(z.string()).describe('A step-by-step procedure for conducting the experiment.'),
});

export type GenerateExperimentStepsOutput = z.infer<typeof ExperimentStepsSchema>;

/**
 * Executes a direct API call to OpenRouter to generate experiment steps.
 * @param goal The user's goal for the experiment.
 * @returns The generated experiment steps.
 */
export async function generateExperimentSteps(goal: string): Promise<GenerateExperimentStepsOutput> {
  const prompt = `You are a helpful chemistry lab assistant. Your role is to take a user's goal and generate a clear, concise, and safe experimental procedure. The user wants to: "${goal}".

You must provide a valid JSON object that conforms to the following schema:
- title: string (A short, descriptive title for the experiment.)
- requiredApparatus: Array<{name: string, quantity: number}> (A list of all laboratory equipment required for the experiment, with specific sizes like "250ml Beaker".)
- requiredChemicals: Array<{name: string, amount: string}> (A list of all chemicals and reagents required, with concentrations like "0.1M HCl".)
- steps: Array<string> (A step-by-step procedure for conducting the experiment.)

Prioritize safety and clarity in the procedure. Do not include any steps for cleaning up.

IMPORTANT: Your output MUST be only the JSON object, with no other text, markdown formatting, or explanations.`;

  try {
    const textResponse = await callOpenRouterWithFallback(prompt);
    
    if (!textResponse) {
      throw new Error("The AI returned an empty response from both models.");
    }
    
    const parsedOutput = JSON.parse(textResponse);

    // Zod validation for safety
    const validation = ExperimentStepsSchema.safeParse(parsedOutput);
    if (!validation.success) {
      console.error("Zod validation error:", validation.error.errors);
      throw new Error("AI returned data in an unexpected format.");
    }

    return validation.data;

  } catch (error: any) {
    console.error("Error generating procedure:", error);
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
