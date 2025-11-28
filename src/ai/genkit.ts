// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Export instance 'ai' ini untuk dipakai di file lain
export const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-1.5-flash',
});
