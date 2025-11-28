// ✅ Cukup import library utamanya saja
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Lanjutkan dengan inisialisasi
export const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-1.5-flash', // atau model lain
});
