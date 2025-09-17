'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { firebase } from "firebase-admin";

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: 'gemini-pro',
});
