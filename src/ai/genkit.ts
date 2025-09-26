/**
 * @fileoverview This file initializes and configures the Genkit AI object.
 *
 * This configured `ai` object should be imported into all server-side
 * files that need to interact with Genkit.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
