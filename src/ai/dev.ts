
import { config } from 'dotenv';
config();

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This file is the entry point for Genkit development.
// It is used by the `genkit:dev` and `genkit:watch` scripts.
//
// It loads the AI flows defined in the application.

genkit({
  plugins: [
    googleAI(),
  ],
});

import '@/ai/flows/ai-guided-experiment-steps.ts';
