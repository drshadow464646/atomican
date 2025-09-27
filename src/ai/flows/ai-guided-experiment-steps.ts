
'use server';
/**
 * @fileOverview A flow that generates experiment steps based on a user's goal.
 *
 * NOTE: This Genkit flow has been disabled and bypassed.
 * The logic has been moved to a direct fetch call in `src/app/actions.ts`
 * to resolve API compatibility issues with OpenRouter.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

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

// This flow is currently not used. See src/app/actions.ts
export const experimentStepsFlow = ai.defineFlow(
  {
    name: 'experimentStepsFlow_DISABLED',
    inputSchema: z.string(),
    outputSchema: ExperimentStepsSchema,
  },
  async (goal) => {
    throw new Error("This flow is disabled. Use the server action in `src/app/actions.ts` instead.");
  }
);
