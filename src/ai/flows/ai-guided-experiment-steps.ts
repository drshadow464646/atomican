'use server';
/**
 * @fileOverview Provides AI-driven suggestions for experiment steps in a virtual chemistry lab.
 *
 * - getExperimentStepSuggestion - A function that suggests the next step in an experiment.
 * - ExperimentStepSuggestionInput - The input type for the getExperimentStepSuggestion function.
 * - ExperimentStepSuggestionOutput - The return type for the getExperimentStepSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExperimentStepSuggestionInputSchema = z.object({
  currentStep: z.string().describe('The current step the student is on in the experiment.'),
  experimentData: z
    .string()
    .describe('Real-time data from the experiment, including measurements, observations, and previous actions.'),
  studentActions: z
    .string()
    .describe('A description of the actions the student has taken so far in the experiment.'),
});
export type ExperimentStepSuggestionInput = z.infer<typeof ExperimentStepSuggestionInputSchema>;

const ExperimentStepSuggestionOutputSchema = z.object({
  nextStepSuggestion: z
    .string()
    .describe('The AI-suggested next step for the student to take in the experiment.'),
  hint: z.string().optional().describe('A helpful hint or tip for the student to consider.'),
  rationale:
      z.string().optional().describe('Explanation of the suggestion.'),
});
export type ExperimentStepSuggestionOutput = z.infer<typeof ExperimentStepSuggestionOutputSchema>;

export async function getExperimentStepSuggestion(input: ExperimentStepSuggestionInput): Promise<ExperimentStepSuggestionOutput> {
  return experimentStepSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'experimentStepSuggestionPrompt',
  input: {schema: ExperimentStepSuggestionInputSchema},
  output: {schema: ExperimentStepSuggestionOutputSchema},
  prompt: `You are a virtual chemistry lab assistant that assists students by providing the next steps.

  The current step is: {{{currentStep}}}
  The student\'s prior actions: {{{studentActions}}}
  Here is the current experiment data: {{{experimentData}}}

  Based on this information, what should the student do next? Provide a suggestion for the next step, a hint if applicable, and a rationale for your suggestion.
  Always be concise and guide the student towards completing the experiment successfully.
  Do not provide more steps than what is asked, only provide the single immediate next step.
  `,
});

const experimentStepSuggestionFlow = ai.defineFlow(
  {
    name: 'experimentStepSuggestionFlow',
    inputSchema: ExperimentStepSuggestionInputSchema,
    outputSchema: ExperimentStepSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
