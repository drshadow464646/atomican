
'use server';
/**
 * @fileOverview A flow that generates experiment steps based on a user's goal.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { gemini15Pro } from '@genkit-ai/googleai';

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

const experimentGenerationPrompt = ai.definePrompt(
  {
    name: 'experimentGenerationPrompt',
    input: { schema: z.string() },
    output: { schema: ExperimentStepsSchema, format: 'json' },
    model: gemini15Pro,
    system: `You are a helpful chemistry lab assistant. Your role is to take a user's goal and generate a clear, concise, and safe experimental procedure.

The user will provide a goal for an experiment. You must provide a valid JSON object that conforms to the output schema.

Your response must include:
1.  A 'title' for the experiment.
2.  A list of 'requiredApparatus', including specific sizes (e.g., "250ml Beaker").
3.  A list of 'requiredChemicals', including concentrations (e.g., "0.1M HCl").
4.  A series of 'steps' that are easy to follow.

Prioritize safety and clarity in the procedure.
Do not include any steps for cleaning up.
Do not wrap your response in markdown tags.
`,
  },
  async (goal) => {
    return {
      prompt: `Generate an experiment procedure for the following goal: ${goal}`,
    };
  }
);

export const experimentStepsFlow = ai.defineFlow(
  {
    name: 'experimentStepsFlow',
    inputSchema: z.string(),
    outputSchema: ExperimentStepsSchema,
  },
  async (goal) => {
    const { output } = await experimentGenerationPrompt(goal);
    if (!output) {
      throw new Error('Failed to generate experiment steps.');
    }
    return output;
  }
);
