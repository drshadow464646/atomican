import {genkit} from 'genkit';

// Note: The Genkit instance is configured dynamically in `src/ai/dev.ts`.
// This allows for different configurations between development and production.
// The `ai` export from here will be populated with the plugins defined in `dev.ts`
// when running in a development environment.
export const ai = genkit();
