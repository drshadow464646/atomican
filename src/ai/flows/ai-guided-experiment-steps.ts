'use server';
/**
 * @fileOverview Provides AI-driven generation of experiment steps for a virtual chemistry lab.
 *
 * - generateExperimentSteps - A function that creates a step-by-step procedure for a given experiment goal.
 * - GenerateExperimentStepsInput - The input type for the generateExperimentSteps function.
 * - GenerateExperimentStepsOutput - The return type for the generateExperimentSteps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExperimentStepsInputSchema = z.object({
  goal: z.string().describe('The overall goal of the chemistry experiment the user wants to perform.'),
});
export type GenerateExperimentStepsInput = z.infer<typeof GenerateExperimentStepsInputSchema>;

const GenerateExperimentStepsOutputSchema = z.object({
  title: z.string().describe('A concise title for the experiment.'),
  steps: z.array(z.string()).describe('A list of step-by-step instructions to complete the experiment.'),
  requiredChemicals: z.array(z.string()).describe('A list of required chemical names for this experiment.'),
  requiredApparatus: z.array(z.string()).describe('A list of required apparatus names for this experiment.'),
});
export type GenerateExperimentStepsOutput = z.infer<typeof GenerateExperimentStepsOutputSchema>;

export async function generateExperimentSteps(input: GenerateExperimentStepsInput): Promise<GenerateExperimentStepsOutput> {
  return experimentStepsGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'experimentStepsGenerationPrompt',
  input: {schema: GenerateExperimentStepsInputSchema},
  output: {
    schema: GenerateExperimentStepsOutputSchema,
    format: 'json',
  },
  model: ['nemotron', 'kimi'],
  prompt: `You are a virtual chemistry lab assistant that designs experiment procedures for students.
  The user will provide a goal for an experiment. Your task is to generate a clear, concise, step-by-step procedure to achieve this goal in a virtual lab setting.

  Experiment Goal: {{{goal}}}

  Based on this goal, generate a suitable title, a list of required chemicals, a list of required apparatus, and the procedural steps.
  The steps should be simple, direct, and easy to follow. Assume standard lab equipment is available.
  Focus on the core actions of the experiment.

  Your response MUST be in the format of the specified JSON schema.
  `,
});

const experimentStepsGenerationFlow = ai.defineFlow(
  {
    name: 'experimentStepsGenerationFlow',
    inputSchema: GenerateExperimentStepsInputSchema,
    outputSchema: GenerateExperimentStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
