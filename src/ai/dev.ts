
import { config } from 'dotenv';
config();

import { genkit, type Plugin } from 'genkit';
import { GENKIT_CLIENT_HEADER } from 'genkit/client';
import {
  openai,
  type OpenAIGenerateRequest,
  type OpenAIGenerateRequestTool,
  type OpenAIModel,
} from '@genkit-ai/openai/internal';

// This file is the entry point for Genkit development.
// It is used by the `genkit:dev` and `genkit:watch` scripts.
//
// It loads the AI flows defined in the application.

const openRouter = (
  name: string,
  modelName: string,
  isTool?: boolean
): OpenAIModel => {
  return openai(
    name,
    {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: { 'HTTP-Referer': 'http://localhost:3000' },
    },
    {
      model: modelName,
      transform: {
        request: (req: OpenAIGenerateRequest) => {
          if (isTool) {
            req.tool_choice = 'auto';
          }
          return req;
        },
      },
    }
  );
};

const glm = openRouter(
  'glm',
  'z-ai/glm-4.5-air:free',
  true
);
const gemma = openRouter('gemma', 'google/gemma-3n-e2b-it:free');

const plugins: Plugin[] = [glm, gemma];

genkit({
  plugins,
});

import '@/ai/flows/ai-guided-experiment-steps.ts';
