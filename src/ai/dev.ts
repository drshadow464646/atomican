/**
 * @fileoverview This file is the entrypoint for the Genkit developer UI.
 *
 * It is not used in the Next.js application itself.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { configure, defineDotprompt } from '@genkit-ai/dotprompt';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

configure({
  promptStore: {
    loader: (name) =>
      defineDotprompt(
        {
          name,
          prompt: async () =>
            (await import(path.join(process.cwd(), 'prompts', `${name}.prompt`))).default,
        },
      ),
  },
});

export default genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
