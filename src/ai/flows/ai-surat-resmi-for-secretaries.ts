'use server';

/**
 * @fileOverview This flow allows secretaries to generate draft official letters.
 *
 * - aiSuratResmiForSecretaries - A function that takes letter details and returns a draft letter.
 */

import {ai} from '@/ai/genkit';
import { 
    AiSuratResmiForSecretariesInputSchema, 
    AiSuratResmiForSecretariesOutputSchema, 
    type AiSuratResmiForSecretariesInput,
    type AiSuratResmiForSecretariesOutput
} from '@/lib/types';


// This function can be called from other server-side code.
export async function aiSuratResmiForSecretaries(
  input: AiSuratResmiForSecretariesInput
): Promise<AiSuratResmiForSecretariesOutput> {
  return aiSuratResmiForSecretariesFlow(input);
}

const aiSuratResmiForSecretariesPrompt = ai.definePrompt({
  name: 'aiSuratResmiForSecretariesPrompt',
  input: {schema: AiSuratResmiForSecretariesInputSchema},
  output: {schema: AiSuratResmiForSecretariesOutputSchema},
  prompt: `You are an expert AI assistant for an OSIS secretary, tasked with drafting official letters in Indonesian.
  
  Based on the following details, please generate a complete and formal official letter. The letter should have a professional tone and follow the standard format for official Indonesian correspondence (surat resmi).

  - Letter Type: {{{letterType}}}
  - Recipient (Tujuan Surat): {{{recipient}}}
  - Subject (Perihal): {{{subject}}}
  - Key Points for Body: {{{bodyPoints}}}

  Please generate the full letter, including a simple header (Nomor, Lampiran, Perihal), date, recipient address, opening salutation (Dengan hormat,), the main body paragraphs elaborating on the key points, a closing salutation (Hormat kami,), and a space for the signature.
  `,
});

const aiSuratResmiForSecretariesFlow = ai.defineFlow(
  {
    name: 'aiSuratResmiForSecretariesFlow',
    inputSchema: AiSuratResmiForSecretariesInputSchema,
    outputSchema: AiSuratResmiForSecretariesOutputSchema,
  },
  async input => {
    const {output} = await aiSuratResmiForSecretariesPrompt(input);
    if (!output) {
        throw new Error('Failed to generate letter from prompt.');
    }
    return output;
  }
);
